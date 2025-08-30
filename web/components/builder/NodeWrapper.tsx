'use client'
import * as React from 'react'
import PresetStyle from '@/components/interaction/PresetStyle'
import type { Effect } from '@/types/interactions'

type PresetProps = {
  presetIds?: string[] | null
  presetId?: string | null
  hoverEffects?: Effect[] | null
  hoverTransitionMs?: number | null
}

export interface NodeWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
  id: string
  type: string
  name?: string
  style?: React.CSSProperties
  presetProps?: PresetProps
  children: React.ReactNode
}

const NodeWrapper = React.forwardRef<HTMLDivElement, NodeWrapperProps>(function NodeWrapper(
  { id, type, name, style, presetProps, children, ...rest },
  ref
) {
  return (
    <div
      ref={ref}
      data-node-id={id}
      data-node-type={type}
      data-node-name={name}
      style={{ position: 'absolute', ...style }}
      {...rest}
    >
      {children}
      <PresetStyle nodeId={id} {...(presetProps || {})} />
    </div>
  )
})

export default NodeWrapper

