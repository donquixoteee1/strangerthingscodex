import {build} from 'vite';
import {readFile,readdir} from 'node:fs/promises';
const assets={};
for(const name of await readdir('public/scene')){
 if(!/\.(svg|png)$/.test(name))continue;
 assets[name]=`data:${name.endsWith('.png')?'image/png':'image/svg+xml'};base64,${(await readFile(`public/scene/${name}`)).toString('base64')}`;
}
await build({configFile:false,publicDir:false,define:{__SKIN_ASSETS__:JSON.stringify(assets)},css:{postcss:{plugins:[]}},build:{outDir:'native-dist',lib:{entry:'src/native/entry.ts',name:'StrangerSkin',formats:['iife'],fileName:()=> 'stranger-skin.js'}}});
