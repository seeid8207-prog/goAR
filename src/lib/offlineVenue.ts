import AsyncStorage from '@react-native-async-storage/async-storage';
import type { VenuePackageManifest } from '../types/domain';
import type { MappingDataset } from '../types/venueMapping';
import type { VenueDefinition } from '../types/navigation';

export type OfflineVenuePackage={
  manifest:VenuePackageManifest;
  venue:VenueDefinition;
  mapping:MappingDataset;
};

const key=(venueId:string)=>`goar:offline:${venueId}:v1`;

export async function saveOfflineVenue(pkg:OfflineVenuePackage){
  await AsyncStorage.setItem(key(pkg.manifest.venueId),JSON.stringify(pkg));
}
export async function loadOfflineVenue(venueId:string):Promise<OfflineVenuePackage|null>{
  try{const raw=await AsyncStorage.getItem(key(venueId));return raw?JSON.parse(raw):null;}catch{return null;}
}
export async function removeOfflineVenue(venueId:string){await AsyncStorage.removeItem(key(venueId));}
