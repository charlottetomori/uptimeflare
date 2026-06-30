import { getRuntimeValue, setRuntimeValue } from './runtimeConfig'
import type { RuntimeEnv } from './runtimeConfig'

const ADMIN_KEY = 'admin_credentials'
const SESSION_KEY = 'admin_session'
export const SESSION_COOKIE = 'status_admin_session'

type AdminCredentials = {
  username: string
  salt: string
  passwordHash: string
}

function bytesToHex(bytes: ArrayBuffer) {
  return Array.from(new Uint8Array(bytes))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

function randomHex(length = 16) {
  const bytes = new Uint8Array(length)
  crypto.getRandomValues(bytes)
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

async function hashPassword(password: string, salt: string) {
  const data = new TextEncoder().encode(`${salt}:${password}`)
  return bytesToHex(await crypto.subtle.digest('SHA-256', data))
}

export async function getAdminCredentials(env: RuntimeEnv): Promise<AdminCredentials | null> {
  const value = await getRuntimeValue(env, ADMIN_KEY)
  if (!value) return null

  try {
    const credentials = JSON.parse(value) as AdminCredentials
    if (!credentials.username || !credentials.salt || !credentials.passwordHash) return null
    return credentials
  } catch {
    return null
  }
}

export async function hasAdmin(env: RuntimeEnv) {
  return Boolean(await getAdminCredentials(env))
}

export async function createAdmin(env: RuntimeEnv, username: string, password: string) {
  if (await hasAdmin(env)) throw new Error('管理员已存在')
  if (!username.trim()) throw new Error('请输入账号')
  if (password.length < 8) throw new Error('密码至少 8 位')

  const salt = randomHex()
  const credentials: AdminCredentials = {
    username: username.trim(),
    salt,
    passwordHash: await hashPassword(password, salt),
  }
  await setRuntimeValue(env, ADMIN_KEY, JSON.stringify(credentials))
}

export async function verifyAdmin(env: RuntimeEnv, username: string, password: string) {
  const credentials = await getAdminCredentials(env)
  if (!credentials) return false
  if (credentials.username !== username.trim()) return false
  return credentials.passwordHash === (await hashPassword(password, credentials.salt))
}

export async function createSession(env: RuntimeEnv) {
  const token = crypto.randomUUID ? crypto.randomUUID() : randomHex(32)
  await setRuntimeValue(env, SESSION_KEY, token)
  return token
}

export async function validateSession(env: RuntimeEnv, token?: string | null) {
  if (!token) return false
  const stored = await getRuntimeValue(env, SESSION_KEY)
  return Boolean(stored && stored === token)
}

export async function clearSession(env: RuntimeEnv) {
  await setRuntimeValue(env, SESSION_KEY, '')
}

export function getCookieValue(cookieHeader: string | undefined, name: string) {
  if (!cookieHeader) return null
  const cookies = cookieHeader.split(';').map((item) => item.trim())
  const prefix = `${name}=`
  const cookie = cookies.find((item) => item.startsWith(prefix))
  return cookie ? decodeURIComponent(cookie.slice(prefix.length)) : null
}

export async function isAdminRequest(env: RuntimeEnv, cookieHeader?: string) {
  return validateSession(env, getCookieValue(cookieHeader, SESSION_COOKIE))
}

export function sessionCookie(token: string) {
  return `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000; Secure`
}

export function expiredSessionCookie() {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Secure`
}
