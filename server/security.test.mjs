import assert from 'node:assert/strict';
import { Readable } from 'node:stream';
import {
  bearerMatches,
  parseAllowedOrigins,
  rateLimit,
  readJsonBody,
} from './security.mjs';

assert.equal(bearerMatches('Bearer secret','secret'),true);
assert.equal(bearerMatches('Bearer wrong','secret'),false);
assert.equal(bearerMatches(undefined,'secret'),false);

const origins=parseAllowedOrigins('https://app.goar.example, https://admin.goar.example');
assert.equal(origins.has('https://app.goar.example'),true);
assert.equal(origins.has('https://evil.example'),false);

const first=rateLimit('test-ip',{limit:2,windowMs:60_000});
const second=rateLimit('test-ip',{limit:2,windowMs:60_000});
const third=rateLimit('test-ip',{limit:2,windowMs:60_000});
assert.equal(first.allowed,true);
assert.equal(second.allowed,true);
assert.equal(third.allowed,false);

const req=Readable.from([Buffer.from('{"hello":"world"}')]);
const parsed=await readJsonBody(req,100);
assert.deepEqual(parsed,{hello:'world'});

await assert.rejects(
  ()=>readJsonBody(Readable.from([Buffer.alloc(20)]),10),
  (error)=>error?.statusCode===413,
);

await assert.rejects(
  ()=>readJsonBody(Readable.from([Buffer.from('{bad json')]),100),
  (error)=>error?.statusCode===400,
);

console.log('GoAR server security tests passed');
