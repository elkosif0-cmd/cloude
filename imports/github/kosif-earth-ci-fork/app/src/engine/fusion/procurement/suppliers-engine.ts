export type Supplier={
  id:string;
  code:string;
  name:string;
  taxNumber?:string;
  phone?:string;
  email?:string;
  active:boolean;
};

export type SupplierInput=Omit<Supplier,'id'|'active'>;

export type SupplierIssue={code:'MISSING_CODE'|'MISSING_NAME'|'DUPLICATE_CODE'|'DUPLICATE_TAX_NUMBER';supplierId?:string};

function clean(value:string){return value.trim();}

export function createSupplier(input:SupplierInput):Supplier{
  const code=clean(input.code);
  return {
    id:'supplier-'+code.toLowerCase().replace(/[^a-z0-9_-]+/gi,'-'),
    code,
    name:clean(input.name),
    taxNumber:clean(input.taxNumber??'')||undefined,
    phone:clean(input.phone??'')||undefined,
    email:clean(input.email??'').toLowerCase()||undefined,
    active:true,
  };
}

export function inspectSuppliers(suppliers:Supplier[]):SupplierIssue[]{
  const issues:SupplierIssue[]=[];
  const codes=new Set<string>();
  const taxes=new Set<string>();
  for(const supplier of suppliers){
    const code=supplier.code.trim().toLowerCase();
    if(!code) issues.push({code:'MISSING_CODE',supplierId:supplier.id});
    if(!supplier.name.trim()) issues.push({code:'MISSING_NAME',supplierId:supplier.id});
    if(code){
      if(codes.has(code)) issues.push({code:'DUPLICATE_CODE',supplierId:supplier.id});
      codes.add(code);
    }
    const tax=(supplier.taxNumber??'').replace(/\s/g,'');
    if(tax){
      if(taxes.has(tax)) issues.push({code:'DUPLICATE_TAX_NUMBER',supplierId:supplier.id});
      taxes.add(tax);
    }
  }
  return issues;
}
