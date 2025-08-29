import type { ComponentType } from 'react'

import Header from '@/components/blocks/Header'
import Footer from '@/components/blocks/Footer'
import Sidebar from '@/components/blocks/Sidebar'
import Container from '@/components/blocks/Container'
import Button from '@/components/blocks/Button'
import Text from '@/components/blocks/Text'
import Hud from '@/components/blocks/Hud'

export const registry: Record<string, ComponentType<any>> = {
  header: Header,
  footer: Footer,
  sidebar: Sidebar,
  container: Container,
  button: Button,
  text: Text,
  hud: Hud,
}

