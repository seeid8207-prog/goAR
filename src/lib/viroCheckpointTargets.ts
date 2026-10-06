import { ViroARTrackingTargets } from '@reactvision/react-viro';
import { demoCheckpoints } from '../data/checkpoints';

const targetName=(checkpointId:string)=>`goar_${checkpointId.replace(/[^a-zA-Z0-9_]/g,'_')}`;

const checkpointSources:Record<string,any>={
  'cp-gate-a':require('../../assets/checkpoints/gate-a.png'),
  'cp-east-concourse':require('../../assets/checkpoints/east-concourse.png'),
  'cp-section-104':require('../../assets/checkpoints/section-104.png'),
};

let registered=false;

export function registerViroCheckpointTargets(){
  if(registered)return;
  const targets:Record<string,any>={};
  for(const checkpoint of demoCheckpoints){
    const source=checkpointSources[checkpoint.id];
    if(!source)continue;
    targets[targetName(checkpoint.id)]={
      source,
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
