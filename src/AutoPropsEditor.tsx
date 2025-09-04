import React, { useEffect, useMemo, useState } from 'react'
import { useDataSources } from './dataSources'
import { PropBinding, useEditorState, useEditorActions } from './store'
import { library as componentMeta } from '../lib/registry'
import { t, generateKey, registerKey, getLanguage } from './lib/i18n'
import AssetPicker, { AssetMeta } from './components/assets/AssetPicker'
import { useEnumOptions } from './hooks/useEnumOptions'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from './components/ui/Tooltip'
import CodeMirror from '@uiw/react-codemirror'
import { json as jsonLang } from '@codemirror/lang-json'
import { safeParse, prettify } from './lib/jsonUtils'

interface PropMeta {
  name: string
  type: string
  required: boolean
  defaultValue?: string
  description: string
  options?: string[] | { source: string; endpoint: string }
}

interface AutoPropsEditorProps {
  selectedComponentType: string
  selectedProps: Record<string, any>
  onChange: (nextProps: Record<string, any>) => void
  bindings?: Record<string, PropBinding>
  onBindingsChange?: (next: Record<string, PropBinding>) => void
  variants?: { hover?: { className?: string } }
  onVariantsChange?: (v: { hover?: { className?: string } }) => void
}

function parseLiteralUnion(type: string): string[] | null {
  const parts = type.split('|').map((p) => p.trim()).filter(Boolean)
  if (!parts.length) return null
  const values: string[] = []
  for (const part of parts) {
    const strMatch = part.match(/^['"](.+)["']$/)
    if (strMatch) {
      values.push(strMatch[1])
      continue
    }
    const enumMatch = part.match(/^[A-Za-z0-9_\.]+$/)
    if (enumMatch) {
      values.push(part)
      continue
    }
    return null
  }
  return values
}

type EnumOptions = { source: string; endpoint: string }

const EnumSelect: React.FC<{
  options?: string[] | EnumOptions
  value: string | undefined
  onChange: (v: string) => void
  className: string
}> = ({ options, value, onChange, className }) => {
  const opts = useEnumOptions(options)
  return (
    <select className={className} value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
      <option value="" disabled>
        Select an option
      </option>
      {opts.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  )
}

const JsonEditor: React.FC<{ value: any; onChange: (v: any) => void; missing: boolean }> = ({
  value,
  onChange,
  missing,
}) => {
  const [text, setText] = useState<string>(() => (value ? prettify(value) : ''))
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setText(value ? prettify(value) : '')
  }, [value])

  useEffect(() => {
    const handle = setTimeout(() => {
      if (text.trim() === '') {
        onChange(undefined)
        setError(null)
        return
      }
      const { value: parsed, error } = safeParse(text)
      if (error) {
        setError(error.message)
      } else {
        setError(null)
        onChange(parsed)
      }
    }, 300)
    return () => clearTimeout(handle)
  }, [text, onChange])

  return (
    <div>
      <div className={`border rounded ${error ? 'border-red-500' : 'border-gray-300'}`}>
        <CodeMirror
          value={text}
          height="200px"
          extensions={[jsonLang()]}
          onChange={(val) => setText(val)}
        />
      </div>
      {error && <div className="text-xs text-red-600 mt-1">{error}</div>}
    </div>
  )
}

const LongTextArea: React.FC<{
  value: string | undefined
  onChange: (v: string | undefined) => void
  missing: boolean
}> = ({ value, onChange, missing }) => {
  const [text, setText] = useState(value ?? '')

  useEffect(() => {
    setText(value ?? '')
  }, [value])

  useEffect(() => {
    const handle = setTimeout(() => {
      onChange(text || undefined)
    }, 300)
    return () => clearTimeout(handle)
  }, [text, onChange])

  return (
    <textarea
      rows={6}
      className={`w-full border rounded px-2 py-1 ${missing ? 'border-red-500' : 'border-gray-300'}`}
      value={text}
      onChange={(e) => setText(e.target.value)}
    />
  )
}

