import { ViroARTrackingTargets } from '@reactvision/react-viro';
import { demoCheckpoints } from '../data/checkpoints';

const targetName=(checkpointId:string)=>`goar_${checkpointId.replace(/[^a-zA-Z0-9_]/g,'_')}`;

const markerUrl=(payload:string)=>
  `https://api.qrserver.com/v1/create-qr-code/?size=600x600&margin=24&data=${encodeURIComponent(payload)}`;

let registered=false;

export function registerViroCheckpointTargets(){
  if(registered)return;
  const targets:Record<string,any>={};
  for(const checkpoint of demoCheckpoints){
    targets[targetName(checkpoint.id)]={
      source:{uri:markerUrl(checkpoint.qrValue)},
      orientation:'Up',
      physicalWidth:checkpoint.markerWidthMeters??0.2,
      type:'Image',
    };
  }
  ViroARTrackingTargets.createTargets(targets);
  registered=true;
}

export function viroTargetName(checkpointId:string){
  return targetName(checkpointId);
}
