<script setup lang="ts">
import { encodeGreeting, type DiwaliGreetingData } from '~/utils/greeting'

const props = defineProps<{
  sender: string
  recipient?: string
  wish?: string
  theme?: 'gold' | 'peacock' | 'kumkum'
}>()

const message = ref('')
const copied = ref(false)
const downloading = ref(false)
const runtimeConfig = useRuntimeConfig()

const escapeXml = (value: string) => value.replace(/[<>&'"]/g, character => ({
  '<': '&lt;',
  '>': '&gt;',
  '&': '&amp;',
  '\'': '&apos;',
  '"': '&quot;',
})[character]!)

const wrapText = (value: string, maxLength: number) => {
  const lines: string[] = []
  let line = ''
  const words = value.split(/\s+/).flatMap((word) => {
    const characters = Array.from(word)
    const chunks: string[] = []
    while (characters.length > maxLength) chunks.push(characters.splice(0, maxLength).join(''))
    if (characters.length) chunks.push(characters.join(''))
    return chunks
  })

  for (const word of words) {
    const nextLine = line ? `${line} ${word}` : word
    if (line && nextLine.length > maxLength) {
      lines.push(line)
      line = word
    } else {
      line = nextLine
    }
  }

  if (line) lines.push(line)
  return lines
}

const downloadCard = async () => {
  if (downloading.value) return

  downloading.value = true
  message.value = ''

  const colors = {
    gold: { start: '#60212e', end: '#210e24', accent: '#ffd178' },
    peacock: { start: '#124c55', end: '#101c3b', accent: '#8cf0cf' },
    kumkum: { start: '#812638', end: '#32142e', accent: '#ffd178' },
  }[props.theme || 'gold']
  const wishLines = wrapText(props.wish || 'May your home glow with joy, peace, and prosperity.', 42)
  const wishSvg = wishLines.map((line, index) =>
    `<text x="600" y="${1010 + index * 52}" text-anchor="middle" fill="#fff0d6" font-family="Georgia,serif" font-size="30">${escapeXml(line)}</text>`,
  ).join('')
  const recipientSvg = props.recipient
    ? `<text x="600" y="630" text-anchor="middle" fill="${colors.accent}" font-family="Georgia,serif" font-size="34">For ${escapeXml(props.recipient)}</text>`
    : ''
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1500" viewBox="0 0 1200 1500">
    <defs>
      <linearGradient id="background" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${colors.start}"/><stop offset="1" stop-color="${colors.end}"/></linearGradient>
      <radialGradient id="glow"><stop stop-color="${colors.accent}" stop-opacity=".4"/><stop offset="1" stop-color="${colors.accent}" stop-opacity="0"/></radialGradient>
    </defs>
    <rect width="1200" height="1500" fill="url(#background)"/>
    <circle cx="600" cy="720" r="510" fill="url(#glow)"/>
    <rect x="44" y="44" width="1112" height="1412" rx="38" fill="none" stroke="${colors.accent}" stroke-opacity=".55" stroke-width="3"/>
    <text x="600" y="190" text-anchor="middle" fill="#ffda79" font-family="Arial,sans-serif" font-size="30" font-weight="700" letter-spacing="8">SHUBH DEEPAVALI</text>
    <path d="M480 460 Q600 555 720 460 Q690 590 600 610 Q510 590 480 460Z" fill="${colors.accent}"/>
    <path d="M600 345 C525 420 587 438 600 460 C615 437 676 416 600 345Z" fill="#fff4c2"/>
    <circle cx="600" cy="454" r="145" fill="url(#glow)"/>
    ${recipientSvg}
    <text x="600" y="${props.recipient ? 755 : 690}" text-anchor="middle" fill="#fff5df" font-family="Georgia,serif" font-size="76" font-weight="700">Happy Diwali</text>
    <text x="600" y="${props.recipient ? 835 : 770}" text-anchor="middle" fill="#ffe5b5" font-family="Georgia,serif" font-size="38">With warm wishes from</text>
    <text x="600" y="${props.recipient ? 900 : 835}" text-anchor="middle" fill="${colors.accent}" font-family="Georgia,serif" font-size="48" font-weight="700">${escapeXml(props.sender)}</text>
    ${wishSvg}
    <text x="600" y="1360" text-anchor="middle" fill="#fff0d6" fill-opacity=".72" font-family="Arial,sans-serif" font-size="23">A little light, joy &amp; prosperity for you</text>
  </svg>`

  let svgUrl: string | undefined
  let pngUrl: string | undefined

  try {
    svgUrl = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }))
    const image = new Image()
    image.src = svgUrl
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve()
      image.onerror = () => reject(new Error('The greeting card image could not be prepared.'))
    })

    const canvas = document.createElement('canvas')
    canvas.width = 1200
    canvas.height = 1500
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Your browser could not create the greeting card image.')
    context.drawImage(image, 0, 0)

    const png = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob)
        else reject(new Error('Your browser could not export the greeting card image.'))
      }, 'image/png')
    })
    pngUrl = URL.createObjectURL(png)

    const link = document.createElement('a')
    const safeSender = props.sender.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'diwali'
    link.href = pngUrl
    link.download = `Diwali-card-${safeSender}.png`
    link.click()
    message.value = 'Your Diwali card has been downloaded.'
  } catch (error) {
    message.value = error instanceof Error ? error.message : 'The greeting card could not be downloaded.'
  } finally {
    if (svgUrl) URL.revokeObjectURL(svgUrl)
    if (pngUrl) {
      const downloadUrl = pngUrl
      window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000)
    }
    downloading.value = false
  }
}

const getGreetingUrl = () => {
  const payload: DiwaliGreetingData = {
    sender: props.sender,
    recipient: props.recipient,
    wish: props.wish,
    theme: props.theme,
  }
  const encoded = encodeGreeting(payload)
  return `${window.location.origin}${runtimeConfig.app.baseURL}w/${encoded}`
}

const shareToWhatsApp = () => {
  const url = getGreetingUrl()
  const recipientLine = props.recipient ? `To ${props.recipient},\n` : ''
  const text = `${recipientLine}🪔 Happy Diwali! 🪔\n\nA special glowing Diwali surprise from *${props.sender}* is waiting for you.\n\nOpen your Diya gift here:\n${url}`
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`
  window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
}

