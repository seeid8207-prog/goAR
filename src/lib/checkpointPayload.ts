export type ParsedCheckpointPayload={
  venueId:string;
  checkpointId:string;
};

export function parseCheckpointPayload(raw:string):ParsedCheckpointPayload|null{
  const parts=raw.split(':');
  if(parts.length!==3)return null;
  const [prefix,venueId,checkpointId]=parts;
  if(prefix!=='SEATNAV'&&!prefix.startsWith('GOAR'))return null;
  if(!venueId||!checkpointId)return null;
  return {venueId,checkpointId};
}
