import { deleteCookie, setResponseStatus } from 'h3'

export default defineEventHandler((event) => {
  deleteCookie(event, 'auth_token', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/'
  })

  setResponseStatus(event, 204)
})


