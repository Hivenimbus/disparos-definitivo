import { requireAuthUser } from '../../../utils/auth'
import { pauseSendJob } from '../../../utils/send-jobs'

export default defineEventHandler(async (event) => {
  const user = await requireAuthUser(event)
  const job = await pauseSendJob(user.id)

  return { job }
})


