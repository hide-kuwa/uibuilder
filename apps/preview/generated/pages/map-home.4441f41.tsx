import React from 'react'
import { resolveBinding, Slot, useFlowRuntime } from '@chizu/renderer'
import * as R from '@chizu/registry'

export default function Page_MapHome_4441f41(){
const runtime=useFlowRuntime()
const N1=()=>R["TopNav"](resolveBinding(runtime,"N1",{},{}), runtime)
const N2=()=>R["PrefList"](resolveBinding(runtime,"N2",{},{}), runtime)
const N3=()=>R["Hero"](resolveBinding(runtime,"N3",{"title":"地図で集める旅"},{}), runtime)
const N4=()=>R["Text"](resolveBinding(runtime,"N4",{},{"text":{"inputs":[{"scope":"page","path":"prefCode"}],"formula":{"expr":"`都道府県コード: ${$0}`"}}}), runtime)
const N5=()=>R["Text"](resolveBinding(runtime,"N5",{},{"text":{"inputs":[{"scope":"page","path":"prefCode"},{"scope":"api","path":"prefStats"}],"formula":{"expr":"`${$1[$0]?.name ?? 'N/A'}：${$1[$0]?.population ?? '-'}人`"}}}), runtime)
const N6=()=>R["Image"](resolveBinding(runtime,"N6",{"alt":"","src":""},{}), runtime)
const N7=()=>R["Hero"](resolveBinding(runtime,"N7",{"title":"タイトル"},{}), runtime)
return R["Frame_Basic"]({"header":<Slot nodes={[N1]} />,"sidebar":<Slot nodes={[N2]} />,"content":<Slot nodes={[N3,N4,N5,N6,N7]} />,"footer":<Slot nodes={[]} />} , runtime)
}