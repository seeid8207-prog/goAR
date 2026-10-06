import { ViroARSceneNavigator } from '@reactvision/react-viro';
import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import RouteARScene from '../src/components/RouteARScene';
import { DEMO_VENUE, checkpoint, edges, points, seatTarget } from '../src/data/demoVenue';
import { demoCheckpoints } from '../src/data/checkpoints';
import { projectARRouteToWorld, type WorldARRouteOverlay } from '../src/lib/arRouteWorld';
import { NavigationSession } from '../src/lib/navigationSession';
import { updateNavigationFromCamera } from '../src/lib/navigationRuntime';
import { venueToWorld, worldToVenue } from '../src/lib/referenceFrame';
import { loadReferenceFrame } from '../src/lib/referenceFrameStore';
import { loadNavigationPreferences } from '../src/lib/preferences';
import { track } from '../src/lib/telemetry';
import { appendDiagnosticSample, createDiagnosticSession } from '../src/lib/diagnostics';
import { saveDiagnosticSession } from '../src/lib/diagnosticsStore';
import { CheckpointRuntime } from '../src/lib/checkpointRuntime';
import type { PersistentReferenceFrame } from '../src/types/arMapping';
import type { DiagnosticSession } from '../src/types/diagnostics';
import type { ObservedCheckpointPose } from '../src/types/checkpoints';

const EMPTY_OVERLAY: WorldARRouteOverlay = {
  instruction:'Localizing route…',nextWaypoint:null,waypoints:[],distanceToNextWaypointMeters:0,
  remainingDistanceMeters:0,isOffRoute:false,hasArrived:false,
};

