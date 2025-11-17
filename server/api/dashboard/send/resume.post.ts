import { requireAuthUser } from '../../../utils/auth'
import { resumeSendJob } from '../../../utils/send-jobs'

export default defineEventHandler(async (event) => {
  const user = await requireAuthUser(event)
  const job = await resumeSendJob(user.id)

  return { job }
})


