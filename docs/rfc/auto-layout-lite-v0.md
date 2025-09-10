# AutoLayout-lite v0 (RFC)

目的: v0で提供する Stack（水平/垂直）のふるまいを明確化し、実装/レンダラ/エクスポータの解釈を一致させる。

## 概念
- Stack ノードは CSS Flexbox に一次対応（H=row, V=column）。
- 子は「レイアウト管理対象」。`x,y` は無視（W/H は使用）。
- v0 は wrap/分岐/複雑な整列は対象外。`SPACE_BETWEEN` のみ特別扱い。

## プロパティ
- `direction: 'H'|'V'` → `flex-direction: row|column`
- `spacing: number` → `gap: <px>`
- `padding: {t,r,b,l}` → `padding`
- `align: 'START'|'CENTER'|'END'|'SPACE_BETWEEN'`
  - main/cross の割当:
    - H(row): main=水平方向, cross=垂直方向
    - V(column): main=垂直方向, cross=水平方向
  - mapping（簡易）:
    - START → `justify-content: flex-start; align-items: flex-start`
    - CENTER → `justify-content: center; align-items: center`
    - END → `justify-content: flex-end; align-items: flex-end`
    - SPACE_BETWEEN → `justify-content: space-between; align-items: center`

## 子ノードのサイズ
- `width/height` は固定ピクセルとして扱う（v0）。auto/min/max は対象外。
- Text の高さは計算後のバウンディングを採用（v0では単行前提）。

## 受け入れ基準
- Stack 直下の子が `spacing/padding/align` に応じて安定配置。
- v0では drag 移動は「順序変更」のみ（x/yは効かない）——実装は後続、仕様として明記。
