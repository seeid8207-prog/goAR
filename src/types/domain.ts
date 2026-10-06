export type UserRole='attendee'|'mapper'|'venue-admin';
export type AppUser={id:string;name:string;role:UserRole};

export type EventTicket={
  id:string;
  eventId:string;
  eventName:string;
  venueId:string;
  venueName:string;
  section:string;
  row:string;
  seat:string;
  holderName?:string;
};

export type VenuePackageManifest={
  venueId:string;
  version:string;
  generatedAt:string;
  checkpointIds:string[];
  files:string[];
};

export type SyncStatus='idle'|'dirty'|'syncing'|'synced'|'error';
