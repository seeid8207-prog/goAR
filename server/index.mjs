import http from 'node:http';
import { createFileStore } from './fileStore.mjs';
import { createPostgresStore } from './postgresStore.mjs';
import { saveDiagnosticFile } from './diagnosticsStore.mjs';
import {
  bearerMatches,
  clientIp,
  parseAllowedOrigins,
  rateLimit,
  readJsonBody,
  requestId,
  secureHeaders,
} from './security.mjs';

const port=Number(process.env.PORT||8787);
const adminToken=process.env.GOAR_ADMIN_TOKEN||'dev-admin-token';
const allowedOrigins=parseAllowedOrigins(process.env.GOAR_ALLOWED_ORIGINS||'');
const maxBodyBytes=Number(process.env.GOAR_MAX_BODY_BYTES||1_000_000);
const rateLimitPerMinute=Number(process.env.GOAR_RATE_LIMIT_PER_MINUTE||120);
const store=process.env.DATABASE_URL
  ? createPostgresStore(process.env.DATABASE_URL)
  : createFileStore();

const json=(res,status,body)=>{
  const data=JSON.stringify(body);
  res.writeHead(status,{'content-type':'application/json; charset=utf-8','content-length':Buffer.byteLength(data)});
  res.end(data);
};

const safeId=(value)=>String(value||'').replace(/[^a-zA-Z0-9_-]/g,'');

const server=http.createServer(async(req,res)=>{
  const id=requestId(req);
  const origin=typeof req.headers.origin==='string'?req.headers.origin:'';
  secureHeaders(res,id,origin,allowedOrigins);

  try{
    if(req.method==='OPTIONS'){
      if(origin&&!allowedOrigins.has(origin))return json(res,403,{error:'origin_not_allowed',requestId:id});
      res.writeHead(204);
      return res.end();
    }

    const limit=rateLimit(clientIp(req),{limit:rateLimitPerMinute,windowMs:60_000});
    res.setHeader('x-ratelimit-remaining',String(limit.remaining));
    res.setHeader('x-ratelimit-reset',String(Math.ceil(limit.resetAt/1000)));
    if(!limit.allowed)return json(res,429,{error:'rate_limited',requestId:id});

    const url=new URL(req.url,'http://localhost');

    if(req.method==='GET'&&url.pathname==='/health'){
      return json(res,200,{
        ok:true,
        service:'goar-api',
        storage:process.env.DATABASE_URL?'postgres':'file',
        requestId:id,
      });
    }

    if(req.method==='GET'&&url.pathname==='/ready'){
      try{
        await store.ping();
        return json(res,200,{ok:true,ready:true,requestId:id});
      }catch{
        return json(res,503,{ok:false,ready:false,requestId:id});
      }
    }

    const ticketMatch=url.pathname.match(/^\/tickets\/([^/]+)$/);
    if(req.method==='GET'&&ticketMatch){
      const ticket=await store.getTicket(safeId(ticketMatch[1]));
      return ticket?json(res,200,ticket):json(res,404,{error:'ticket_not_found',requestId:id});
    }

    const mappingMatch=url.pathname.match(/^\/venues\/([^/]+)\/mapping$/);
    if(mappingMatch){
      const venueId=safeId(mappingMatch[1]);
      if(req.method==='GET'){
        const mapping=await store.getMapping(venueId);
        return mapping?json(res,200,mapping):json(res,404,{error:'mapping_not_found',requestId:id});
      }
      if(req.method==='PUT'){
        if(!bearerMatches(req.headers.authorization,adminToken))return json(res,401,{error:'unauthorized',requestId:id});
        const body=await readJsonBody(req,maxBodyBytes);
        if(body?.venueId!==venueId||!Array.isArray(body?.points))return json(res,400,{error:'invalid_mapping',requestId:id});
        return json(res,200,await store.putMapping(venueId,body));
      }
    }

    if(req.method==='POST'&&url.pathname==='/telemetry'){
      const body=await readJsonBody(req,maxBodyBytes);
      if(!body?.name)return json(res,400,{error:'invalid_event',requestId:id});
      await store.recordNavigationEvent(body);
      return json(res,202,{accepted:true,requestId:id});
    }

    if(req.method==='POST'&&url.pathname==='/diagnostics'){
      const body=await readJsonBody(req,maxBodyBytes);
      if(!body?.id||!body?.venueId||!Array.isArray(body?.samples)){
        return json(res,400,{error:'invalid_diagnostic_session',requestId:id});
      }
      const saved=await saveDiagnosticFile(body);
      await store.recordNavigationEvent({
        name:'diagnostic_session',
        venueId:body.venueId,
        sessionId:body.id,
        samples:saved.samples,
      });
      return json(res,202,{accepted:true,...saved,requestId:id});
    }

    return json(res,404,{error:'not_found',requestId:id});
  }catch(error){
    const status=Number(error?.statusCode)||500;
    const message=status>=500?'internal_error':String(error?.message||'bad_request');
    if(status>=500)console.error('[goar-api]',id,error);
    return json(res,status,{error:message,requestId:id});
  }
});

server.listen(port,()=>console.log(`GoAR API listening on http://localhost:${port} (${process.env.DATABASE_URL?'postgres':'file'} storage)`));

const shutdown=async()=>{
  server.close(async()=>{await store.close?.();process.exit(0);});
};
process.on('SIGINT',shutdown);
process.on('SIGTERM',shutdown);
