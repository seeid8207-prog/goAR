import { useMemo, useState } from 'react';
import { Alert, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { demoCheckpoints } from '../src/data/checkpoints';
import { CheckpointCorrectionSession } from '../src/lib/checkpointCorrectionSession';
import { loadReferenceFrame, saveReferenceFrame } from '../src/lib/referenceFrameStore';
import type { PersistentReferenceFrame } from '../src/types/arMapping';

export default function CheckpointTestScreen(){
  const [frame,setFrame]=useState<PersistentReferenceFrame|null>(null);
  const [status,setStatus]=useState('Load a reference frame to begin.');
  const checkpoint=demoCheckpoints[1];

  const load=async()=>{
    const value=await loadReferenceFrame('demo-stadium');
    setFrame(value);
    setStatus(value?'Reference frame loaded.':'No saved frame found.');
  };

  const session=useMemo(()=>frame?new CheckpointCorrectionSession(frame,demoCheckpoints,0):null,[frame]);

  const simulate=async()=>{
    if(!session||!frame){Alert.alert('No frame','Localize at a venue checkpoint first.');return;}
    const predictedX=frame.origin.x+checkpoint.venuePosition.x;
    const result=session.observe({
      checkpointId:checkpoint.id,
      worldPosition:{x:predictedX+0.45,y:frame.origin.y,z:frame.origin.z+checkpoint.venuePosition.z},
      confidence:0.95,
      observedAt:new Date().toISOString(),
    },Date.now());
    if(result.applied){
      await saveReferenceFrame(result.frame);
      setFrame(result.frame);
      setStatus(`Correction applied: ${result.correction?.driftMeters.toFixed(2)} m drift`);
    }else{
      setStatus(`Correction not applied: ${result.reason}`);
    }
  };

  return <SafeAreaView style={styles.page}>
    <Text style={styles.kicker}>FIELD TEST TOOL</Text>
    <Text style={styles.title}>Checkpoint correction</Text>
    <Text style={styles.copy}>This screen verifies the correction pipeline before wiring a production image-recognition provider. It applies a controlled 0.45 m simulated drift to the East Concourse checkpoint.</Text>
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{checkpoint.label}</Text>
      <Text style={styles.meta}>Known venue position: {checkpoint.venuePosition.x}, {checkpoint.venuePosition.y}, {checkpoint.venuePosition.z}</Text>
      <Text style={styles.status}>{status}</Text>
    </View>
    <TouchableOpacity style={styles.primary} onPress={load}><Text style={styles.primaryText}>Load saved frame</Text></TouchableOpacity>
    <TouchableOpacity style={styles.secondary} onPress={simulate}><Text style={styles.secondaryText}>Simulate 0.45 m correction</Text></TouchableOpacity>
  </SafeAreaView>;
}
const styles=StyleSheet.create({
 page:{flex:1,backgroundColor:'#f7f8f5',padding:24},kicker:{fontSize:10,fontWeight:'900',letterSpacing:1.2,opacity:.4,marginTop:18},
 title:{fontSize:34,fontWeight:'900',marginTop:5},copy:{opacity:.58,lineHeight:21,marginTop:8,marginBottom:20},
 card:{backgroundColor:'#fff',borderRadius:20,padding:18,marginBottom:18},cardTitle:{fontWeight:'900',fontSize:20},
 meta:{opacity:.55,marginTop:8},status:{fontWeight:'800',marginTop:14},primary:{backgroundColor:'#111',padding:16,borderRadius:15,alignItems:'center'},
 primaryText:{color:'#fff',fontWeight:'900'},secondary:{padding:16,alignItems:'center'},secondaryText:{fontWeight:'900'}
});
