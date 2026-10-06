import http from 'node:http';
import { createFileStore } from './fileStore.mjs';
import { createPostgresStore } from './postgresStore.mjs';

const port=Number(process.env.PORT||8787);
const adminToken=process.env.GOAR_ADMIN_TOKEN||'dev-admin-token';
const store=process.env.DATABASE_URL
  ? createPostgresStore(process.env.DATABASE_URL)
  : createFileStore();

const json=(res,status,body)=>{
  const data=JSON.stringify(body);
  res.writeHead(status,{'content-type':'application/json','content-length':Buffer.byteLength(data)});
  res.end(data);
};
const readBody=async(req)=>{
  const chunks=[];for await(const chunk of req)chunks.push(chunk);
  return JSON.parse(Buffer.concat(chunks).toString('utf8')||'{}');
};
const safeId=(value)=>String(value||'').replace(/[^a-zA-Z0-9_-]/g,'');

const server=http.createServer(async(req,res)=>{
  try{
    const url=new URL(req.url,'http://localhost');

    if(req.method==='GET'&&url.pathname==='/health'){
      return json(res,200,{
        ok:true,
        service:'goar-api',
        storage:process.env.DATABASE_URL?'postgres':'file',
      });
    }

    const ticketMatch=url.pathname.match(/^\/tickets\/([^/]+)$/);
    if(req.method==='GET'&&ticketMatch){
      const ticket=await store.getTicket(safeId(ticketMatch[1]));
      return ticket?json(res,200,ticket):json(res,404,{error:'ticket_not_found'});
    }

    const mappingMatch=url.pathname.match(/^\/venues\/([^/]+)\/mapping$/);
    if(mappingMatch){
      const venueId=safeId(mappingMatch[1]);
      if(req.method==='GET'){
        const mapping=await store.getMapping(venueId);
        return mapping?json(res,200,mapping):json(res,404,{error:'mapping_not_found'});
      }
      if(req.method==='PUT'){
        if(req.headers.authorization!==`Bearer ${adminToken}`)return json(res,401,{error:'unauthorized'});
        const body=await readBody(req);
        if(body?.venueId!==venueId||!Array.isArray(body?.points))return json(res,400,{error:'invalid_mapping'});
        return json(res,200,await store.putMapping(venueId,body));
      }
    }

    if(req.method==='POST'&&url.pathname==='/telemetry'){
      const body=await readBody(req);
      if(!body?.name)return json(res,400,{error:'invalid_event'});
      await store.recordNavigationEvent(body);
      return json(res,202,{accepted:true});
    }

    return json(res,404,{error:'not_found'});
  }catch(error){
    return json(res,500,{error:'internal_error',message:error instanceof Error?error.message:String(error)});
  }
});

server.listen(port,()=>console.log(`GoAR API listening on http://localhost:${port} (${process.env.DATABASE_URL?'postgres':'file'} storage)`));

const shutdown=async()=>{
  server.close(async()=>{await store.close?.();process.exit(0);});
};
process.on('SIGINT',shutdown);
process.on('SIGTERM',shutdown);
