import { ViroARSceneNavigator } from '@reactvision/react-viro';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import VenueMapperARScene from '../src/components/VenueMapperARScene';
import { DEMO_VENUE } from '../src/data/demoVenue';
import { loadMapping, upsertMappingPoints } from '../src/lib/mappingStore';
import { requestNativeCenterRaycast } from '../src/lib/nativeArBridge';
import { track } from '../src/lib/telemetry';
import type { MappingPoint } from '../src/types/venueMapping';

export default function ARMapScreen(){
  const [points,setPoints]=useState<MappingPoint[]>([]);
  const [section,setSection]=useState('104');
  const [row,setRow]=useState('G');
  const [seat,setSeat]=useState('1');
  const [tracking,setTracking]=useState('initializing');
  const [lastHit,setLastHit]=useState('none');

  useEffect(()=>{loadMapping(DEMO_VENUE.id).then((d)=>setPoints(d.points));},[]);

  const place=async()=>{
    const hit=await requestNativeCenterRaycast();
    if(!hit){
      Alert.alert('No surface found','Aim at the physical seat or floor edge and move the phone slowly until AR detects a plane, depth point or feature point.');
      return;
    }

    if(hit.confidence<.6){
      Alert.alert('Low-confidence hit','Move closer or improve lighting, then try again.');
      return;
    }

    const point:MappingPoint={
      id:`seat-${section}-${row}-${seat}`.toLowerCase(),
      venueId:DEMO_VENUE.id,
      label:`Seat ${seat}`,
      kind:'seat',
      floor:1,
      position:hit.position,
      section,row,seat,
      confidence:hit.confidence,
      hitType:hit.hitType,
    } as MappingPoint;

    const data=await upsertMappingPoints(DEMO_VENUE.id,[point]);
    setPoints(data.points);
    setLastHit(`${hit.hitType} · ${Math.round(hit.confidence*100)}%`);
    track({name:'mapping_point_saved',venueId:DEMO_VENUE.id,kind:'seat'});
    setSeat(String((Number(seat)||0)+1));
  };

  return <View style={styles.root}>
    <ViroARSceneNavigator
      autofocus
      initialScene={{scene:VenueMapperARScene}}
      viroAppProps={{points,onTrackingState:setTracking}}
      style={StyleSheet.absoluteFill}
    />
    <SafeAreaView style={styles.overlay} pointerEvents="box-none">
      <View style={styles.top}>
        <TouchableOpacity style={styles.circle} onPress={()=>router.back()}><Text style={styles.back}>‹</Text></TouchableOpacity>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>AR VENUE MAPPER · {points.length} POINTS</Text>
          <Text style={styles.badgeSub}>{tracking} · last hit {lastHit}</Text>
        </View>
      </View>
      <View>
        <View style={styles.reticle}><Text style={styles.reticleText}>＋</Text></View>
        <View style={styles.panel}>
          <View style={styles.inputs}>
            <TextInput style={styles.input} value={section} onChangeText={setSection} placeholder="Section"/>
            <TextInput style={styles.input} value={row} onChangeText={setRow} placeholder="Row"/>
            <TextInput style={styles.input} value={seat} onChangeText={setSeat} keyboardType="number-pad" placeholder="Seat"/>
          </View>
          <Text style={styles.help}>Aim the reticle at the real seat and tap Place. GoAR prefers detected planes, then depth points, then AR feature points.</Text>
          <TouchableOpacity style={styles.primary} onPress={place}><Text style={styles.primaryText}>Place seat</Text></TouchableOpacity>
          <TouchableOpacity style={styles.secondary} onPress={()=>router.push('/seat-row-builder')}><Text style={styles.secondaryText}>Bulk generate row</Text></TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  </View>;
}
const styles=StyleSheet.create({
 root:{flex:1,backgroundColor:'#000'},overlay:{flex:1,justifyContent:'space-between',padding:16},
 top:{flexDirection:'row',gap:10,alignItems:'center'},circle:{width:46,height:46,borderRadius:23,backgroundColor:'rgba(0,0,0,.7)',alignItems:'center',justifyContent:'center'},
 back:{fontSize:34,color:'#fff'},badge:{flex:1,backgroundColor:'rgba(0,0,0,.7)',padding:14,borderRadius:18,alignItems:'center'},
 badgeText:{color:'#fff',fontWeight:'900',fontSize:11},badgeSub:{color:'#fff',opacity:.6,fontSize:10,marginTop:3},
 reticle:{alignSelf:'center',marginBottom:80},reticleText:{color:'#fff',fontSize:42,fontWeight:'300'},
 panel:{backgroundColor:'rgba(0,0,0,.82)',borderRadius:24,padding:16},inputs:{flexDirection:'row',gap:8},
 input:{flex:1,backgroundColor:'#fff',borderRadius:12,padding:11,fontWeight:'800'},help:{color:'#fff',opacity:.62,lineHeight:18,marginVertical:12,fontSize:12},
 primary:{backgroundColor:'#fff',borderRadius:14,padding:15,alignItems:'center'},primaryText:{fontWeight:'900'},
 secondary:{padding:13,alignItems:'center'},secondaryText:{color:'#fff',fontWeight:'800'}
});
