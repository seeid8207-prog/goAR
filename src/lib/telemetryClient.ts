import { drainTelemetry, peekTelemetry, type TelemetryEvent } from './telemetry';
import type { DiagnosticSession } from '../types/diagnostics';

const apiBase=()=>process.env.EXPO_PUBLIC_GOAR_API_URL?.replace(/\/$/,'');

async function post(path:string,body:unknown){
  const base=apiBase();
  if(!base)return {ok:false,skipped:true as const,status:0};
  const response=await fetch(`${base}${path}`,{
    method:'POST',
    headers:{'content-type':'application/json'},
    body:JSON.stringify(body),
  });
  if(!response.ok)throw new Error(`GoAR API ${path} failed: ${response.status}`);
  return {ok:true,skipped:false as const,status:response.status};
}

export async function flushTelemetry(){
  const pending=[...peekTelemetry()];
  if(!pending.length)return {uploaded:0,skipped:false};

  let uploaded=0;
  try{
    for(const event of pending){
      await post('/telemetry',event);
      uploaded+=1;
    }
    drainTelemetry();
    return {uploaded,skipped:false};
  }catch(error){
    throw error;
  }
}

export async function uploadDiagnosticSession(session:DiagnosticSession){
  const result=await post('/diagnostics',session);
  return {uploaded:result.ok,skipped:result.skipped};
}

export async function sendTelemetryEvent(event:TelemetryEvent){
  return post('/telemetry',event);
}
