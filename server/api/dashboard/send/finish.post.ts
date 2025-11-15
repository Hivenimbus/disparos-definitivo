import { requireAuthUser } from '../../../utils/auth'
import { finalizeSendJob } from '../../../utils/send-jobs'

export default defineEventHandler(async (event) => {
  const user = await requireAuthUser(event)
  const result = await finalizeSendJob(user.id)

  return result
})

