import { useEffect, useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { clearDiagnosticSessions, loadDiagnosticSessions } from '../src/lib/diagnosticsStore';
import { summarizeDiagnosticSession } from '../src/lib/diagnostics';
import { uploadDiagnosticSession } from '../src/lib/telemetryClient';
import type { DiagnosticSession } from '../src/types/diagnostics';

export default function DiagnosticsScreen(){
  const [sessions,setSessions]=useState<DiagnosticSession[]>([]);
  const [uploading,setUploading]=useState<string|null>(null);
  const refresh=()=>loadDiagnosticSessions().then(setSessions);
  useEffect(()=>{ void refresh(); },[]);

  const upload=async(session:DiagnosticSession)=>{
    try{
      setUploading(session.id);
      const result=await uploadDiagnosticSession(session);
      if(result.skipped){
        Alert.alert('API URL not configured','Set EXPO_PUBLIC_GOAR_API_URL before uploading field diagnostics.');
      }else{
        Alert.alert('Uploaded','Diagnostic session uploaded to the GoAR API.');
      }
    }catch(error){
      Alert.alert('Upload failed',error instanceof Error?error.message:'Could not upload diagnostics.');
    }finally{
      setUploading(null);
    }
  };

  return <SafeAreaView style={styles.page}>
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.kicker}>FIELD TESTING</Text>
      <Text style={styles.title}>AR Diagnostics</Text>
      <Text style={styles.copy}>Every navigation run records route error, tracking state, world/venue position, checkpoint corrections and reroute counts.</Text>
      {sessions.map((session)=>{
        const s=summarizeDiagnosticSession(session);
        return <View key={session.id} style={styles.card}>
          <Text style={styles.cardTitle}>{new Date(session.startedAt).toLocaleString()}</Text>
          <Text style={styles.metric}>{s.samples} samples · {s.reroutes} reroutes</Text>
          <Text style={styles.metric}>Mean route deviation {s.meanDistanceToRouteMeters.toFixed(2)} m</Text>
          <Text style={styles.metric}>Max route deviation {s.maxDistanceToRouteMeters.toFixed(2)} m</Text>
          <Text style={styles.metric}>Duration {s.durationSeconds.toFixed(0)} s</Text>
          <TouchableOpacity style={styles.upload} disabled={uploading===session.id} onPress={()=>upload(session)}>
            <Text style={styles.uploadText}>{uploading===session.id?'Uploading…':'Upload session'}</Text>
          </TouchableOpacity>
        </View>;
      })}
      {!sessions.length&&<Text style={styles.empty}>No diagnostic sessions recorded yet.</Text>}
      <TouchableOpacity style={styles.clear} onPress={async()=>{await clearDiagnosticSessions();void refresh();}}>
        <Text style={styles.clearText}>Clear diagnostics</Text>
      </TouchableOpacity>
    </ScrollView>
  </SafeAreaView>;
}
const styles=StyleSheet.create({
 page:{flex:1,backgroundColor:'#f7f8f5'},content:{padding:24},kicker:{fontSize:10,fontWeight:'900',letterSpacing:1.2,opacity:.4,marginTop:12},
 title:{fontSize:36,fontWeight:'900',marginTop:5},copy:{opacity:.58,lineHeight:21,marginTop:8,marginBottom:20},
 card:{backgroundColor:'#fff',borderRadius:20,padding:18,marginBottom:12},cardTitle:{fontWeight:'900',fontSize:16},metric:{marginTop:6,opacity:.65},
 upload:{marginTop:14,backgroundColor:'#111',borderRadius:12,padding:12,alignItems:'center'},uploadText:{color:'#fff',fontWeight:'900'},
 empty:{opacity:.5,marginVertical:30},clear:{padding:16,alignItems:'center'},clearText:{fontWeight:'800'}
});