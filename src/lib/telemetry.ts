export type TelemetryEvent=
  | {name:'route_started';venueId:string;destinationId:string}
  | {name:'reroute';venueId:string;distanceFromRoute:number}
  | {name:'checkpoint_localized';venueId:string;checkpointId:string;method:string}
  | {name:'checkpoint_corrected';venueId:string;checkpointId:string;driftMeters:number;confidence:number}
  | {name:'arrived';venueId:string;destinationId:string}
  | {name:'mapping_point_saved';venueId:string;kind:string};

const queue:TelemetryEvent[]=[];

export function track(event:TelemetryEvent){queue.push(event);}
export function drainTelemetry(){return queue.splice(0,queue.length);}
export function peekTelemetry(){return [...queue];}
