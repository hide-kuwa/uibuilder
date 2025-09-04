import React, { useEffect, useMemo, useState } from 'react'
import { useDataSources } from './dataSources'
import { PropBinding, useEditorState, useEditorActions } from './store'
import { library as componentMeta } from '../lib/registry'
import { t, generateKey, registerKey, getLanguage } from './lib/i18n'
import AssetPicker, { AssetMeta } from './components/assets/AssetPicker'
import { groupProps, type PropMeta } from './lib/groupProps'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './components/ui/accordion'
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
import { Popover, PopoverTrigger, PopoverContent } from './components/ui/popover'
import { Calendar } from './components/ui/calendar'
import { formatDate, formatDateTime } from './utils/date'

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

const I18nTextInput: React.FC<{
  value: string | undefined
  onChange: (v: string | undefined) => void
  className: string
}> = ({ value, onChange, className }) => {
  const [text, setText] = useState('')

  useEffect(() => {
    setText(value ? t(value) : '')
  }, [value])

  useEffect(() => {
    const handle = setTimeout(() => {
      if (text === '') {
        onChange(undefined)
        return
      }
      const key = value || generateKey(text)
      registerKey(getLanguage(), key, text)
      onChange(key)
    }, 300)
    return () => clearTimeout(handle)
  }, [text, value, onChange])

  return (
    <input
      type="text"
      className={className}
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

  const groupedProps = useMemo(() => {
    if (!meta) return {}
    const props = meta.props.filter((p) => p.name !== 'className')
    return groupProps(props)
  }, [meta])

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
          {/* バインドUI実装はここに */}
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
          <option value="" disabled>Select an option</option>
          {unionValues.map((v) => <option key={v} value={v}>{v}</option>)}
        </select>
      )
    }

    if (prop.type === 'json') return <JsonEditor value={value} onChange={(v) => updateProp(prop.name, v)} missing={missing} />
    if (prop.type === 'longtext') return <LongTextArea value={value} onChange={(v) => updateProp(prop.name, v)} missing={missing} />
    if (prop.type === 'asset') return <AssetPicker value={value as AssetMeta | undefined} onSelect={(a) => updateProp(prop.name, a)} />

    if (prop.type === 'date' || prop.type === 'datetime') {
      const date = value ? new Date(value) : new Date()
      const display = value || (prop.type === 'date' ? formatDate(date) : formatDateTime(date))
      return (
        <Popover>
          <PopoverTrigger asChild>
            <button className={common}>{display}</button>
          </PopoverTrigger>
          <PopoverContent className="p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(d) => {
                if (!d) return
                if (prop.type === 'date') updateProp(prop.name, formatDate(d))
                else {
                  const nd = new Date(d)
                  updateProp(prop.name, formatDateTime(nd))
                }
              }}
            />
            {prop.type === 'datetime' && (
              <div className="p-2">
                <input
                  type="time"
                  className="w-full border rounded px-2 py-1"
                  value={`${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`}
                  onChange={(e) => {
                    const [h, m] = e.target.value.split(':').map(Number)
                    const nd = new Date(date)
                    nd.setHours(h, m, 0, 0)
                    updateProp(prop.name, formatDateTime(nd))
                  }}
                />
              </div>
            )}
          </PopoverContent>
        </Popover>
      )
    }

    if (prop.type === 'boolean') {
      return (
        <input
          type="checkbox"
          className="h-4 w-4"
          checked={!!value}
          onChange={(e) => updateProp(prop.name, e.target.checked)}
        />
      )
    }

    if (prop.type === 'number') {
      return (
        <input
          type="number"
          className={common}
          value={value ?? ''}
          onChange={(e) => {
            const v = e.target.value
            updateProp(prop.name, v === '' ? undefined : Number(v))
          }}
        />
      )
    }

    if (prop.type === 'string') {
      if (prop.name.toLowerCase().includes('color')) {
        return (
          <input
            type="color"
            className={common}
            value={value ?? '#000000'}
            onChange={(e) => updateProp(prop.name, e.target.value)}
          />
        )
      }
      return (
        <I18nTextInput
          className={common}
          value={value}
          onChange={(v) => updateProp(prop.name, v)}
        />
      )
    }

    return (
      <div className="flex space-x-1">
        <input
          type="text"
          className={`${common} flex-1`}
          value={value ?? ''}
          onChange={(e) => updateProp(prop.name, e.target.value)}
        />
      </div>
    )
  }

  if (!selectedComponentType) return <div className="p-2 text-sm text-gray-500">No component selected</div>

  return (
    <div className="space-y-4 p-2">
      {meta ? (
        <Accordion type="multiple" defaultValue={['General']}>
          {Object.entries(groupedProps).map(([group, props]) => (
            <AccordionItem key={group} value={group}>
              <AccordionTrigger>{group}</AccordionTrigger>
              <AccordionContent className="space-y-2">
                {props.map((prop) => {
                  const value = localProps[prop.name]
                  const missing = prop.required && (value === undefined || value === '')
                  const label = (
                    <label className={`w-32 text-sm ${missing ? 'text-red-600' : ''}`}>
                      {prop.name}
                    </label>
                  )
                  return (
                    <div key={prop.name} className="flex items-center space-x-2">
                      {prop.description ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>{label}</TooltipTrigger>
                            <TooltipContent>{prop.description}</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        label
                      )}
                      <div className="flex-1">{renderControl(prop, missing)}</div>
                    </div>
                  )
                })}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <div className="text-sm text-gray-500">No props info</div>
      )}
    </div>
  )
}

export default AutoPropsEditor
