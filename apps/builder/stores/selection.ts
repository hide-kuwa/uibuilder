'use client'

import { create } from 'zustand'
import type { InteractionPreset } from '@/types/interactions'
import {
  applyPresetToNodes,
  createEmptyRule,
  type ActionRule,
  type ApplyMode,
  type NodeWithActions,
} from '@/lib/actions/apply'

export type SelectionNode = NodeWithActions

type SelectionState = {
  nodes: SelectionNode[]
  setNodes: (nodes: SelectionNode[]) => void
  clear: () => void
  applyPreset: (preset: InteractionPreset, mode: ApplyMode) => void
  addEmptyRule: (nodeId: string) => void
  updateRule: (nodeId: string, ruleId: string, patch: Partial<ActionRule>) => void
  removeRule: (nodeId: string, ruleId: string) => void
  setRules: (nodeId: string, rules: ActionRule[]) => void
}

function replaceNode(nodes: SelectionNode[], nodeId: string, updater: (node: SelectionNode) => SelectionNode): SelectionNode[] {
  return nodes.map((node) => (node.id === nodeId ? updater(node) : node))
}

export const useSelectionStore = create<SelectionState>((set, get) => ({
  nodes: [],
  setNodes(nodes) {
    set({ nodes })
  },
  clear() {
    set({ nodes: [] })
  },
  applyPreset(preset, mode) {
    const nodes = get().nodes
    if (!nodes.length) return
    const next = applyPresetToNodes(preset, nodes, mode)
    set({ nodes: next })
  },
  addEmptyRule(nodeId) {
    set((state) => ({
      nodes: replaceNode(state.nodes, nodeId, (node) => ({
        ...node,
        actionRules: [...(node.actionRules ?? []), createEmptyRule()],
      })),
    }))
  },
  updateRule(nodeId, ruleId, patch) {
    set((state) => ({
      nodes: replaceNode(state.nodes, nodeId, (node) => ({
        ...node,
        actionRules: (node.actionRules ?? []).map((rule) =>
          rule.id === ruleId ? { ...rule, ...patch } : rule,
        ),
      })),
    }))
  },
  removeRule(nodeId, ruleId) {
    set((state) => ({
      nodes: replaceNode(state.nodes, nodeId, (node) => ({
        ...node,
        actionRules: (node.actionRules ?? []).filter((rule) => rule.id !== ruleId),
      })),
    }))
  },
  setRules(nodeId, rules) {
    set((state) => ({
      nodes: replaceNode(state.nodes, nodeId, (node) => ({
        ...node,
        actionRules: [...rules],
      })),
    }))
  },
}))

