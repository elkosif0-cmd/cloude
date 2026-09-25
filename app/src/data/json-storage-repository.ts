import type {EntityRecord, Repository} from './repository';
import {recordRepositoryChange} from './change-log';

export type StorageLike={
  getItem:(key:string)=>string|null;
  setItem:(key:string,value:string)=>void;
  removeItem:(key:string)=>void;
};

type Envelope<T>={
  version:1;
  records:T[];
};

export class JsonStorageRepository<T extends EntityRecord> implements Repository<T>{
  constructor(private readonly storage:StorageLike,private readonly key:string){}

  private readEnvelope():Envelope<T>{
    const raw=this.storage.getItem(this.key);
    if(!raw)return {version:1,records:[]};
    try{
      const parsed=JSON.parse(raw) as Partial<Envelope<T>>;
      if(parsed.version!==1||!Array.isArray(parsed.records))return {version:1,records:[]};
      return {version:1,records:parsed.records};
    }catch{return {version:1,records:[]};}
  }

  private write(records:T[]){
    this.storage.setItem(this.key,JSON.stringify({version:1,records}));
  }

  async list(){return structuredClone(this.readEnvelope().records);}

  async get(id:string){
    const row=this.readEnvelope().records.find((item)=>item.id===id);
    return row?structuredClone(row):null;
  }

  async put(record:T){
    const rows=this.readEnvelope().records;
    const index=rows.findIndex((item)=>item.id===record.id);
    const action=index>=0?'UPDATE':'CREATE';
    if(index>=0)rows[index]=structuredClone(record);
    else rows.push(structuredClone(record));
    this.write(rows);
    recordRepositoryChange(this.storage,{key:this.key,action,entityId:record.id});
    return structuredClone(record);
  }

  async putMany(records:T[]){
    const rows=this.readEnvelope().records;
    const map=new Map(rows.map((item)=>[item.id,item]));
    for(const record of records)map.set(record.id,structuredClone(record));
    const next=[...map.values()];
    this.write(next);
    recordRepositoryChange(this.storage,{key:this.key,action:'BATCH_PUT',count:records.length});
    return structuredClone(records);
  }

  async remove(id:string){
    const rows=this.readEnvelope().records;
    const existed=rows.some((item)=>item.id===id);
    this.write(rows.filter((item)=>item.id!==id));
    if(existed)recordRepositoryChange(this.storage,{key:this.key,action:'REMOVE',entityId:id});
  }

  async clear(){
    const count=this.readEnvelope().records.length;
    this.storage.removeItem(this.key);
    if(count>0)recordRepositoryChange(this.storage,{key:this.key,action:'CLEAR',count});
  }
}
