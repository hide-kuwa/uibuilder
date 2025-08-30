export type Unit = 'px' | 'percent' | 'rem'

export const unitToWorld = (
  value: number,
  unit: Unit,
  canvasSizePx: number, // xなら幅、yなら高さで呼ぶ
  remBase = 16
) => {
  switch (unit) {
    case 'px':
      return value
    case 'percent':
      return (value / 100) * canvasSizePx
    case 'rem':
      return value * remBase
  }
}

export const worldToUnit = (
  px: number,
  unit: Unit,
  canvasSizePx: number,
  remBase = 16
) => {
  switch (unit) {
    case 'px':
      return px
    case 'percent':
      return (px / canvasSizePx) * 100
    case 'rem':
      return px / remBase
  }
}
