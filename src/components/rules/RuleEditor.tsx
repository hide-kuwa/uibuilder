import React from 'react'
import { BuilderRule, useRuleStore } from '../../stores/ruleStore'

const newRuleDefaults = (): Omit<BuilderRule, 'id'> => ({
  trigger: 'click',
  sourceNodeId: '',
  enabled: true,
  action: { type: 'classToggle', targetNodeId: '', classNames: [] }
})

export const RuleEditor: React.FC = () => {
  const { rules, addRule, updateRule, removeRule, toggleRule } = useRuleStore()
  const handleAdd = () => addRule(newRuleDefaults())

  return (
    <div>
      <button className="mb-2 px-2 py-1 border" onClick={handleAdd}>
        Add Rule
      </button>
      {rules.map((rule) => (
        <div key={rule.id} className="border p-2 mb-2">
          <div className="flex items-center gap-2 mb-2">
            <input
              type="checkbox"
              checked={rule.enabled}
              onChange={(e) => toggleRule(rule.id, e.target.checked)}
            />
            <select
              value={rule.trigger}
              onChange={(e) =>
                updateRule(rule.id, { trigger: e.target.value as BuilderRule['trigger'] })
              }
            >
              <option value="click">click</option>
              <option value="hover">hover</option>
              <option value="inview">inview</option>
            </select>
            <input
              className="border px-1 py-0.5 flex-1"
              placeholder="source node id"
              value={rule.sourceNodeId}
              onChange={(e) => updateRule(rule.id, { sourceNodeId: e.target.value })}
            />
            <button className="text-red-500" onClick={() => removeRule(rule.id)}>
              x
            </button>
          </div>
          <ActionFields rule={rule} />
        </div>
      ))}
    </div>
  )
}

const ActionFields: React.FC<{ rule: BuilderRule }> = ({ rule }) => {
  const updateRule = useRuleStore((s) => s.updateRule)
  const action = rule.action
  return (
    <div className="space-y-1">
      <select
        value={action.type}
        onChange={(e) => {
          const t = e.target.value as BuilderRule['action']['type']
          if (t === 'classToggle')
            updateRule(rule.id, {
              action: { type: 'classToggle', targetNodeId: '', classNames: [] }
            })
          else if (t === 'scrollTo')
            updateRule(rule.id, {
              action: { type: 'scrollTo', selector: '', behavior: 'smooth' }
            })
          else
            updateRule(rule.id, { action: { type: 'navigate', href: '' } })
        }}
      >
        <option value="classToggle">classToggle</option>
        <option value="scrollTo">scrollTo</option>
        <option value="navigate">navigate</option>
      </select>

      {action.type === 'classToggle' && (
        <div className="space-y-1">
          <input
            className="border px-1 py-0.5 w-full"
            placeholder="target node id"
            value={action.targetNodeId}
            onChange={(e) =>
              updateRule(rule.id, {
                action: {
                  type: 'classToggle',
                  targetNodeId: e.target.value,
                  classNames: action.classNames
                }
              })
            }
          />
          <input
            className="border px-1 py-0.5 w-full"
            placeholder="class names (space separated)"
            value={action.classNames.join(' ')}
            onChange={(e) =>
              updateRule(rule.id, {
                action: {
                  type: 'classToggle',
                  targetNodeId: action.targetNodeId,
                  classNames: e.target.value.split(/\s+/).filter(Boolean)
                }
              })
            }
          />
        </div>
      )}

      {action.type === 'scrollTo' && (
        <div className="space-y-1">
          <input
            className="border px-1 py-0.5 w-full"
            placeholder="selector"
            value={action.selector}
            onChange={(e) =>
              updateRule(rule.id, {
                action: {
                  type: 'scrollTo',
                  selector: e.target.value,
                  behavior: action.behavior
                }
              })
            }
          />
          <select
            value={action.behavior || 'auto'}
            onChange={(e) =>
              updateRule(rule.id, {
                action: {
                  type: 'scrollTo',
                  selector: action.selector,
                  behavior: e.target.value as 'smooth' | 'auto'
                }
              })
            }
          >
            <option value="auto">auto</option>
            <option value="smooth">smooth</option>
          </select>
        </div>
      )}

      {action.type === 'navigate' && (
        <input
          className="border px-1 py-0.5 w-full"
          placeholder="href"
          value={action.href}
          onChange={(e) =>
            updateRule(rule.id, { action: { type: 'navigate', href: e.target.value } })
          }
        />
      )}
    </div>
  )
}

export default RuleEditor

