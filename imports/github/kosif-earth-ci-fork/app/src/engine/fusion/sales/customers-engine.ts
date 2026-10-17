export type Customer = {
  id: string;
  code: string;
  name: string;
  phone?: string;
  email?: string;
  city?: string;
  active: boolean;
};

export type CustomerInput = Omit<Customer,'id'|'active'>;

export type CustomerIssueCode = 'MISSING_CODE' | 'MISSING_NAME' | 'DUPLICATE_CODE' | 'DUPLICATE_PHONE';

export type CustomerIssue = {
  code: CustomerIssueCode;
  customerId?: string;
};

function normalize(value:string){return value.trim();}
function normalizePhone(value?:string){return (value??'').replace(/\D/g,'');}

export function createCustomer(input:CustomerInput):Customer{
  const code=normalize(input.code);
  return {
    id:'customer-'+code.toLowerCase().replace(/[^a-z0-9_-]+/gi,'-'),
    code,
    name:normalize(input.name),
    phone:normalize(input.phone??'')||undefined,
    email:normalize(input.email??'').toLowerCase()||undefined,
    city:normalize(input.city??'')||undefined,
    active:true,
  };
}

export function inspectCustomers(customers:Customer[]):CustomerIssue[]{
  const issues:CustomerIssue[]=[];
  const codes=new Map<string,string>();
  const phones=new Map<string,string>();

  for(const customer of customers){
    const code=customer.code.trim().toLowerCase();
    if(!code) issues.push({code:'MISSING_CODE',customerId:customer.id});
    if(!customer.name.trim()) issues.push({code:'MISSING_NAME',customerId:customer.id});
    if(code){
      if(codes.has(code)) issues.push({code:'DUPLICATE_CODE',customerId:customer.id});
      else codes.set(code,customer.id);
    }
    const phone=normalizePhone(customer.phone);
    if(phone){
      if(phones.has(phone)) issues.push({code:'DUPLICATE_PHONE',customerId:customer.id});
      else phones.set(phone,customer.id);
    }
  }

  return issues;
}
