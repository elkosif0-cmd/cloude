import type {ReactNode} from 'react';
import './workspace-section-nav.css';

export type WorkspaceSectionItem={
  id:string;
  label:string;
  badge?:string|number;
};

export function WorkspaceSectionNav({
  items,
  active,
  onChange,
  ariaLabel='أقسام مساحة العمل',
}:{
  items:WorkspaceSectionItem[];
  active:string;
  onChange:(id:string)=>void;
  ariaLabel?:string;
}){
  return <nav className="workspace-section-nav" aria-label={ariaLabel}>
    <div className="workspace-section-nav__scroll">
      {items.map(item=><button key={item.id} type="button" data-active={active===item.id} onClick={()=>onChange(item.id)}>
        <span>{item.label}</span>{item.badge!==undefined?<b>{item.badge}</b>:null}
      </button>)}
    </div>
  </nav>;
}

export function WorkspaceSectionPage({id,active,children}:{id:string;active:string;children:ReactNode}){
  return <div className="workspace-section-page" data-active={id===active} aria-hidden={id!==active}>{children}</div>;
}
