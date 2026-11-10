import {readFile,writeFile,mkdir,access,unlink} from 'node:fs/promises';
import {spawn,execFileSync} from 'node:child_process';
import {homedir} from 'node:os';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=dirname(fileURLToPath(import.meta.url));
const port=9361,app='/Applications/ChatGPT.app',exe=app+'/Contents/MacOS/ChatGPT';
const statusPath=join(root,'status.json'),lockPath=join(root,'launcher.lock');
const report=async(status,detail='')=>writeFile(statusPath,JSON.stringify({status,detail,at:new Date().toISOString()},null,2));
function listeners(){try{return execFileSync('/usr/sbin/lsof',['-nP',`-iTCP:${port}`,'-sTCP:LISTEN','-Fp'],{encoding:'utf8',stdio:['ignore','pipe','ignore']}).split('\n').filter(x=>x.startsWith('p')).map(x=>Number(x.slice(1)));}catch{return [];}}
function verified(){const pids=listeners();return pids.length>0&&pids.every(pid=>{const command=execFileSync('/bin/ps',['-ww','-p',String(pid),'-o','comm='],{encoding:'utf8'}).trim();return command===exe||command.startsWith(exe+' ');});}
function codexRunning(){try{return execFileSync('/bin/ps',['-axww','-o','comm='],{encoding:'utf8'}).split('\n').some(line=>line.trim()===exe);}catch{return false;}}
function rpc(url){return new Promise((resolve,reject)=>{const ws=new WebSocket(url);let seq=0;const pending=new Map();const timeout=setTimeout(()=>{ws.close();reject(Error('CDP connection timed out'));},5000);ws.onopen=()=>{clearTimeout(timeout);resolve({send(method,params={}){return new Promise((resolve,reject)=>{const id=++seq;const t=setTimeout(()=>{pending.delete(id);reject(Error('CDP request timed out'));},5000);pending.set(id,{resolve,reject,t});ws.send(JSON.stringify({id,method,params}));});},close(){ws.close();}});};ws.onmessage=e=>{const m=JSON.parse(e.data);const p=pending.get(m.id);if(p){clearTimeout(p.t);pending.delete(m.id);m.error?p.reject(Error(m.error.message)):p.resolve(m.result);}};ws.onerror=()=>{clearTimeout(timeout);reject(Error('CDP unavailable'));};ws.onclose=()=>{for(const p of pending.values()){clearTimeout(p.t);p.reject(Error('CDP disconnected'));}pending.clear();};});}
async function pages(){const r=await fetch(`http://127.0.0.1:${port}/json/list`,{signal:AbortSignal.timeout(3000)});return (await r.json()).filter(p=>p.type==='page'&&/^app:\/\/[^/]+\/index\.html/.test(p.url)&&p.webSocketDebuggerUrl?.startsWith(`ws://127.0.0.1:${port}/`));}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function main(){
 if(process.argv.includes('--stop')){await writeFile(join(root,'stop-request'),'');if(verified())for(const p of await pages()){const c=await rpc(p.webSocketDebuggerUrl);await c.send('Runtime.evaluate',{expression:'window.__STRANGER_AUTO__?.stop()'});c.close();}await report('removed','Quit Codex normally to close the debug port.');return;}
 try{const old=JSON.parse(await readFile(lockPath,'utf8'));try{process.kill(old.pid,0);await report('already-running');spawn('/usr/bin/open',['-a',app],{stdio:'ignore'});return;}catch{}}catch{}
 await unlink(join(root,'stop-request')).catch(()=>{});await writeFile(lockPath,JSON.stringify({pid:process.pid}));
 const cleanup=async()=>{await unlink(lockPath).catch(()=>{});};process.on('exit',()=>{});
 try{
  if(listeners().length&&!verified())throw Error('Port 9361 is occupied by another process; no connection made.');
  if(!verified()){
   if(codexRunning()){await report('restart-required','Save work and quit Codex normally, then open Stranger Codex.app. No process was terminated.');return;}
   execFileSync('/usr/bin/codesign',['--verify','--deep','--strict',app],{stdio:'ignore'});
   spawn('/usr/bin/open',['-na',app,'--args','--remote-debugging-address=127.0.0.1',`--remote-debugging-port=${port}`],{stdio:'ignore'});
   for(let i=0;i<90&&!verified();i++)await sleep(500);
   if(!verified())throw Error('Codex did not expose its local skin endpoint.');
  }
  const bundle=await readFile(join(root,'stranger-auto.js'),'utf8');const source=`(()=>{const run=()=>{${bundle}};if(document.body)run();else document.addEventListener('DOMContentLoaded',run,{once:true});})();`;const connections=new Map();let missing=0;
  await report('waiting-for-new-chat');
  while(missing<5){
   if(await access(join(root,'stop-request')).then(()=>true,()=>false)){for(const c of connections.values()){await c.send('Page.removeScriptToEvaluateOnNewDocument',{identifier:c.scriptId}).catch(()=>{});await c.send('Runtime.evaluate',{expression:'window.__STRANGER_AUTO__?.stop()'}).catch(()=>{});}break;}
   if(!verified()){missing++;await sleep(1000);continue;}missing=0;
   const targets=await pages().catch(()=>[]);
   for(const p of targets){
    let c=connections.get(p.id);
    try{
     if(!c){c=await rpc(p.webSocketDebuggerUrl);connections.set(p.id,c);await c.send('Page.enable');c.scriptId=(await c.send('Page.addScriptToEvaluateOnNewDocument',{source})).identifier;await c.send('Runtime.evaluate',{expression:source});}
     const result=await c.send('Runtime.evaluate',{expression:'JSON.stringify(window.__STRANGER_AUTO__?.status() ?? {active:false,reason:"waiting-for-page"})',returnByValue:true});
     if(result.result?.value){const state=JSON.parse(result.result.value);await report(state.active?'active':state.reason);}
    }catch{c?.close();connections.delete(p.id);}
   }
   for(const [id,c] of connections)if(!targets.some(p=>p.id===id)){c.close();connections.delete(id);}
   await sleep(2500);
  }
  for(const c of connections.values())c.close();await report('stopped');
 }catch(e){await report('error',e.message);process.exitCode=1;}finally{await cleanup();}
}
await mkdir(root,{recursive:true});await main();
