import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

const out='dist/field-test-bundle';
await rm(out,{recursive:true,force:true});
await mkdir(join(out,'checkpoints'),{recursive:true});
await mkdir(join(out,'docs'),{recursive:true});

for(const file of ['gate-a.png','east-concourse.png','section-104.png']){
  await cp(join('assets','checkpoints',file),join(out,'checkpoints',file));
}

for(const file of [
  'FIELD_TEST_PLAN.md',
  'ANDROID_FIELD_TEST.md',
  'CHECKPOINT_MARKERS.md',
  'FIELD_TEST_RC.md',
  'PRODUCTION_RELEASE.md',
]){
  await cp(join('docs',file),join(out,'docs',file));
}

await cp('.env.example',join(out,'.env.example'));

let sha=process.env.GITHUB_SHA||'';
if(!sha){
  try{sha=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();}
  catch{sha='unknown';}
}

await writeFile(join(out,'COMMIT_SHA.txt'),sha+'\n');
await writeFile(join(out,'README.txt'),[
  'GoAR Field Test Bundle',
  '',
  `Commit: ${sha}`,
  '',
  'Print checkpoint PNGs at 20 cm physical width.',
  'Follow docs/FIELD_TEST_RC.md and docs/ANDROID_FIELD_TEST.md.',
  'Record the commit SHA with every physical run.',
  '',
].join('\n'));

console.log(`Field-test bundle created at ${out} for ${sha}`);
