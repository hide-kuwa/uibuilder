import { EditorState, InstanceNode, VariantDef } from '@/types/editor'
import { findNode } from '@/lib/tree'

export function resolveVariantRoot(state:EditorState, inst:InstanceNode){
  const def = state.components[inst.defId]
  if(!def) return null
  const set = def.variantSetId ? state.variantSets?.[def.variantSetId] : null
  if(!set) return findNode(state.tree, def.rootId)
  const props = inst.variantProps || {}
  let best: {score:number; v:VariantDef}|null = null
  for(const v of set.variants){
    let score = 0; let ok = true
    for(const [k,val] of Object.entries(v.props)){
      if(props[k]===undefined){ ok = false; break }
      if(props[k]===val) score+=2; else ok=false
    }
    if(ok && (!best || score>best.score)) best = {score, v}
  }
  const rootId = best?.v.rootId ?? def.rootId
  return findNode(state.tree, rootId)
}
