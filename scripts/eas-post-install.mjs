import { spawnSync } from 'node:child_process';

const profile=process.env.EAS_BUILD_PROFILE||'';
const production=profile==='production';

console.log(`GoAR EAS post-install checks for profile: ${profile||'unknown'}`);

const typecheck=spawnSync('npm',['run','typecheck'],{stdio:'inherit',shell:process.platform==='win32'});
if(typecheck.status!==0)process.exit(typecheck.status??1);

if(production){
  const release=spawnSync('npm',['run','release:check'],{stdio:'inherit',shell:process.platform==='win32'});
  if(release.status!==0)process.exit(release.status??1);
}

console.log('GoAR EAS post-install checks passed.');
