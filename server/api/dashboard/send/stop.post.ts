import { requireAuthUser } from '../../../utils/auth'
import { requestStopSendJob } from '../../../utils/send-jobs'

export default defineEventHandler(async (event) => {
  const user = await requireAuthUser(event)
  const job = await requestStopSendJob(user.id)

  return { job }
})

