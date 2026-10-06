import AsyncStorage from '@react-native-async-storage/async-storage';
import { OfflineManager } from '@maplibre/maplibre-react-native';
import type { VenueDefinition } from '../types/navigation';

type OfflineMapRecord={
  venueId:string;
  packId:string;
  createdAt:string;
  mapStyle:string;
  minZoom:number;
  maxZoom:number;
};

const recordKey=(venueId:string)=>`goar:offline-map:${venueId}:v1`;

function boundsForVenue(venue:VenueDefinition,paddingMeters=1200):[number,number,number,number]{
  const lat=venue.center.latitude;
  const lon=venue.center.longitude;
  const latDelta=paddingMeters/111_320;
  const lonScale=Math.max(.2,Math.cos(lat*Math.PI/180));
  const lonDelta=paddingMeters/(111_320*lonScale);
  return [lon-lonDelta,lat-latDelta,lon+lonDelta,lat+latDelta];
}

export async function createVenueOfflineMap(
  venue:VenueDefinition,
  onProgress?:(percentage:number,state:string)=>void,
){
  const existing=await loadVenueOfflineMapRecord(venue.id);
  if(existing){
    try{
      const pack=await OfflineManager.getPack(existing.packId);
      return {pack,record:existing,existing:true};
    }catch{}
  }

  const mapStyle=process.env.EXPO_PUBLIC_GOAR_MAP_STYLE_URL
    || 'https://demotiles.maplibre.org/style.json';
  const minZoom=12;
  const maxZoom=18;

  const pack=await OfflineManager.createPack(
    {
      mapStyle,
      minZoom,
      maxZoom,
      bounds:boundsForVenue(venue),
      metadata:{venueId:venue.id,name:`GoAR ${venue.name}`},
    },
    (_pack:any,status:any)=>{
      onProgress?.(Number(status?.percentage??0),String(status?.state??'active'));
    },
    (_pack:any,error:any)=>{
      throw new Error(String(error?.message??'Offline map download failed'));
    },
  );

  const record:OfflineMapRecord={
    venueId:venue.id,
    packId:pack.id,
    createdAt:new Date().toISOString(),
    mapStyle,
    minZoom,
    maxZoom,
  };
  await AsyncStorage.setItem(recordKey(venue.id),JSON.stringify(record));
  return {pack,record,existing:false};
}

export async function loadVenueOfflineMapRecord(venueId:string):Promise<OfflineMapRecord|null>{
  try{
    const raw=await AsyncStorage.getItem(recordKey(venueId));
    return raw?JSON.parse(raw):null;
  }catch{return null;}
}

export async function getVenueOfflineMapStatus(venueId:string){
  const record=await loadVenueOfflineMapRecord(venueId);
  if(!record)return null;
  try{
    const pack=await OfflineManager.getPack(record.packId);
    const status=await pack.status();
    return {record,status};
  }catch{return null;}
}

export async function removeVenueOfflineMap(venueId:string){
  const record=await loadVenueOfflineMapRecord(venueId);
  if(record){
    try{await OfflineManager.deletePack(record.packId);}catch{}
  }
  await AsyncStorage.removeItem(recordKey(venueId));
}
