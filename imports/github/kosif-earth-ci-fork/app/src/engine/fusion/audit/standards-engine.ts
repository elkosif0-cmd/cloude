export type StandardFramework='IFRS'|'IAS'|'IFRIC'|'SOCPA'|'ZATCA'|'ETHICS'|'INTERNAL'|'OTHER';

export type StandardRecord={
  id:string;
  code:string;
  title:string;
  framework:StandardFramework;
  effectiveDate?:string;
  tags:string[];
  sha256?:string;
  fileName?:string;
  fileSize?:number;
  notes?:string;
  active:boolean;
};

export function createStandard(input:Omit<StandardRecord,'id'|'active'>):StandardRecord{
  const code=input.code.trim();
  const title=input.title.trim();
  if(!code)throw new Error('STANDARD_CODE_REQUIRED');
  if(!title)throw new Error('STANDARD_TITLE_REQUIRED');
  return {
    ...input,
    id:'standard-'+code.toLowerCase().replace(/[^a-z0-9_-]+/gi,'-'),
    code,
    title,
    tags:[...new Set(input.tags.map(tag=>tag.trim()).filter(Boolean))],
    active:true,
  };
}

export function searchStandards(records:StandardRecord[],query:string){
  const q=query.trim().toLowerCase();
  if(!q)return records;
  return records.filter(record=>[
    record.code,record.title,record.framework,...record.tags,record.notes??''
  ].join(' ').toLowerCase().includes(q));
}
