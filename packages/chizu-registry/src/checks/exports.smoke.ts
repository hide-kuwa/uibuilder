// append-only type smoke: compile-time only
import * as R from '../index'
type Fn = (...a: any[]) => any
// 失敗時は tsc が落ちる（実行ファイルではない）
const _check: Record<string, Fn> = {
  Text: R.Text, Image: R.Image, Hero: R.Hero, TopNav: R.TopNav, PrefList: R.PrefList,
  Frame_Basic: R.Frame_Basic, Frame_Toponly: R.Frame_Toponly, Frame_TopOnly: (R as any).Frame_TopOnly, Frame_Wide: R.Frame_Wide,
}
export {}

