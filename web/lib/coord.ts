import { useViewStore } from '@/store/viewStore'
export const worldToScreen = (x:number,y:number) => useViewStore.getState().worldToScreen({x,y})
export const screenToWorld = (x:number,y:number) => useViewStore.getState().screenToWorld({x,y})
