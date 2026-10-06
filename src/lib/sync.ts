import type { MappingDataset } from '../types/venueMapping';

export type SyncAdapter={
  pushMapping:(dataset:MappingDataset)=>Promise<void>;
  pullMapping:(venueId:string)=>Promise<MappingDataset|null>;
};

export class LocalFirstSync{
  constructor(private readonly adapter:SyncAdapter){}
  async push(dataset:MappingDataset){await this.adapter.pushMapping(dataset);}
  async pull(venueId:string){return this.adapter.pullMapping(venueId);}
}

export function createHttpSyncAdapter(baseUrl:string,token?:string):SyncAdapter{
  const headers:Record<string,string>={'content-type':'application/json'};
  if(token) headers.authorization=`Bearer ${token}`;
  return{
    async pushMapping(dataset){
      const response=await fetch(`${baseUrl}/venues/${dataset.venueId}/mapping`,{method:'PUT',headers,body:JSON.stringify(dataset)});
      if(!response.ok) throw new Error(`Mapping upload failed: ${response.status}`);
    },
    async pullMapping(venueId){
      const response=await fetch(`${baseUrl}/venues/${venueId}/mapping`,{headers});
      if(response.status===404)return null;
      if(!response.ok)throw new Error(`Mapping download failed: ${response.status}`);
      return response.json();
    }
  };
}
