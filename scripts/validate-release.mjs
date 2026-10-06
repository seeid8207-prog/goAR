const errors=[];
const warnings=[];

const api=process.env.EXPO_PUBLIC_GOAR_API_URL||'';
const mapStyle=process.env.EXPO_PUBLIC_GOAR_MAP_STYLE_URL||'';
const adminToken=process.env.GOAR_ADMIN_TOKEN||'';
const databaseUrl=process.env.DATABASE_URL||'';

const isLocal=(value)=>/localhost|127\.0\.0\.1|10\.0\.2\.2/i.test(value);
const isHttps=(value)=>/^https:\/\//i.test(value);

if(!api)errors.push('EXPO_PUBLIC_GOAR_API_URL is required for production.');
else{
  if(isLocal(api))errors.push('Production API URL must not point to localhost/emulator.');
  if(!isHttps(api))errors.push('Production API URL must use HTTPS.');
}

if(!mapStyle)errors.push('EXPO_PUBLIC_GOAR_MAP_STYLE_URL is required for production.');
else{
  if(/demotiles\.maplibre\.org/i.test(mapStyle))errors.push('MapLibre demo tiles must not be used in production.');
  if(!isHttps(mapStyle))errors.push('Production map style URL must use HTTPS.');
}

if(!adminToken)warnings.push('GOAR_ADMIN_TOKEN is not set in this environment. Configure it on the API host.');
else if(adminToken==='change-me'||adminToken==='dev-admin-token')errors.push('Default GOAR_ADMIN_TOKEN must not be used in production.');

if(!databaseUrl)warnings.push('DATABASE_URL is not set. Production API should use PostgreSQL/PostGIS rather than file storage.');
else if(/goar:goar@localhost/i.test(databaseUrl))errors.push('Default local DATABASE_URL must not be used in production.');

if(errors.length){
  console.error('\nGoAR production configuration FAILED:\n');
  for(const error of errors)console.error(`- ${error}`);
  if(warnings.length){
    console.error('\nWarnings:');
    for(const warning of warnings)console.error(`- ${warning}`);
  }
  process.exit(1);
}

console.log('GoAR production configuration passed required checks.');
for(const warning of warnings)console.warn(`Warning: ${warning}`);
