import {useEffect,useReducer} from 'react';import {appEvents} from '../core/events';
export function useAppRefresh(){const[,tick]=useReducer(x=>x+1,0);useEffect(()=>appEvents.subscribe(()=>tick()),[]);return tick}
