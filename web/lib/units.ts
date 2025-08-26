export type Unit = 'px' | '%' | 'rem'

export const toWorldPx = (
  value: number,
  unit: Unit,
  canvasSizePx: number,   // xなら幅、yなら高さで呼ぶ
  baseRemPx = 16
) => {
  switch (unit) {
    case 'px':
      return value
    case '%':
      return (value / 100) * canvasSizePx
    case 'rem':
      return value * baseRemPx
  }
}

export const fromWorldPx = (
  px: number,
  unit: Unit,
  canvasSizePx: number,
  baseRemPx = 16
) => {
  switch (unit) {
    case 'px':
      return px
    case '%':
      return (px / canvasSizePx) * 100
    case 'rem':
      return px / baseRemPx
  }
}
