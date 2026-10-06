import { timingSafeEqual, randomUUID } from 'node:crypto';

const windows=new Map();

export function requestId(req){
  const value=req.headers['x-request-id'];
  return typeof value==='string'&&value.length<=128?value:randomUUID();
}

export function secureHeaders(res,requestIdValue,origin,allowedOrigins){
  res.setHeader('x-content-type-options','nosniff');
  res.setHeader('x-frame-options','DENY');
  res.setHeader('referrer-policy','no-referrer');
  res.setHeader('permissions-policy','camera=(), microphone=(), geolocation=()');
  res.setHeader('cache-control','no-store');
  res.setHeader('x-request-id',requestIdValue);

  if(origin&&allowedOrigins.has(origin)){
    res.setHeader('access-control-allow-origin',origin);
    res.setHeader('vary','Origin');
    res.setHeader('access-control-allow-methods','GET,POST,PUT,OPTIONS');
    res.setHeader('access-control-allow-headers','authorization,content-type,x-request-id');
    res.setHeader('access-control-max-age','600');
  }
}

export function parseAllowedOrigins(value=''){
  return new Set(value.split(',').map(v=>v.trim()).filter(Boolean));
}

export function bearerMatches(header,expected){
  if(!expected||!header?.startsWith('Bearer '))return false;
  const supplied=Buffer.from(header.slice(7));
  const target=Buffer.from(expected);
  return supplied.length===target.length&&timingSafeEqual(supplied,target);
}

export function rateLimit(key,{limit=120,windowMs=60_000}={}){
  const now=Date.now();
  const current=windows.get(key);
  if(!current||now>=current.resetAt){
    const next={count:1,resetAt:now+windowMs};
    windows.set(key,next);
    return {allowed:true,remaining:limit-1,resetAt:next.resetAt};
  }
  current.count+=1;
  return {
    allowed:current.count<=limit,
    remaining:Math.max(0,limit-current.count),
    resetAt:current.resetAt,
  };
}

export async function readJsonBody(req,maxBytes=1_000_000){
  const chunks=[];
  let total=0;
  for await(const chunk of req){
    total+=chunk.length;
    if(total>maxBytes){
      const error=new Error('request_body_too_large');
      error.statusCode=413;
      throw error;
    }
    chunks.push(chunk);
  }
  const text=Buffer.concat(chunks).toString('utf8')||'{}';
  try{return JSON.parse(text);}
  catch{
    const error=new Error('invalid_json');
    error.statusCode=400;
    throw error;
  }
}

export function clientIp(req){
  const forwarded=req.headers['x-forwarded-for'];
  if(typeof forwarded==='string'&&forwarded)return forwarded.split(',')[0].trim();
  return req.socket?.remoteAddress||'unknown';
}
