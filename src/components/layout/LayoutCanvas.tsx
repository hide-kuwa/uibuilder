import React from 'react'
import { useTheme } from '../../hooks/useTheme'
import SlotResizer from './SlotResizer'
import {
  loadLayoutTemplate,
  saveLayoutTemplate,
  LayoutTemplate,
} from '../../lib/layoutTemplates'

interface LayoutCanvasProps {
  layoutId: string
}

export const LayoutCanvas: React.FC<LayoutCanvasProps> = ({ layoutId }) => {
  const [template, setTemplate] = React.useState<LayoutTemplate>(() =>
    loadLayoutTemplate(layoutId)
  )
  const { attrs } = useTheme({ layoutId, scope: 'local' })

  const update = (slot: 'header' | 'sidebar' | 'footer', value: number) => {
    setTemplate(prev => {
      const next: LayoutTemplate = {
        slots: {
          ...prev.slots,
          [slot]: {
            ...(prev.slots as any)[slot],
            [slot === 'sidebar' ? 'width' : 'height']: value,
          },
        },
      }
      saveLayoutTemplate(layoutId, next)
      return next
    })
  }

  return (
    <div {...attrs} className="w-full h-full flex flex-col">
      <div style={{ height: template.slots.header.height, position: 'relative' }}>
        <SlotResizer
          axis="y"
          value={template.slots.header.height}
          onChange={v => update('header', v)}
          className="absolute bottom-0 left-0 right-0 h-2"
        />
      </div>
      <div className="flex flex-1">
        <div
          style={{ width: template.slots.sidebar.width, position: 'relative' }}
          className="h-full"
        >
          <SlotResizer
            axis="x"
            value={template.slots.sidebar.width}
            onChange={v => update('sidebar', v)}
            className="absolute top-0 right-0 bottom-0 w-2"
          />
        </div>
        <div className="flex-1" />
      </div>
      <div style={{ height: template.slots.footer.height, position: 'relative' }}>
        <SlotResizer
          axis="y"
          value={template.slots.footer.height}
          onChange={v => update('footer', v)}
          className="absolute top-0 left-0 right-0 h-2"
        />
      </div>
    </div>
  )
}

export default LayoutCanvas
