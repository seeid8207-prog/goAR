import { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { clearDiagnosticSessions, loadDiagnosticSessions } from '../src/lib/diagnosticsStore';
import { summarizeDiagnosticSession } from '../src/lib/diagnostics';
import type { DiagnosticSession } from '../src/types/diagnostics';

export default function DiagnosticsScreen(){
  const [sessions,setSessions]=useState<DiagnosticSession[]>([]);
  const refresh=()=>loadDiagnosticSessions().then(setSessions);
  useEffect(refresh,[]);

  return <SafeAreaView style={styles.page}>
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.kicker}>FIELD TESTING</Text>
      <Text style={styles.title}>AR Diagnostics</Text>
      <Text style={styles.copy}>Every navigation run can record route error, tracking state, world/venue position and reroute counts for physical accuracy testing.</Text>
      {sessions.map((session)=>{
        const s=summarizeDiagnosticSession(session);
        return <View key={session.id} style={styles.card}>
          <Text style={styles.cardTitle}>{new Date(session.startedAt).toLocaleString()}</Text>
          <Text style={styles.metric}>{s.samples} samples · {s.reroutes} reroutes</Text>
          <Text style={styles.metric}>Mean route deviation {s.meanDistanceToRouteMeters.toFixed(2)} m</Text>
          <Text style={styles.metric}>Max route deviation {s.maxDistanceToRouteMeters.toFixed(2)} m</Text>
          <Text style={styles.metric}>Duration {s.durationSeconds.toFixed(0)} s</Text>
        </View>;
      })}
      {!sessions.length&&<Text style={styles.empty}>No diagnostic sessions recorded yet.</Text>}
      <TouchableOpacity style={styles.clear} onPress={async()=>{await clearDiagnosticSessions();refresh();}}>
        <Text style={styles.clearText}>Clear diagnostics</Text>
      </TouchableOpacity>
    </ScrollView>
  </SafeAreaView>;
}
const styles=StyleSheet.create({
 page:{flex:1,backgroundColor:'#f7f8f5'},content:{padding:24},kicker:{fontSize:10,fontWeight:'900',letterSpacing:1.2,opacity:.4,marginTop:12},
 title:{fontSize:36,fontWeight:'900',marginTop:5},copy:{opacity:.58,lineHeight:21,marginTop:8,marginBottom:20},
 card:{backgroundColor:'#fff',borderRadius:20,padding:18,marginBottom:12},cardTitle:{fontWeight:'900',fontSize:16},metric:{marginTop:6,opacity:.65},
 empty:{opacity:.5,marginVertical:30},clear:{padding:16,alignItems:'center'},clearText:{fontWeight:'800'}
});
