import type { Metadata } from 'next'
import ScriptPageClient from '@/components/ScriptPageClient'

export const metadata: Metadata = { title: 'Call Script — ColdCallBase' }

export default function ScriptPage() {
  return <ScriptPageClient />
}
