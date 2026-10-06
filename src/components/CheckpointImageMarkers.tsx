import React from 'react';
import { ViroARImageMarker, ViroNode, ViroText } from '@reactvision/react-viro';
import { demoCheckpoints } from '../data/checkpoints';
import { registerViroCheckpointTargets, viroTargetName } from '../lib/viroCheckpointTargets';
import type { ObservedCheckpointPose } from '../types/checkpoints';

registerViroCheckpointTargets();

type Props={
  onObserved?:(observation:ObservedCheckpointPose)=>void;
};

function emit(
  checkpointId:string,
  anchor:any,
  onObserved?:Props['onObserved'],
  confidence=.95,
){
  const position=anchor?.position;
  if(!Array.isArray(position)||position.length<3)return;
  onObserved?.({
    checkpointId,
    worldPosition:{x:Number(position[0]),y:Number(position[1]),z:Number(position[2])},
    confidence,
    observedAt:new Date().toISOString(),
  });
}

export default function CheckpointImageMarkers({onObserved}:Props){
  return <>
    {demoCheckpoints.map((checkpoint)=>(
      <ViroARImageMarker
        key={checkpoint.id}
        target={viroTargetName(checkpoint.id)}
        onAnchorFound={(anchor:any)=>emit(checkpoint.id,anchor,onObserved,1)}
        onAnchorUpdated={(anchor:any)=>emit(checkpoint.id,anchor,onObserved,.9)}
      >
        <ViroNode position={[0,0.06,0]}>
          <ViroText
            text={`✓ ${checkpoint.label}`}
            position={[0,0,0]}
            rotation={[-90,0,0]}
            width={1.5}
            height={0.25}
            style={{color:'#ffffff',fontSize:13,textAlign:'center',fontWeight:'800'} as any}
          />
        </ViroNode>
      </ViroARImageMarker>
    ))}
  </>;
}
