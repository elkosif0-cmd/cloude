export type JevChoiceRequest={
  state:unknown;
  instructions:string;
  criteria:Record<string,string|null>;
};

export type JevChoiceResponse={
  choice:string;
  confidence:number;
  probabilities:Record<string,number>;
};

export interface JevClient{
  choice(request:JevChoiceRequest):Promise<JevChoiceResponse>;
}

export class JevGateway{
  constructor(private readonly client:JevClient){}

  async decide(request:JevChoiceRequest){
    if(Object.keys(request.criteria).length<2)throw new Error('JEV_CHOICE_REQUIRES_TWO_OPTIONS');
    const result=await this.client.choice(request);
    if(!(result.choice in request.criteria))throw new Error('JEV_RETURNED_UNKNOWN_OPTION');
    const confidence=Math.min(1,Math.max(0,result.confidence));
    return {...result,confidence};
  }
}
