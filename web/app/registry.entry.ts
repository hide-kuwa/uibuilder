// App-level registry entry: choose which component packs to include
// Prefer workspace packs; keep local packs as fallback during development
try { require('@repo/comp-maps-jp') } catch {}
import '@/components/domain/basics/register'
import '@/components/domain/maps/register'

