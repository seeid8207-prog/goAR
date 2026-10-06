import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=dirname(fileURLToPath(import.meta.url));
const dir=join(root,'data','diagnostics');

export async function saveDiagnosticFile(session){
  await mkdir(dir,{recursive:true});
  const id=String(session?.id||`diag-${Date.now()}`).replace(/[^a-zA-Z0-9_-]/g,'');
  await writeFile(join(dir,`${id}.json`),JSON.stringify(session,null,2));
  return {id,samples:Array.isArray(session?.samples)?session.samples.length:0};
}
