'use client'

import React from 'react'
import KeyboardHelpModal from './modals/KeyboardHelpModal'
import { useHotkeysHelp } from '../hooks/useHotkeysHelp'

export default function RootHotkeys() {
  const { open, setOpen } = useHotkeysHelp()
  return <KeyboardHelpModal open={open} onClose={() => setOpen(false)} />
}

