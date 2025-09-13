'use client'
import React from 'react'
import DesignTokensCard from '@/components/editor/export/DesignTokensCard'
import AssetMapCard from '@/components/editor/export/AssetMapCard'
import DiffExportCard from '@/components/editor/export/DiffExportCard'
import ReactCodeCard from '@/components/editor/export/ReactCodeCard'
import PngExportCard from '@/components/editor/export/PngExportCard'

export default function ExportPanel() {
  return (
    <div className="space-y-3">
      <div className="text-xs uppercase tracking-wider text-zinc-400">Export</div>
      <DesignTokensCard />
      <AssetMapCard />
      <DiffExportCard />
      <PngExportCard />
      <ReactCodeCard />
    </div>
  )
}
