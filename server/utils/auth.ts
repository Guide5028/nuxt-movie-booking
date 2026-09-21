import type { H3Event } from 'h3'

const COOKIE_NAME = 'customer_id'

export function getCurrentCustomerId(event: H3Event): number | null {
  const raw = getCookie(event, COOKIE_NAME)
  return raw ? Number(raw) : null
}

export function requireCustomerId(event: H3Event): number {
  const id = getCurrentCustomerId(event)
  if (!id) {
    throw createError({ statusCode: 401, statusMessage: 'You must be logged in' })
  }
  return id
}

export function setCurrentCustomerId(event: H3Event, id: number) {
  setCookie(event, COOKIE_NAME, String(id), {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30
  })
}

export function clearCurrentCustomerId(event: H3Event) {
  deleteCookie(event, COOKIE_NAME)
}
