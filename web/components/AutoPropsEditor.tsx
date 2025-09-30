'use client'
import React, { useEffect, useMemo, useState } from 'react'
import { useDataSources } from './dataSources'
import { PropBinding, useEditorState, useEditorActions } from './store'
import { library as componentMeta } from '@/lib/presets/registry'
import { t, generateKey, registerKey, getLanguage } from './lib/i18n'
import AssetPicker, { AssetMeta } from './components/assets/AssetPicker'
import { groupProps, type PropMeta } from './lib/groupProps'

interface Props {
  selectedComponentType: string
  selectedProps: Record<string, any>
  onChange: (next: Record<string, any>) => void
}

const AutoPropsEditor: React.FC<Props> = ({ selectedComponentType, selectedProps, onChange }) => {
  return (
    <textarea
      className="w-full border rounded px-2 py-1 text-xs"
      value={JSON.stringify(selectedProps, null, 2)}
      onChange={e => {
        try {
          onChange(JSON.parse(e.target.value))
        } catch {}
      }}
    />
  )
}

export default AutoPropsEditor
