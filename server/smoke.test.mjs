import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';

const port=18787;
const base=`http://127.0.0.1:${port}`;
const token='smoke-secret';
const allowedOrigin='https://app.goar.test';

const child=spawn(process.execPath,['server/index.mjs'],{
  env:{
    ...process.env,
    PORT:String(port),
    GOAR_ADMIN_TOKEN:token,
    GOAR_ALLOWED_ORIGINS:allowedOrigin,
    GOAR_RATE_LIMIT_PER_MINUTE:'500',
    GOAR_MAX_BODY_BYTES:'1000',
  },
  stdio:['ignore','pipe','pipe'],
});

let stdout='';
let stderr='';
child.stdout.on('data',(chunk)=>{stdout+=chunk.toString();});
child.stderr.on('data',(chunk)=>{stderr+=chunk.toString();});

async function waitForReady(){
  const deadline=Date.now()+10_000;
  while(Date.now()<deadline){
    try{
      const response=await fetch(`${base}/ready`);
      if(response.ok)return;
    }catch{}
    await new Promise(resolve=>setTimeout(resolve,100));
  }
  throw new Error(`API did not become ready. stdout=${stdout} stderr=${stderr}`);
}

async function json(path,options={}){
  const response=await fetch(`${base}${path}`,options);
  const body=await response.json();
  return {response,body};
}

try{
  await waitForReady();

  const health=await json('/health');
  assert.equal(health.response.status,200);
  assert.equal(health.body.ok,true);
  assert.equal(health.body.storage,'file');
  assert.ok(health.response.headers.get('x-request-id'));
  assert.equal(health.response.headers.get('x-content-type-options'),'nosniff');

  const ready=await json('/ready');
  assert.equal(ready.response.status,200);
  assert.equal(ready.body.ready,true);

  const metricsDenied=await json('/metrics');
  assert.equal(metricsDenied.response.status,401);

  const metrics=await json('/metrics',{
    headers:{authorization:`Bearer ${token}`},
  });
  assert.equal(metrics.response.status,200);
  assert.equal(metrics.body.service,'goar-api');
  assert.equal(metrics.body.storage,'file');
  assert.ok(metrics.body.memory.rssBytes>0);

  const cors=await fetch(`${base}/health`,{headers:{origin:allowedOrigin}});
  assert.equal(cors.headers.get('access-control-allow-origin'),allowedOrigin);

  const preflightAllowed=await fetch(`${base}/health`,{
    method:'OPTIONS',
    headers:{origin:allowedOrigin},
  });
  assert.equal(preflightAllowed.status,204);

  const preflightDenied=await json('/health',{
    method:'OPTIONS',
    headers:{origin:'https://evil.example'},
  });
  assert.equal(preflightDenied.response.status,403);

  const dataset={
    venueId:'smoke-venue',
    version:1,
    updatedAt:new Date().toISOString(),
    points:[{
      id:'seat-a-1',
      venueId:'smoke-venue',
      label:'Seat 1',
      kind:'seat',
      floor:0,
      position:{x:1,y:0,z:2},
      section:'A',
      row:'1',
      seat:'1',
    }],
  };

  const putDenied=await json('/venues/smoke-venue/mapping',{
    method:'PUT',
    headers:{'content-type':'application/json'},
    body:JSON.stringify(dataset),
  });
  assert.equal(putDenied.response.status,401);

  const put=await json('/venues/smoke-venue/mapping',{
    method:'PUT',
    headers:{
      authorization:`Bearer ${token}`,
      'content-type':'application/json',
    },
    body:JSON.stringify(dataset),
  });
  assert.equal(put.response.status,200);
  assert.equal(put.body.points,1);

  const getMapping=await json('/venues/smoke-venue/mapping');
  assert.equal(getMapping.response.status,200);
  assert.equal(getMapping.body.points[0].id,'seat-a-1');

  const ticket=await json('/tickets/ticket-demo-001');
  assert.equal(ticket.response.status,200);
  assert.equal(ticket.body.seat,'18');

  const telemetry=await json('/telemetry',{
    method:'POST',
    headers:{'content-type':'application/json'},
    body:JSON.stringify({name:'smoke_test',venueId:'smoke-venue'}),
  });
  assert.equal(telemetry.response.status,202);

  const diagnostic=await json('/diagnostics',{
    method:'POST',
    headers:{'content-type':'application/json'},
    body:JSON.stringify({
      id:'diag-smoke',
      venueId:'smoke-venue',
      startedAt:new Date().toISOString(),
      samples:[],
    }),
  });
  assert.equal(diagnostic.response.status,202);

  const tooLarge=await json('/telemetry',{
    method:'POST',
    headers:{'content-type':'application/json'},
    body:JSON.stringify({name:'large',payload:'x'.repeat(1500)}),
  });
  assert.equal(tooLarge.response.status,413);

  console.log('GoAR API smoke tests passed');
}finally{
  child.kill('SIGTERM');
  await new Promise(resolve=>{
    const timeout=setTimeout(resolve,2000);
    child.once('exit',()=>{clearTimeout(timeout);resolve();});
  });
}
