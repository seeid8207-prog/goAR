import { useEffect, useState } from 'react';
import { Alert, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { venueDefinition } from '../src/data/demoVenue';
import { downloadVenueOffline, getVenueOfflineStatus, removeVenueOffline } from '../src/lib/offlineBundle';

export default function OfflineVenueScreen(){
  const [ready,setReady]=useState(false);
  const [downloading,setDownloading]=useState(false);
  const [progress,setProgress]=useState(0);
  const [state,setState]=useState('not downloaded');

  const refresh=async()=>{
    const status=await getVenueOfflineStatus(venueDefinition.id);
    setReady(status.ready);
    const mapStatus:any=status.map?.status;
    if(status.ready){
      setProgress(Number(mapStatus?.percentage??100));
      setState(String(mapStatus?.state??'complete'));
    }else{
      setProgress(0);
      setState('not downloaded');
    }
  };

  useEffect(()=>{void refresh();},[]);

  const download=async()=>{
    try{
      setDownloading(true);
      await downloadVenueOffline(venueDefinition,(percentage,nextState)=>{
        setProgress(percentage);
        setState(nextState);
      });
      await refresh();
      Alert.alert('Offline venue ready','Outdoor map tiles and indoor route/seat data are stored on this device.');
    }catch(error){
      Alert.alert('Offline download failed',error instanceof Error?error.message:'Could not download venue data.');
    }finally{
      setDownloading(false);
    }
  };

  const remove=async()=>{
    await removeVenueOffline(venueDefinition.id);
    await refresh();
  };

  return <SafeAreaView style={styles.page}>
    <Text style={styles.kicker}>OFFLINE VENUE</Text>
    <Text style={styles.title}>{venueDefinition.name}</Text>
    <Text style={styles.copy}>Download the venue before the event so the outdoor approach map, indoor graph, seat map and checkpoints remain available when mobile reception is poor.</Text>

    <View style={styles.card}>
      <Text style={styles.status}>{ready?'READY OFFLINE':'NOT DOWNLOADED'}</Text>
      <Text style={styles.metric}>{Math.round(progress)}%</Text>
      <Text style={styles.state}>{state}</Text>
      <Text style={styles.note}>Tiles: zoom 12–18 around the venue · Indoor graph + mapping stored locally</Text>
    </View>

    <TouchableOpacity style={styles.primary} disabled={downloading} onPress={download}>
      <Text style={styles.primaryText}>{downloading?'Downloading…':'Download venue'}</Text>
    </TouchableOpacity>
    {ready&&<TouchableOpacity style={styles.secondary} onPress={remove}><Text style={styles.secondaryText}>Remove offline venue</Text></TouchableOpacity>}
  </SafeAreaView>;
}
const styles=StyleSheet.create({
 page:{flex:1,backgroundColor:'#f7f8f5',padding:24},kicker:{fontSize:10,fontWeight:'900',letterSpacing:1.2,opacity:.4,marginTop:18},
 title:{fontSize:36,fontWeight:'900',marginTop:5},copy:{opacity:.58,lineHeight:21,marginTop:8,marginBottom:22},
 card:{backgroundColor:'#fff',borderRadius:22,padding:20,marginBottom:18},status:{fontSize:11,fontWeight:'900',letterSpacing:1.1,opacity:.45},
 metric:{fontSize:48,fontWeight:'900',marginTop:8},state:{fontWeight:'800',marginTop:3},note:{opacity:.5,lineHeight:18,marginTop:12},
 primary:{backgroundColor:'#111',borderRadius:16,padding:17,alignItems:'center'},primaryText:{color:'#fff',fontWeight:'900',fontSize:16},
 secondary:{padding:16,alignItems:'center'},secondaryText:{fontWeight:'800'}
});
