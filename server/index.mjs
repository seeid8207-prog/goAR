import http from 'node:http';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=dirname(fileURLToPath(import.meta.url));
const dataRoot=join(root,'data');
const port=Number(process.env.PORT||8787);
const adminToken=process.env.GOAR_ADMIN_TOKEN||'dev-admin-token';

const demoTicket={
  id:'ticket-demo-001',eventId:'event-demo-001',eventName:'Demo Event',
  venueId:'demo-stadium',venueName:'Demo Stadium',section:'104',row:'G',seat:'18'
};

await mkdir(dataRoot,{recursive:true});

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

http.createServer(async(req,res)=>{
  try{
    const url=new URL(req.url,'http://localhost');
    if(req.method==='GET'&&url.pathname==='/health')return json(res,200,{ok:true,service:'goar-api'});

    const ticketMatch=url.pathname.match(/^\/tickets\/([^/]+)$/);
    if(req.method==='GET'&&ticketMatch){
      if(ticketMatch[1]===demoTicket.id)return json(res,200,demoTicket);
      return json(res,404,{error:'ticket_not_found'});
    }

    const mappingMatch=url.pathname.match(/^\/venues\/([^/]+)\/mapping$/);
    if(mappingMatch){
      const venueId=safeId(mappingMatch[1]);
      const path=join(dataRoot,`${venueId}-mapping.json`);
      if(req.method==='GET'){
        try{return json(res,200,JSON.parse(await readFile(path,'utf8')));}
        catch{return json(res,404,{error:'mapping_not_found'});}
      }
      if(req.method==='PUT'){
        if(req.headers.authorization!==`Bearer ${adminToken}`)return json(res,401,{error:'unauthorized'});
        const body=await readBody(req);
        if(body?.venueId!==venueId||!Array.isArray(body?.points))return json(res,400,{error:'invalid_mapping'});
        await writeFile(path,JSON.stringify(body,null,2));
        return json(res,200,{ok:true,venueId,points:body.points.length});
      }
    }

    return json(res,404,{error:'not_found'});
  }catch(error){
    return json(res,500,{error:'internal_error',message:error instanceof Error?error.message:String(error)});
  }
}).listen(port,()=>console.log(`GoAR API listening on http://localhost:${port}`));
