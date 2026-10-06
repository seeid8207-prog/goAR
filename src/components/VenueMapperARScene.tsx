import React, { useEffect, useRef } from 'react';
import {
  ViroAmbientLight,
  ViroARScene,
  ViroNode,
  ViroSphere,
  ViroText,
} from '@reactvision/react-viro';
import { registerNativeRaycastHandler, type NativeRaycastPlacement } from '../lib/nativeArBridge';
import type { MappingPoint } from '../types/venueMapping';

const hitRank:Record<string,number>={
  ExistingPlaneUsingExtent:0,
  ExistingPlane:1,
  DepthPoint:2,
  EstimatedHorizontalPlane:3,
  FeaturePoint:4,
};

function confidenceFor(type:string, nativeConfidence?:number){
  if(typeof nativeConfidence==='number')return Math.max(0,Math.min(1,nativeConfidence));
  if(type==='ExistingPlaneUsingExtent')return .98;
  if(type==='ExistingPlane')return .94;
  if(type==='DepthPoint')return .9;
  if(type==='EstimatedHorizontalPlane')return .76;
  if(type==='FeaturePoint')return .62;
  return .5;
}

type Props = {
  sceneNavigator?: {
    viroAppProps?: {
      points?: MappingPoint[];
      onTrackingState?: (state:string)=>void;
    };
  };
};

export default function VenueMapperARScene({ sceneNavigator }: Props = {}) {
  const sceneRef=useRef<any>(null);
  const points=sceneNavigator?.viroAppProps?.points??[];

  useEffect(()=>{
    registerNativeRaycastHandler(async():Promise<NativeRaycastPlacement|null>=>{
      const scene=sceneRef.current;
      if(!scene)return null;

      const orientation=await scene.getCameraOrientationAsync();
      if(!orientation?.forward)return null;

      const results=await scene.performARHitTestWithRay(orientation.forward);
      if(!Array.isArray(results)||!results.length)return null;

      const ranked=[...results].sort((a:any,b:any)=>
        (hitRank[a?.type]??99)-(hitRank[b?.type]??99)
      );
      const hit=ranked.find((item:any)=>Array.isArray(item?.transform?.position));
      if(!hit)return null;

      const [x,y,z]=hit.transform.position;
      const rotation=Array.isArray(hit.transform.rotation)
        ? hit.transform.rotation
        : [0,0,0];

      return{
        position:{x:Number(x),y:Number(y),z:Number(z)},
        rotation:{x:Number(rotation[0]??0),y:Number(rotation[1]??0),z:Number(rotation[2]??0)},
        confidence:confidenceFor(String(hit.type),hit.confidence),
        hitType:String(hit.type??'Unknown'),
      };
    });

    return()=>registerNativeRaycastHandler(null);
  },[]);

  return (
    <ViroARScene
      ref={sceneRef}
      anchorDetectionTypes={['PlanesHorizontal','PlanesVertical']}
      onTrackingUpdated={(state:any)=>
        sceneNavigator?.viroAppProps?.onTrackingState?.(String(state))
      }
    >
      <ViroAmbientLight color="#ffffff" intensity={320} />
      {points.map((point)=>(
        <ViroNode key={point.id} position={[point.position.x,point.position.y,point.position.z]}>
          <ViroSphere radius={0.08} />
          <ViroText
            text={point.label}
            position={[0,0.16,0]}
            width={1.6}
            height={0.35}
            style={{color:'#fff',fontSize:15,textAlign:'center',fontWeight:'800'} as any}
            transformBehaviors={['billboardY']}
          />
        </ViroNode>
      ))}
    </ViroARScene>
  );
}
