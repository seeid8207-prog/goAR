import { buildOfflineVenuePackage } from './offlineBuilder';
import { createVenueOfflineMap, getVenueOfflineMapStatus, removeVenueOfflineMap } from './offlineMap';
import { saveOfflineVenue, removeOfflineVenue, loadOfflineVenue } from './offlineVenue';
import { loadMapping } from './mappingStore';
import type { VenueDefinition } from '../types/navigation';

export async function downloadVenueOffline(
  venue:VenueDefinition,
  onProgress?:(percentage:number,state:string)=>void,
){
  const mapping=await loadMapping(venue.id);
  const indoor=buildOfflineVenuePackage(venue,mapping);
  await saveOfflineVenue(indoor);
  const map=await createVenueOfflineMap(venue,onProgress);
  return {indoor,map};
}

export async function getVenueOfflineStatus(venueId:string){
  const [indoor,map]=await Promise.all([
    loadOfflineVenue(venueId),
    getVenueOfflineMapStatus(venueId),
  ]);
  return {indoor,map,ready:Boolean(indoor&&map)};
}

export async function removeVenueOffline(venueId:string){
  await Promise.all([
    removeOfflineVenue(venueId),
    removeVenueOfflineMap(venueId),
  ]);
}
