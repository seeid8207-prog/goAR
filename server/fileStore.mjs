import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=dirname(fileURLToPath(import.meta.url));
const dataRoot=join(root,'data');
await mkdir(dataRoot,{recursive:true});

const demoTicket={
  id:'ticket-demo-001',eventId:'event-demo-001',eventName:'Demo Event',
  venueId:'demo-stadium',venueName:'Demo Stadium',section:'104',row:'G',seat:'18'
};

const safeId=(value)=>String(value||'').replace(/[^a-zA-Z0-9_-]/g,'');

export function createFileStore(){
  return {
    async ping(){return true;},
    async getTicket(id){return id===demoTicket.id?demoTicket:null;},
    async getMapping(venueId){
      try{return JSON.parse(await readFile(join(dataRoot,`${safeId(venueId)}-mapping.json`),'utf8'));}
      catch{return null;}
    },
    async putMapping(venueId,dataset){
      await writeFile(join(dataRoot,`${safeId(venueId)}-mapping.json`),JSON.stringify(dataset,null,2));
      return {venueId,version:1,points:dataset.points.length};
    },
    async recordNavigationEvent(){},
    async close(){}
  };
}
