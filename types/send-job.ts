export type SendJobStatus = 'queued' | 'processing' | 'completed' | 'failed' | 'stopped'

export type SendJobSummary = {
  id: string
  status: SendJobStatus
  totalContacts: number
  processedContacts: number
  successContacts: number
  failedContacts: number
  requestedStop: boolean
  lastError: string | null
  lastContactName: string | null
  startedAt: string | null
  finishedAt: string | null
  createdAt: string
  updatedAt: string
}

