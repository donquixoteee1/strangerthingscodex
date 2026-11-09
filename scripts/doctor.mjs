import {existsSync,readFileSync} from 'node:fs';
const report={
 package:JSON.parse(readFileSync(new URL('../package.json',import.meta.url))).version,
 node:process.versions.node,
 webBuild:existsSync(new URL('../dist/index.html',import.meta.url)),
 nativeBundle:existsSync(new URL('../native-dist/stranger-skin.js',import.meta.url)),
 nativeInstallReady:false,
 nativeIntegration:'experimental-read-only',
 blockers:['No verified loader or host targets for the current Codex desktop version.','Real Codex mount/unmount and native editor regression checks have not been performed.','Dream Skin theme ZIP accepts images, tokens and safe CSS, not this JavaScript runtime.'],
 nextStep:'Use the standalone preview. Validate a supported host loading path in an isolated Codex test instance before native installation.'
};
console.log(JSON.stringify(report,null,2));
process.exitCode=report.nativeInstallReady?0:2;
