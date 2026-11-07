export interface DiwaliGreetingData {
  sender: string
  recipient?: string
  wish?: string
  theme?: 'gold' | 'peacock' | 'kumkum'
}

export const PRESET_DIWALI_WISHES = [
  'May your home glow with joy, peace, and prosperity.',
  'Wishing you and your family abundant happiness, good health, and success this Diwali! ✨',
  'May the divine light of Diwali eliminate all darkness and bring boundless happiness to your life. 🪔',
  'Happy Diwali! May Goddess Lakshmi bless your life with wealth, wisdom, and eternal light.',
  'Let each diya lit illuminate your path to prosperity, love, and victory of good. Happy Diwali!',
  'May this festival of lights shine upon you with countless blessings and joy. 🎇',
]

export function encodeGreeting(data: DiwaliGreetingData): string {
  const cleanSender = data.sender.trim() || 'A friend'
  let payload: string

  // Minimal footprint if default wish and theme
  if (!data.recipient && !data.wish && (!data.theme || data.theme === 'gold')) {
    payload = cleanSender
  } else {
    payload = JSON.stringify({
      s: cleanSender,
      r: data.recipient?.trim() || undefined,
      w: data.wish?.trim() || undefined,
      t: data.theme || 'gold',
    })
  }

  const bytes = new TextEncoder().encode(payload)
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

export function decodeGreeting(encoded: string | string[] | undefined): DiwaliGreetingData {
  if (typeof encoded !== 'string' || !encoded) {
    return { sender: 'A friend', wish: PRESET_DIWALI_WISHES[0], theme: 'gold' }
  }

  try {
    const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64 + '='.repeat((4 - base64.length % 4) % 4)
    const binary = atob(padded)
    const bytes = Uint8Array.from(binary, character => character.charCodeAt(0))
    const raw = new TextDecoder().decode(bytes).trim()

    if (raw.startsWith('{') && raw.endsWith('}')) {
      const parsed = JSON.parse(raw)
      return {
        sender: parsed.s || parsed.sender || 'A friend',
        recipient: parsed.r || parsed.recipient || undefined,
        wish: parsed.w || parsed.wish || PRESET_DIWALI_WISHES[0],
        theme: parsed.t === 'peacock' || parsed.t === 'kumkum' ? parsed.t : 'gold',
      }
    }

    return {
      sender: raw || 'A friend',
      wish: PRESET_DIWALI_WISHES[0],
      theme: 'gold',
    }
  } catch {
    return { sender: 'A friend', wish: PRESET_DIWALI_WISHES[0], theme: 'gold' }
  }
}

// Backward compatibility helpers
export function encodeSenderName(name: string): string {
  return encodeGreeting({ sender: name })
}

export function decodeSenderName(encoded: string | string[] | undefined): string {
  return decodeGreeting(encoded).sender
}
