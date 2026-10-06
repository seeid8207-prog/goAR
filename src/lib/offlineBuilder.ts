import type { VenueDefinition } from '../types/navigation';
import type { MappingDataset } from '../types/venueMapping';
import type { OfflineVenuePackage } from './offlineVenue';

export function buildOfflineVenuePackage(venue:VenueDefinition,mapping:MappingDataset):OfflineVenuePackage{
  const checkpointIds=venue.points.filter((point)=>point.kind==='checkpoint').map((point)=>point.id);
  return{
    manifest:{
      venueId:venue.id,
      version:`1-${mapping.updatedAt}`,
      generatedAt:new Date().toISOString(),
      checkpointIds,
      files:['venue.json','navigation-graph.json','mapping.json'],
    },
    venue,
    mapping,
  };
}
