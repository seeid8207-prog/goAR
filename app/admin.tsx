import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { DEMO_VENUE } from '../src/data/demoVenue';
import { loadMapping } from '../src/lib/mappingStore';

export default function AdminScreen() {
  const [count, setCount] = useState(0);
  useEffect(() => { loadMapping(DEMO_VENUE.id).then((data) => setCount(data.points.length)); }, []);

  return (
    <SafeAreaView style={styles.page}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.kicker}>VENUE ADMIN</Text>
        <Text style={styles.title}>{DEMO_VENUE.name}</Text>
        <Text style={styles.copy}>Map physical venue points, generate seat rows and prepare the venue for attendee navigation.</Text>

        <View style={styles.card}>
          <Text style={styles.metric}>{count}</Text>
          <Text style={styles.label}>saved spatial points</Text>
        </View>

        <TouchableOpacity style={styles.primary} onPress={() => router.push('/ar-map')}>
          <Text style={styles.primaryText}>Open AR Mapper</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondary} onPress={() => router.push('/seat-row-builder')}>
          <Text style={styles.secondaryText}>Generate Seat Row</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondary} onPress={() => router.push('/diagnostics')}>
          <Text style={styles.secondaryText}>AR Field Diagnostics</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles=StyleSheet.create({
  page:{flex:1,backgroundColor:'#f7f8f5'},content:{padding:24},
  kicker:{fontSize:10,fontWeight:'900',letterSpacing:1.2,opacity:.4,marginTop:12},
  title:{fontSize:36,fontWeight:'900',marginTop:5},copy:{opacity:.58,lineHeight:21,marginTop:8},
  card:{backgroundColor:'#fff',borderRadius:22,padding:22,marginVertical:24},
  metric:{fontSize:42,fontWeight:'900'},label:{opacity:.5,marginTop:2},
  primary:{backgroundColor:'#111',padding:17,borderRadius:16,alignItems:'center'},
  primaryText:{color:'#fff',fontWeight:'900'},secondary:{padding:17,alignItems:'center',marginTop:8},
  secondaryText:{fontWeight:'900'}
});
