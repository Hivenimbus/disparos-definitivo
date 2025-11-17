import { computed, watch } from 'vue'
import type { SendJobStatus, SendJobSummary } from '~/types/send-job'

const ACTIVE_STATUSES: SendJobStatus[] = ['queued', 'processing']

const useJobStatusState = () => useState<SendJobSummary | null>('send-job/status', () => null)
const useIsStartingState = () => useState<boolean>('send-job/is-starting', () => false)
const useIsStoppingState = () => useState<boolean>('send-job/is-stopping', () => false)
const useIsPausingState = () => useState<boolean>('send-job/is-pausing', () => false)
const useIsResumingState = () => useState<boolean>('send-job/is-resuming', () => false)
const useIsFetchingState = () => useState<boolean>('send-job/is-fetching', () => false)
const usePollingHandleState = () => useState<number | null>('send-job/polling-handle', () => null)
const useIsFinishingState = () => useState<boolean>('send-job/is-finishing', () => false)

export const useSendJob = () => {
  const toast = useToast()
  const router = useRouter()
  const jobStatus = useJobStatusState()
  const isStartingJob = useIsStartingState()
  const isStoppingJob = useIsStoppingState()
  const isPausingJob = useIsPausingState()
  const isResumingJob = useIsResumingState()
  const isFetchingStatus = useIsFetchingState()
  const pollingHandle = usePollingHandleState()
  const isFinishingJob = useIsFinishingState()

  const fetchStatus = async () => {
    isFetchingStatus.value = true
    try {
      const response = await $fetch<{ job: SendJobSummary | null }>('/api/dashboard/send/status')
      jobStatus.value = response.job ?? null
      return jobStatus.value
    } catch (error: any) {
      console.error('[sendJob] status error', error)
      toast.error(error?.data?.statusMessage || 'Erro ao buscar status do disparo')
      throw error
    } finally {
      isFetchingStatus.value = false
    }
  }

  const startPolling = (intervalMs = 4000) => {
    if (!process.client) {
      return
    }
    if (pollingHandle.value !== null) {
      return
    }
    pollingHandle.value = window.setInterval(() => {
      fetchStatus().catch(() => {
        // erro já tratado em fetchStatus
      })
    }, intervalMs)
  }

  const stopPolling = () => {
    if (pollingHandle.value !== null && process.client) {
      window.clearInterval(pollingHandle.value)
      pollingHandle.value = null
    }
  }

  const startJob = async () => {
    if (isStartingJob.value) {
      return jobStatus.value
    }
    isStartingJob.value = true
    try {
      const response = await $fetch<{ job: SendJobSummary }>('/api/dashboard/send/start', { method: 'POST' })
      jobStatus.value = response.job
      startPolling()
      toast.success('Disparo iniciado!')
      return jobStatus.value
    } catch (error: any) {
      console.error('[sendJob] start error', error)
      toast.error(error?.data?.statusMessage || 'Erro ao iniciar disparo')
      throw error
    } finally {
      isStartingJob.value = false
    }
  }

  const startJobAndRedirect = async () => {
    const job = await startJob()
    if (job) {
      await router.push('/disparos')
    }
    return job
  }

  const stopJob = async () => {
    if (isStoppingJob.value) {
      return jobStatus.value
    }
    isStoppingJob.value = true
    try {
      const response = await $fetch<{ job: SendJobSummary }>('/api/dashboard/send/stop', { method: 'POST' })
      jobStatus.value = response.job
      toast.success('Cancelamento solicitado')
      return jobStatus.value
    } catch (error: any) {
      console.error('[sendJob] stop error', error)
      toast.error(error?.data?.statusMessage || 'Erro ao parar disparo')
      throw error
    } finally {
      isStoppingJob.value = false
    }
  }

  const pauseJob = async () => {
    if (isPausingJob.value) {
      return jobStatus.value
    }
    isPausingJob.value = true
    try {
      const response = await $fetch<{ job: SendJobSummary }>('/api/dashboard/send/pause', { method: 'POST' })
      jobStatus.value = response.job
      toast.success('Disparo pausado')
      return jobStatus.value
    } catch (error: any) {
      console.error('[sendJob] pause error', error)
      toast.error(error?.data?.statusMessage || 'Erro ao pausar disparo')
      throw error
    } finally {
      isPausingJob.value = false
    }
  }

  const resumeJob = async () => {
    if (isResumingJob.value) {
      return jobStatus.value
    }
    isResumingJob.value = true
    try {
      const response = await $fetch<{ job: SendJobSummary }>('/api/dashboard/send/resume', { method: 'POST' })
      jobStatus.value = response.job
      toast.success('Disparo retomado')
      return jobStatus.value
    } catch (error: any) {
      console.error('[sendJob] resume error', error)
      toast.error(error?.data?.statusMessage || 'Erro ao retomar disparo')
      throw error
    } finally {
      isResumingJob.value = false
    }
  }

  const finishJob = async () => {
    if (isFinishingJob.value) {
      return
    }

    if (!jobStatus.value) {
      return
    }

    isFinishingJob.value = true
    try {
      await $fetch('/api/dashboard/send/finish', { method: 'POST' })
      toast.success('Histórico do disparo limpo')
      await fetchStatus()
      return true
    } catch (error: any) {
      console.error('[sendJob] finish error', error)
      toast.error(error?.data?.statusMessage || 'Erro ao finalizar disparo')
      throw error
    } finally {
      isFinishingJob.value = false
    }
  }

  const isJobActive = computed(() => {
    if (!jobStatus.value) {
      return false
    }
    return ACTIVE_STATUSES.includes(jobStatus.value.status)
  })

  watch(
    jobStatus,
    (state) => {
      if (!state) {
        stopPolling()
        return
      }
      if (!ACTIVE_STATUSES.includes(state.status)) {
        stopPolling()
      }
    },
    { immediate: true }
  )

  return {
    jobStatus,
    isJobActive,
    isStartingJob,
    isStoppingJob,
    isPausingJob,
    isResumingJob,
    isFinishingJob,
    isFetchingStatus,
    startJob,
    startJobAndRedirect,
    stopJob,
    pauseJob,
    resumeJob,
    finishJob,
    fetchStatus,
    startPolling,
    stopPolling
  }
}

