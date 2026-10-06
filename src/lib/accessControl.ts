import type { UserRole } from '../types/domain';

export type Capability='navigate'|'map-venue'|'publish-venue'|'manage-events';

const grants:Record<UserRole,Capability[]>={
  attendee:['navigate'],
  mapper:['navigate','map-venue'],
  'venue-admin':['navigate','map-venue','publish-venue','manage-events'],
};

export function can(role:UserRole,capability:Capability){
  return grants[role].includes(capability);
}
