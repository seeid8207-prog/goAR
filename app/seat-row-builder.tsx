import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { DEMO_VENUE } from '../src/data/demoVenue';
import { generateSeatRow } from '../src/lib/seatGenerator';
import { upsertMappingPoints } from '../src/lib/mappingStore';

export default function SeatRowBuilderScreen() {
  const [section,setSection]=useState('104');
  const [row,setRow]=useState('G');
  const [count,setCount]=useState('24');

  const generate=async()=>{
    const seatCount=Math.max(1,Number(count)||1);
    const points=generateSeatRow({
      venueId:DEMO_VENUE.id,floor:1,section,row,firstSeatNumber:1,seatCount,
      start:{x:55,y:3.2,z:46},end:{x:78,y:3.2,z:46},
    });
    await upsertMappingPoints(DEMO_VENUE.id,points);
    Alert.alert('Row generated',`${row}1–${row}${seatCount} saved to the venue map.`);
    router.back();
  };

  return <SafeAreaView style={styles.page}>
    <Text style={styles.title}>Generate seat row</Text>
    <Text style={styles.copy}>This demo interpolates seats between two mapped row endpoints. AR endpoint capture can replace the demo coordinates without changing the generator.</Text>
    <Text style={styles.label}>Section</Text><TextInput style={styles.input} value={section} onChangeText={setSection}/>
    <Text style={styles.label}>Row</Text><TextInput style={styles.input} value={row} onChangeText={setRow}/>
    <Text style={styles.label}>Seats</Text><TextInput style={styles.input} keyboardType="number-pad" value={count} onChangeText={setCount}/>
    <TouchableOpacity style={styles.button} onPress={generate}><Text style={styles.buttonText}>Generate & save row</Text></TouchableOpacity>
  </SafeAreaView>;
}
const styles=StyleSheet.create({
 page:{flex:1,backgroundColor:'#f7f8f5',padding:24},title:{fontSize:34,fontWeight:'900',marginTop:20},
 copy:{opacity:.58,lineHeight:21,marginTop:8,marginBottom:22},label:{fontWeight:'800',marginTop:12,marginBottom:6},
 input:{backgroundColor:'#fff',borderRadius:14,padding:15,fontSize:18},button:{backgroundColor:'#111',borderRadius:16,padding:17,alignItems:'center',marginTop:24},
 buttonText:{color:'#fff',fontWeight:'900'}
});
