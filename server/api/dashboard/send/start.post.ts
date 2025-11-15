import { requireAuthUser } from '../../../utils/auth'
import { startSendJob } from '../../../utils/send-jobs'

export default defineEventHandler(async (event) => {
  const user = await requireAuthUser(event)
  const job = await startSendJob(user)

  return { job }
})

