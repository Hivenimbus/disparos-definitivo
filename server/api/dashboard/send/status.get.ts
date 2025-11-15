import { requireAuthUser } from '../../../utils/auth'
import { getSendJobStatus } from '../../../utils/send-jobs'

export default defineEventHandler(async (event) => {
  const user = await requireAuthUser(event)
  const job = await getSendJobStatus(user.id)

  return { job }
})

