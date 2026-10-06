import pg from 'pg';
import { readdir, stat, unlink } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const telemetryDays=Number(process.env.GOAR_TELEMETRY_RETENTION_DAYS||90);
const diagnosticDays=Number(process.env.GOAR_DIAGNOSTIC_RETENTION_DAYS||30);
const now=Date.now();

if(process.env.DATABASE_URL){
  const {Pool}=pg;
  const pool=new Pool({connectionString:process.env.DATABASE_URL});
  try{
    const result=await pool.query(
      `DELETE FROM navigation_events
       WHERE created_at < now() - ($1::text || ' days')::interval`,
      [telemetryDays]
    );
    console.log(`Deleted ${result.rowCount} telemetry rows older than ${telemetryDays} days.`);
  }finally{
    await pool.end();
  }
}

const root=dirname(fileURLToPath(import.meta.url));
const diagnosticsDir=join(root,'..','server','data','diagnostics');
try{
  const files=await readdir(diagnosticsDir);
  let deleted=0;
  for(const file of files){
    if(!file.endsWith('.json'))continue;
    const path=join(diagnosticsDir,file);
    const info=await stat(path);
    if(now-info.mtimeMs>diagnosticDays*86_400_000){
      await unlink(path);
      deleted+=1;
    }
  }
  console.log(`Deleted ${deleted} diagnostic files older than ${diagnosticDays} days.`);
}catch(error){
  if(error?.code!=='ENOENT')throw error;
}
