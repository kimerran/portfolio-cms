import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'

export interface SessionData {
  userId: string
  username: string
}

export const sessionOptions = {
  cookieName: 'portfolio_session',
  password: process.env.SESSION_SECRET as string,
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 8, // 8 hours in seconds
  },
}

export async function getSession() {
  return getIronSession<SessionData>(cookies(), sessionOptions)
}
