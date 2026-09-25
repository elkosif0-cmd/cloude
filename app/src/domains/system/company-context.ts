export type Company={
  id:string;
  name:string;
  country:string;
  currency:string;
};

export type FiscalPeriod={
  id:string;
  companyId:string;
  startDate:string;
  endDate:string;
  label:string;
};

export type CompanyContext={
  company:Company|null;
  period:FiscalPeriod|null;
};

export function selectCompany(companies:Company[],periods:FiscalPeriod[],companyId:string,periodId?:string):CompanyContext{
  const company=companies.find((item)=>item.id===companyId)??null;
  if(!company)return {company:null,period:null};
  const companyPeriods=periods.filter((item)=>item.companyId===company.id);
  const period=(periodId?companyPeriods.find((item)=>item.id===periodId):companyPeriods[0])??null;
  return {company,period};
}

export function validatePeriod(period:FiscalPeriod){
  const start=Date.parse(period.startDate);
  const end=Date.parse(period.endDate);
  return Number.isFinite(start)&&Number.isFinite(end)&&start<=end;
}