const copyLink = async () => {
  const url = getGreetingUrl()
  try {
    await navigator.clipboard.writeText(url)
    copied.value = true
    message.value = '✨ Link copied! Share it on WhatsApp, Instagram or SMS.'
    setTimeout(() => {
      copied.value = false
    }, 3500)
  } catch {
    message.value = url
  }
}

const nativeShare = async () => {
  const url = getGreetingUrl()
  const shareData = {
    title: 'Happy Diwali',
    text: `A little Diwali light from ${props.sender}.`,
    url,
  }

  if (navigator.share) {
    try {
      await navigator.share(shareData)
      message.value = 'Greeting shared successfully!'
      return
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return
    }
  }

  await copyLink()
}
</script>

<template>
  <div class="share-control">
    <div class="share-button-group">
      <!-- WhatsApp 1-Click Share -->
      <button class="whatsapp-share-btn" type="button" @click="shareToWhatsApp">
        <span class="share-icon" aria-hidden="true">💬</span>
        <span>Share via WhatsApp</span>
      </button>

      <!-- Copy / Native Share -->
      <button class="primary-button" type="button" @click="nativeShare">
        <span aria-hidden="true">↗</span>
        <span>Share Link</span>
      </button>

      <button class="copy-link-btn" type="button" @click="copyLink">
        <span aria-hidden="true">{{ copied ? '✓' : '🔗' }}</span>
        <span>{{ copied ? 'Copied!' : 'Copy' }}</span>
      </button>

      <button class="copy-link-btn download-card-btn" type="button" :disabled="downloading" @click="downloadCard">
        <span aria-hidden="true">{{ downloading ? '…' : '⬇' }}</span>
        <span>{{ downloading ? 'Preparing card…' : 'Download card' }}</span>
      </button>
    </div>

    <p v-if="message" class="share-status" role="status" aria-live="polite">
      {{ message }}
    </p>
  </div>
</template>

<style scoped>
.share-control {
  display: grid;
  justify-items: center;
  gap: 12px;
  width: 100%;
}

.share-button-group {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
}

.whatsapp-share-btn {
  display: inline-flex;
  min-height: 52px;
  align-items: center;
  justify-content: center;
  gap: 9px;
  padding: 0 22px;
  border: 0;
  border-radius: 999px;
  background: linear-gradient(135deg, #25d366, #128c7e);
  color: #ffffff;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 6px 20px rgba(37, 211, 102, 0.35);
  transition: all 0.18s ease;
}

.whatsapp-share-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(37, 211, 102, 0.45);
}

.copy-link-btn {
  display: inline-flex;
  min-height: 52px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 20px;
  border: 1px solid rgba(255, 230, 180, 0.3);
  border-radius: 999px;
  background: rgba(30, 20, 32, 0.7);
  color: #ffe8c2;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  backdrop-filter: blur(10px);
  transition: all 0.18s ease;
}

.copy-link-btn:hover {
  background: rgba(50, 30, 50, 0.85);
  border-color: rgba(255, 220, 160, 0.5);
  transform: translateY(-2px);
}

.copy-link-btn:disabled {
  cursor: wait;
  opacity: .7;
}

.download-card-btn {
  min-height: 46px;
  font-size: 13px;
}

.share-status {
  margin: 0;
  color: #ffd88b;
  font-size: 13px;
  font-weight: 500;
  text-shadow: 0 1px 8px rgba(0, 0, 0, 0.4);
}

@media (max-width: 600px) {
  .whatsapp-share-btn,
  .primary-button,
  .copy-link-btn {
    width: 100%;
    min-height: 48px;
    font-size: 14px;
  }
}
</style>
