/**
 * Encrypts guest details (name, email) into an opaque URL-safe token
 * so the Stripe success redirect does not carry plaintext PII.
 *
 * Uses AES-256-GCM with a key derived from SUPABASE_SERVICE_ROLE_KEY.
 * The token is not decodable without the key, so Meta's pixel cannot
 * extract personal data from the URL it records in PageView.
 */

import crypto from 'crypto'

function getKey(): Buffer {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!secret) throw new Error('SUPABASE_SERVICE_ROLE_KEY not set')
  return crypto.createHash('sha256').update(secret).digest()
}

export function encryptBookingToken(data: { name: string; email: string }): string {
  const key = getKey()
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  const plaintext = JSON.stringify(data)
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return Buffer.concat([iv, tag, encrypted]).toString('base64url')
}

export function decryptBookingToken(token: string): { name: string; email: string } | null {
  try {
    const key = getKey()
    const buf = Buffer.from(token, 'base64url')
    const iv = buf.subarray(0, 12)
    const tag = buf.subarray(12, 28)
    const encrypted = buf.subarray(28)
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
    decipher.setAuthTag(tag)
    const decrypted = decipher.update(encrypted) + decipher.final('utf8')
    return JSON.parse(decrypted)
  } catch {
    return null
  }
}
