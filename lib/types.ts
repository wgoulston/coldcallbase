export type CallStatus = 'pending' | 'interested' | 'not_interested' | 'callback' | 'closed'

export interface ColdCall {
  id: string
  business_name: string
  address: string
  phone: string | null
  website: string | null
  created_by_email: string | null
  lat: number
  lng: number
  status: CallStatus
  notes: string | null
  called_at: string
  created_at: string
  updated_at: string
  created_by: string | null
}

export interface ColdCallInsert {
  business_name: string
  address: string
  phone?: string
  website?: string
  lat: number
  lng: number
  status: CallStatus
  notes?: string
  called_at?: string
}

export const STATUS_LABELS: Record<CallStatus, string> = {
  pending: 'Pending',
  interested: 'Interested',
  not_interested: 'Not Interested',
  callback: 'Call Back',
  closed: 'Closed',
}

export const STATUS_COLORS: Record<CallStatus, { bg: string; text: string; dot: string; hex: string }> = {
  pending:        { bg: 'bg-amber-100',  text: 'text-amber-800',  dot: 'bg-amber-500',  hex: '#F59E0B' },
  interested:     { bg: 'bg-green-100',  text: 'text-green-800',  dot: 'bg-green-500',  hex: '#10B981' },
  not_interested: { bg: 'bg-red-100',    text: 'text-red-800',    dot: 'bg-red-500',    hex: '#EF4444' },
  callback:       { bg: 'bg-blue-100',   text: 'text-blue-800',   dot: 'bg-blue-500',   hex: '#3B82F6' },
  closed:         { bg: 'bg-gray-100',   text: 'text-gray-700',   dot: 'bg-gray-400',   hex: '#9CA3AF' },
}