export default function ARNavigateScreen(){
  const [frame,setFrame]=useState<PersistentReferenceFrame|null>(null);
  const [tracking,setTracking]=useState('initializing');
  const [overlay,setOverlay]=useState<WorldARRouteOverlay>(EMPTY_OVERLAY);
  const [rerouteCount,setRerouteCount]=useState(0);
  const [correctionCount,setCorrectionCount]=useState(0);
  const [lastCorrection,setLastCorrection]=useState<string>('none');
  const [floor,setFloor]=useState(checkpoint.floor);
  const [stepFree,setStepFree]=useState(false);

  const frameRef=useRef<PersistentReferenceFrame|null>(null);
  const correctionRuntimeRef=useRef<CheckpointRuntime|null>(null);
  const floorRef=useRef(checkpoint.floor);
  const lastUpdateAt=useRef(0);
  const lastDiagnosticAt=useRef(0);
  const diagnosticsRef=useRef<DiagnosticSession>(createDiagnosticSession(DEMO_VENUE.id));
  const rerouteRef=useRef(0);

  const session=useMemo(()=>new NavigationSession(points,edges,seatTarget.id,{accessibleOnly:stepFree},{
    waypointRadiusMeters:1.8,arrivalRadiusMeters:1.4,offRouteThresholdMeters:4,rerouteCooldownMs:3000,
  }),[stepFree]);

  useEffect(()=>{
    session.start(checkpoint.id);
    track({name:'route_started',venueId:DEMO_VENUE.id,destinationId:seatTarget.id});
    loadReferenceFrame(DEMO_VENUE.id).then((loaded)=>{
      setFrame(loaded);
      frameRef.current=loaded;
      correctionRuntimeRef.current=loaded
        ? new CheckpointRuntime(loaded,demoCheckpoints,5000)
        : null;
    });
    return ()=>{
      diagnosticsRef.current={...diagnosticsRef.current,endedAt:new Date().toISOString()};
      void saveDiagnosticSession(diagnosticsRef.current);
    };
  },[session]);

  useEffect(()=>{loadNavigationPreferences().then((p)=>setStepFree(p.stepFree));},[]);

  const switchFloor=(nextFloor:number)=>{floorRef.current=nextFloor;setFloor(nextFloor);};

  const handleCheckpointObserved=async(observation:ObservedCheckpointPose)=>{
    const runtime=correctionRuntimeRef.current;
    if(!runtime)return;

    const result=await runtime.observe(observation,Date.now());
    if(!result.applied||!result.correction)return;

    frameRef.current=result.frame;
    setFrame(result.frame);
    setCorrectionCount((count)=>count+1);
    setLastCorrection(`${result.correction.checkpointId} · ${result.correction.driftMeters.toFixed(2)} m`);

    const definition=demoCheckpoints.find((item)=>item.id===observation.checkpointId);
    if(definition&&definition.floor!==floorRef.current){
      floorRef.current=definition.floor;
      setFloor(definition.floor);
    }

    track({
      name:'checkpoint_corrected',
      venueId:DEMO_VENUE.id,
      checkpointId:observation.checkpointId,
      driftMeters:result.correction.driftMeters,
      confidence:observation.confidence,
    });
  };

  const requestedFloor=overlay.nextWaypoint?.floor;
  const needsFloorConfirmation=requestedFloor!=null&&requestedFloor!==floor&&(overlay.nextWaypoint?.kind==='lift'||overlay.nextWaypoint?.kind==='stairs');

  if(!frame)return <SafeAreaView style={styles.empty}>
    <Text style={styles.emptyTitle}>Venue localization required</Text>
    <Text style={styles.emptyCopy}>Scan a GoAR venue checkpoint first so route coordinates can be aligned with the real venue.</Text>
    <TouchableOpacity style={styles.primary} onPress={()=>router.replace('/checkpoint')}><Text style={styles.primaryText}>Open checkpoint scanner</Text></TouchableOpacity>
  </SafeAreaView>;

  return <View style={styles.root}>
    <ViroARSceneNavigator autofocus initialScene={{scene:RouteARScene}} viroAppProps={{
      waypoints:overlay.waypoints,
      onTrackingState:setTracking,
      onCheckpointObserved:handleCheckpointObserved,
      onCameraTransform:(transform:any)=>{
        const activeFrame=frameRef.current;
        if(!activeFrame)return;

        const now=Date.now();
        if(now-lastUpdateAt.current<120)return;
        lastUpdateAt.current=now;

        const [x,y,z]=transform.position;
        const update=updateNavigationFromCamera(session,{x,y,z},floorRef.current,activeFrame,now);
        const worldOverlay=projectARRouteToWorld(
          update.overlay,
          (position)=>venueToWorld(position,activeFrame),
        );
        setOverlay(worldOverlay);

        if(update.rerouted){
          const next=rerouteRef.current+1;
          rerouteRef.current=next;
          setRerouteCount(next);
          track({name:'reroute',venueId:DEMO_VENUE.id,distanceFromRoute:update.overlay.distanceToNextWaypointMeters});
        }

        if(now-lastDiagnosticAt.current>=500){
          lastDiagnosticAt.current=now;
          const venue=worldToVenue({x,y,z},activeFrame);
          diagnosticsRef.current=appendDiagnosticSample(diagnosticsRef.current,{
            venueId:DEMO_VENUE.id,
            checkpointId:activeFrame.checkpointId,
            floor:floorRef.current,
            world:{x,y,z},
            venue,
            trackingState:tracking,
            distanceToRouteMeters:update.overlay.isOffRoute?update.overlay.distanceToNextWaypointMeters:0,
            distanceToNextWaypointMeters:update.overlay.distanceToNextWaypointMeters,
            remainingDistanceMeters:update.overlay.remainingDistanceMeters,
            rerouteCount:rerouteRef.current,
          });
          void saveDiagnosticSession(diagnosticsRef.current);
        }

        if(worldOverlay.hasArrived){
          diagnosticsRef.current={...diagnosticsRef.current,endedAt:new Date().toISOString()};
          void saveDiagnosticSession(diagnosticsRef.current);
          track({name:'arrived',venueId:DEMO_VENUE.id,destinationId:seatTarget.id});
          router.replace('/arrived');
        }
      }
    }} style={StyleSheet.absoluteFill}/>

    <SafeAreaView style={styles.overlay} pointerEvents="box-none">
      <View style={styles.topbar}>
        <TouchableOpacity style={styles.circle} onPress={()=>router.back()}><Text style={styles.back}>‹</Text></TouchableOpacity>
        <View style={styles.badge}>
          <Text style={styles.badgeTitle}>GOAR · LEVEL {floor}{stepFree?' · STEP-FREE':''}</Text>
          <Text style={styles.badgeSub}>{tracking} · reroutes {rerouteCount} · corrections {correctionCount}</Text>
          <Text style={styles.badgeSub}>last correction: {lastCorrection}</Text>
        </View>
      </View>
      <View>
        {needsFloorConfirmation&&requestedFloor!=null&&<View style={styles.floorCard}>
          <Text style={styles.floorKicker}>LEVEL CHANGE</Text>
          <Text style={styles.floorTitle}>Take the {overlay.nextWaypoint?.kind==='lift'?'lift':'stairs'} to Level {requestedFloor}</Text>
          <TouchableOpacity style={styles.floorButton} onPress={()=>switchFloor(requestedFloor)}><Text style={styles.floorButtonText}>I'm on Level {requestedFloor}</Text></TouchableOpacity>
        </View>}
        <View style={[styles.instruction,overlay.isOffRoute&&styles.warning]}>
          <Text style={styles.kicker}>{overlay.isOffRoute?'REROUTING':'NEXT'}</Text>
          <Text style={styles.title}>{overlay.instruction}</Text>
          <Text style={styles.copy}>{overlay.distanceToNextWaypointMeters.toFixed(1)} m to next point · {overlay.remainingDistanceMeters.toFixed(1)} m remaining</Text>
        </View>
      </View>
    </SafeAreaView>
  </View>;
}
const styles=StyleSheet.create({
 root:{flex:1,backgroundColor:'#000'},overlay:{flex:1,justifyContent:'space-between',padding:16},topbar:{flexDirection:'row',alignItems:'center',gap:10},
 circle:{width:46,height:46,borderRadius:23,backgroundColor:'rgba(0,0,0,.7)',alignItems:'center',justifyContent:'center'},back:{color:'#fff',fontSize:34,lineHeight:36},
 badge:{flex:1,backgroundColor:'rgba(0,0,0,.7)',borderRadius:18,padding:10,alignItems:'center'},badgeTitle:{color:'#fff',fontWeight:'900',fontSize:12,letterSpacing:1},
 badgeSub:{color:'#fff',opacity:.65,marginTop:2,fontSize:10},instruction:{backgroundColor:'rgba(0,0,0,.78)',borderRadius:24,padding:18},warning:{borderWidth:2,borderColor:'#fff'},
 kicker:{color:'#fff',opacity:.55,fontSize:10,fontWeight:'900',letterSpacing:1.2},title:{color:'#fff',fontSize:23,fontWeight:'900',marginTop:5},
 copy:{color:'#fff',opacity:.7,marginTop:7},floorCard:{marginBottom:10,backgroundColor:'#fff',borderRadius:20,padding:16},floorKicker:{fontSize:10,fontWeight:'900',opacity:.42,letterSpacing:1.1},
 floorTitle:{fontSize:19,fontWeight:'900',marginTop:4},floorButton:{marginTop:12,backgroundColor:'#111',padding:13,borderRadius:13,alignItems:'center'},floorButtonText:{color:'#fff',fontWeight:'900'},
 empty:{flex:1,backgroundColor:'#f7f8f5',padding:24,justifyContent:'center'},emptyTitle:{fontSize:30,fontWeight:'900'},emptyCopy:{marginTop:10,marginBottom:20,fontSize:15,lineHeight:22,opacity:.6},
 primary:{backgroundColor:'#111',padding:17,borderRadius:16,alignItems:'center'},primaryText:{color:'#fff',fontWeight:'900'}
});