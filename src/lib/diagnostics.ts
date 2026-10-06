import type { DiagnosticSample, DiagnosticSession } from '../types/diagnostics';

export function createDiagnosticSession(venueId:string):DiagnosticSession{
  return {id:`diag-${Date.now()}`,venueId,startedAt:new Date().toISOString(),samples:[]};
}

export function appendDiagnosticSample(session:DiagnosticSession,sample:Omit<DiagnosticSample,'id'|'recordedAt'>):DiagnosticSession{
  return {
    ...session,
    samples:[
      ...session.samples,
      {id:`sample-${Date.now()}-${session.samples.length}`,recordedAt:new Date().toISOString(),...sample},
    ].slice(-5000),
  };
}

export function summarizeDiagnosticSession(session:DiagnosticSession){
  const routeDistances=session.samples.map(s=>s.distanceToRouteMeters).filter((v):v is number=>Number.isFinite(v));
  const reroutes=Math.max(0,...session.samples.map(s=>s.rerouteCount??0));
  const mean=routeDistances.length?routeDistances.reduce((a,b)=>a+b,0)/routeDistances.length:0;
  const max=routeDistances.length?Math.max(...routeDistances):0;
  return {
    samples:session.samples.length,
    meanDistanceToRouteMeters:mean,
    maxDistanceToRouteMeters:max,
    reroutes,
    durationSeconds:session.endedAt
      ? (Date.parse(session.endedAt)-Date.parse(session.startedAt))/1000
      : (Date.now()-Date.parse(session.startedAt))/1000,
  };
}