const AutoPropsEditor: React.FC<AutoPropsEditorProps> = ({
  selectedComponentType,
  selectedProps,
  onChange,
  bindings = {},
  onBindingsChange,
  variants = {},
  onVariantsChange,
}) => {
  const [localProps, setLocalProps] = useState<Record<string, any>>({})
  const [localBindings, setLocalBindings] = useState<Record<string, PropBinding>>({})
  const [localVariants, setLocalVariants] = useState<{ hover?: { className?: string } }>({})
  const { sources } = useDataSources()
  const { inspectorTab } = useEditorState()
  const { setInspectorTab } = useEditorActions()

  useEffect(() => {
    setLocalProps(selectedProps || {})
    setLocalBindings(bindings || {})
    setLocalVariants(variants || {})
  }, [selectedComponentType, selectedProps, bindings, variants])

  useEffect(() => {
    const handle = setTimeout(() => onChange(localProps), 300)
    return () => clearTimeout(handle)
  }, [localProps, onChange])

  useEffect(() => {
    if (!onBindingsChange) return
    const handle = setTimeout(() => onBindingsChange(localBindings), 300)
    return () => clearTimeout(handle)
  }, [localBindings, onBindingsChange])

  useEffect(() => {
    if (!onVariantsChange) return
    const handle = setTimeout(() => onVariantsChange(localVariants), 300)
    return () => clearTimeout(handle)
  }, [localVariants, onVariantsChange])

  const meta = useMemo(() => componentMeta.find((m) => m.displayName === selectedComponentType), [
    componentMeta,
    selectedComponentType,
  ])

  const updateProp = (name: string, value: any) => {
    setLocalProps((prev) => ({ ...prev, [name]: value }))
  }

  const updateBinding = (name: string, value: PropBinding | undefined) => {
    setLocalBindings((prev) => {
      const next = { ...prev }
      if (!value) delete next[name]
      else next[name] = value
      return next
    })
  }

  const updateVariant = (value: string) => {
    setLocalVariants((prev) => ({
      ...prev,
      hover: { ...prev.hover, className: value },
    }))
  }

  const renderControl = (prop: PropMeta, missing: boolean) => {
    const value = localProps[prop.name]
    const binding = localBindings[prop.name]
    const common = `w-full border rounded px-2 py-1 ${missing ? 'border-red-500' : 'border-gray-300'}`

    if (binding) {
      return (
        <div className="space-y-1">
          {/* バインドUI */}
        </div>
      )
    }

    if (prop.type === 'enum') {
      return (
        <EnumSelect
          options={prop.options}
          value={value}
          onChange={(v) => updateProp(prop.name, v)}
          className={common}
        />
      )
    }

    const unionValues = parseLiteralUnion(prop.type)
    if (unionValues) {
      return (
        <select className={common} value={value ?? ''} onChange={(e) => updateProp(prop.name, e.target.value)}>
          <option value="" disabled>
            Select an option
          </option>
          {unionValues.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      )
    }

    if (prop.type === 'json') return <JsonEditor value={value} onChange={(v) => updateProp(prop.name, v)} missing={missing} />
    if (prop.type === 'longtext') return <LongTextArea value={value} onChange={(v) => updateProp(prop.name, v)} missing={missing} />
    if (prop.type === 'asset') return <AssetPicker value={value as AssetMeta | undefined} onSelect={(a) => updateProp(prop.name, a)} />

    // boolean, number, color, text ...（省略）

    return (
      <div className="flex space-x-1">
        <input type="text" className={`${common} flex-1`} value={value ?? ''} onChange={(e) => updateProp(prop.name, e.target.value)} />
      </div>
    )
  }

  if (!selectedComponentType) return <div className="p-2 text-sm text-gray-500">No component selected</div>

  return (
    <div className="space-y-4 p-2">
      {meta ? (
        <TooltipProvider>
          {meta.props.filter((p) => p.name !== 'className').map((prop) => {
            const value = localProps[prop.name]
            const missing = prop.required && (value === undefined || value === '')
            const label = <label className={`w-32 text-sm ${missing ? 'text-red-600' : ''}`}>{prop.name}</label>
            return (
              <div key={prop.name} className="flex items-center space-x-2">
                {prop.description ? (
                  <Tooltip>
                    <TooltipTrigger asChild>{label}</TooltipTrigger>
                    <TooltipContent>{prop.description}</TooltipContent>
                  </Tooltip>
                ) : (
                  label
                )}
                <div className="flex-1">{renderControl(prop, missing)}</div>
              </div>
            )
          })}
        </TooltipProvider>
      ) : (
        <div className="text-sm text-gray-500">No props info</div>
      )}
    </div>
  )
}

export default AutoPropsEditor
