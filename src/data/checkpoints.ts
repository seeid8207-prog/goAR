import type { VenueCheckpointDefinition } from '../types/checkpoints';

export const demoCheckpoints: VenueCheckpointDefinition[] = [
  {
    id:'cp-gate-a',
    venueId:'demo-stadium',
    label:'Gate A',
    floor:0,
    qrValue:'SEATNAV:demo-stadium:cp-gate-a',
    venuePosition:{x:4,y:0,z:6},
    markerWidthMeters:0.2,
    venueYawDeg:0,
  },
  {
    id:'cp-east-concourse',
    venueId:'demo-stadium',
    label:'East Concourse',
    floor:0,
    qrValue:'SEATNAV:demo-stadium:cp-east-concourse',
    venuePosition:{x:41,y:0,z:20},
    markerWidthMeters:0.2,
    venueYawDeg:0,
  },
  {
    id:'cp-section-104',
    venueId:'demo-stadium',
    label:'Section 104',
    floor:1,
    qrValue:'SEATNAV:demo-stadium:cp-section-104',
    venuePosition:{x:58,y:3.2,z:43},
    markerWidthMeters:0.2,
    venueYawDeg:0,
  },
];

export function findCheckpoint(id:string){
  return demoCheckpoints.find((checkpoint)=>checkpoint.id===id)??null;
}
