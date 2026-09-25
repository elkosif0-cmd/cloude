export type CapabilityDecision = 'KEEP_LOGIC' | 'MERGE' | 'REBUILD' | 'DROP';
export type ProductDomain = 'home' | 'sales' | 'stock' | 'procurement' | 'finance' | 'audit' | 'catalog' | 'intelligence' | 'reports' | 'system';
export type CapabilityDefinition = { id:string; label:string; route:string; domain:ProductDomain; decision?:CapabilityDecision };
