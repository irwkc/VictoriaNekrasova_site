import crypto from 'node:crypto'

const MAX_ATTEMPTS = 3
const LOCK_MS = 30 * 60 * 1000
const SESSION_TTL = 12 * 60 * 60 * 1000

/** @type {Map<string, { attempts: number, lockedUntil: number }>} */
const ipState = new Map()

/** @type {Map<string, number>} */
const sessions = new Map()

export function adminUsername() {
  const user = process.env.ADMIN_USERNAME
  if (!user) throw new Error('ADMIN_USERNAME is not set in vn-api.env')
  return user
}

export function adminPassword() {
  const pass = process.env.ADMIN_PASSWORD
  if (!pass) throw new Error('ADMIN_PASSWORD is not set in vn-api.env')
  return pass
}

export function authConfigured() {
  return Boolean(process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD)
}

export function clientIp(req) {
  const forwarded = req.headers?.['x-forwarded-for']
  if (forwarded) return String(forwarded).split(',')[0].trim()
  return req.headers?.['x-real-ip'] || req.socket?.remoteAddress || 'unknown'
}

function getIpState(ip) {
  const current = ipState.get(ip) ?? { attempts: 0, lockedUntil: 0 }
  if (current.lockedUntil && Date.now() > current.lockedUntil) {
    current.attempts = 0
    current.lockedUntil = 0
  }
  ipState.set(ip, current)
  return current
}

export function isIpLocked(ip) {
  const state = getIpState(ip)
  return state.lockedUntil > Date.now()
}

export function lockRemainingMs(ip) {
  const state = getIpState(ip)
  return Math.max(0, state.lockedUntil - Date.now())
}

function recordFailure(ip) {
  const state = getIpState(ip)
  state.attempts += 1
  if (state.attempts >= MAX_ATTEMPTS) {
    state.lockedUntil = Date.now() + LOCK_MS
    state.attempts = 0
  }
  ipState.set(ip, state)
}

function clearFailures(ip) {
  ipState.set(ip, { attempts: 0, lockedUntil: 0 })
}

function createSession() {
  const token = crypto.randomBytes(32).toString('hex')
  sessions.set(token, Date.now() + SESSION_TTL)
  return token
}

function isValidSession(token) {
  if (!token) return false
  const expires = sessions.get(token)
  if (!expires) return false
  if (Date.now() > expires) {
    sessions.delete(token)
    return false
  }
  return true
}

export function getBearerToken(req) {
  const header = req.headers?.authorization || req.headers?.Authorization || ''
  if (header.startsWith('Bearer ')) return header.slice(7)
  return req.headers?.['x-admin-token'] || ''
}

export function isAuthorized(req) {
  return isValidSession(getBearerToken(req))
}

export function attemptLogin(req, username, password) {
  if (!authConfigured()) {
    return { ok: false, locked: false, attemptsLeft: 0, misconfigured: true }
  }

  const ip = clientIp(req)

  if (isIpLocked(ip)) {
    return { ok: false, locked: true, remainingMs: lockRemainingMs(ip) }
  }

  const validUser = username === adminUsername()
  const validPass = password === adminPassword()

  if (!validUser || !validPass) {
    recordFailure(ip)
    if (isIpLocked(ip)) {
      return { ok: false, locked: true, remainingMs: lockRemainingMs(ip) }
    }
    return { ok: false, locked: false, attemptsLeft: MAX_ATTEMPTS - (getIpState(ip).attempts || 0) }
  }

  clearFailures(ip)
  return { ok: true, token: createSession() }
}
