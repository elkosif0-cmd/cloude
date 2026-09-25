export type CapabilityDecision = 'KEEP_LOGIC' | 'MERGE' | 'REBUILD' | 'DROP';
export type ProductDomain = 'home' | 'sales' | 'stock' | 'finance' | 'audit';
export type CapabilityDefinition = { id:string; label:string; route:string; domain:ProductDomain; decision?:CapabilityDecision };
