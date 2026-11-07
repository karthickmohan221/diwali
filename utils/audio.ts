// Web Audio API based synthesized festive sound engine for Diwali
// Zero external audio files required - works offline, instantaneous, authentic!

class DiwaliAudioEngine {
  private ctx: AudioContext | null = null
  private masterGain: GainNode | null = null
  private droneGain: GainNode | null = null
  private droneOscillators: OscillatorNode[] = []
  private noiseBuffer: AudioBuffer | null = null
  private isEnabled = false

  private initContext() {
    if (this.ctx) return
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    this.ctx = new AudioCtx()
    this.masterGain = this.ctx.createGain()
    this.masterGain.gain.value = 0.8
    this.masterGain.connect(this.ctx.destination)

    // Pre-generate 1-second white noise buffer for crackers and sparks
    const sampleRate = this.ctx.sampleRate
    this.noiseBuffer = this.ctx.createBuffer(1, sampleRate, sampleRate)
    const output = this.noiseBuffer.getChannelData(0)
    for (let i = 0; i < sampleRate; i++) {
      output[i] = Math.random() * 2 - 1
    }
  }

  public async enable(): Promise<boolean> {
    try {
      this.initContext()
      if (this.ctx && this.ctx.state === 'suspended') {
        await this.ctx.resume()
      }
      this.isEnabled = true
      this.startDrone()
      return true
    } catch {
      this.isEnabled = false
      return false
    }
  }

  public disable(): void {
    this.stopDrone()
    if (this.ctx && this.ctx.state === 'running') {
      void this.ctx.suspend()
    }
    this.isEnabled = false
  }

  public toggle(): Promise<boolean> {
    if (this.isEnabled) {
      this.disable()
      return Promise.resolve(false)
    }
    return this.enable()
  }

  public get active(): boolean {
    return this.isEnabled
  }

  // --- Festive Tanpura / Ambient Sacred Drone ---
  private startDrone(): void {
    if (!this.ctx || !this.isEnabled || this.droneOscillators.length > 0) return

    const now = this.ctx.currentTime
    this.droneGain = this.ctx.createGain()
    this.droneGain.gain.setValueAtTime(0.001, now)
    // Smooth fade in
    this.droneGain.gain.exponentialRampToValueAtTime(0.02, now + 2)
    this.droneGain.connect(this.masterGain!)

    // Indian classical tanpura chord: Sa (130.81Hz - C3), Pa (196.00Hz - G3), Sa higher (261.63Hz - C4), Low Sa (65.41Hz - C2)
    const pitches = [65.41, 130.81, 196.0, 261.63, 392.0]
    this.droneOscillators = pitches.map((freq, idx) => {
      const osc = this.ctx!.createOscillator()
      const filter = this.ctx!.createBiquadFilter()
      const voiceGain = this.ctx!.createGain()

      osc.type = idx % 2 === 0 ? 'sine' : 'triangle'
      osc.frequency.setValueAtTime(freq, now)
      // Slight detune for natural warmth & shimmering beating
      osc.detune.setValueAtTime((Math.random() - 0.5) * 8, now)

      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(freq * 3.5, now)
      filter.Q.setValueAtTime(1.5, now)

      voiceGain.gain.setValueAtTime(0.2 / pitches.length, now)

      osc.connect(filter)
      filter.connect(voiceGain)
      voiceGain.connect(this.droneGain!)

      osc.start(now)
      return osc
    })
  }

  private stopDrone(): void {
    if (!this.ctx || !this.droneGain) return
    const now = this.ctx.currentTime
    this.droneGain.gain.setValueAtTime(this.droneGain.gain.value, now)
    this.droneGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6)
    setTimeout(() => {
      this.droneOscillators.forEach(osc => {
        try {
          osc.stop()
          osc.disconnect()
        } catch {}
      })
      this.droneOscillators = []
    }, 650)
  }

  // --- Authentic Brass Temple Bell (Ghanti / घंटा) ---
  public playTempleBell(pitchMultiplier = 1.0): void {
    if (!this.ctx || !this.isEnabled) return
    const now = this.ctx.currentTime
    const baseFreq = 880 * pitchMultiplier // A5 high clear bell

    // Temple bells have distinct non-harmonic partials: ~1.0, 2.76, 5.4, 8.93
    const partials = [
      { ratio: 1.0, gain: 0.35, decay: 2.4 },
      { ratio: 2.76, gain: 0.22, decay: 1.8 },
      { ratio: 5.4, gain: 0.12, decay: 1.2 },
      { ratio: 8.93, gain: 0.06, decay: 0.7 },
    ]

    partials.forEach(p => {
      const osc = this.ctx!.createOscillator()
      const gain = this.ctx!.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(baseFreq * p.ratio, now)

      gain.gain.setValueAtTime(p.gain, now)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + p.decay)

      osc.connect(gain)
      gain.connect(this.masterGain!)

      osc.start(now)
      osc.stop(now + p.decay)
    })
  }

  // --- Diya Lighting Sacred Chime ---
  public playDiyaLightTone(): void {
    if (!this.ctx || !this.isEnabled) return
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51] // C Major pentatonic chime
    notes.forEach((freq, i) => {
      setTimeout(() => {
        if (!this.ctx || !this.isEnabled) return
        const now = this.ctx.currentTime
        const osc = this.ctx.createOscillator()
        const gain = this.ctx.createGain()

        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, now)

        gain.gain.setValueAtTime(0.18, now)
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2)

        osc.connect(gain)
        gain.connect(this.masterGain!)

        osc.start(now)
        osc.stop(now + 1.2)
      }, i * 90)
    })
    // Add a sweet bell ring at the peak
    setTimeout(() => {
      this.playTempleBell(1.2)
    }, notes.length * 90)
  }

  // --- Aarti Multi-Chime Sequence ---
  public playAartiChimes(): void {
    if (!this.ctx || !this.isEnabled) return
    const sequence = [1.0, 1.25, 1.0, 1.33, 1.5, 1.25, 1.0]
    sequence.forEach((mult, index) => {
      setTimeout(() => {
        this.playTempleBell(mult)
      }, index * 280)
    })
  }

  // --- Sky Rocket Whistle & Burst ---
  public playRocketLaunch(): void {
    if (!this.ctx || !this.isEnabled) return
    const now = this.ctx.currentTime
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()
    const filter = this.ctx.createBiquadFilter()

    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(320, now)
    // Rising whistle
    osc.frequency.exponentialRampToValueAtTime(1600, now + 0.65)

    filter.type = 'bandpass'
    filter.frequency.setValueAtTime(700, now)
    filter.frequency.exponentialRampToValueAtTime(2200, now + 0.65)
    filter.Q.value = 4.0

    gain.gain.setValueAtTime(0.01, now)
    gain.gain.linearRampToValueAtTime(0.07, now + 0.5)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7)

    osc.connect(filter)
    filter.connect(gain)
    gain.connect(this.masterGain!)

    osc.start(now)
    osc.stop(now + 0.72)
  }

  // --- Firecracker Explosion (Patakha Dhamaka) ---
  public playCracker(): void {
    if (!this.ctx || !this.isEnabled || !this.noiseBuffer) return
    const now = this.ctx.currentTime

    // 1. Deep Sub Bass Thump
    const subOsc = this.ctx.createOscillator()
    const subGain = this.ctx.createGain()
    subOsc.type = 'sine'
    subOsc.frequency.setValueAtTime(140, now)
    subOsc.frequency.exponentialRampToValueAtTime(32, now + 0.3)
    subGain.gain.setValueAtTime(0.25, now)
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.32)
    subOsc.connect(subGain)
    subGain.connect(this.masterGain!)
    subOsc.start(now)
    subOsc.stop(now + 0.35)

    // 2. High Sparkle Noise Burst
    for (const [delay, vol, freq] of [
      [0, 0.16, 1800],
      [0.03, 0.1, 2400],
      [0.07, 0.08, 1200],
    ] as const) {
      const src = this.ctx.createBufferSource()
      const filter = this.ctx.createBiquadFilter()
      const gain = this.ctx.createGain()
      const start = now + delay

      src.buffer = this.noiseBuffer
      filter.type = 'bandpass'
      filter.frequency.setValueAtTime(freq + Math.random() * 800, start)
      filter.Q.value = 1.2

      gain.gain.setValueAtTime(vol, start)
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.22)

      src.connect(filter)
      filter.connect(gain)
      gain.connect(this.masterGain!)

      src.start(start)
      src.stop(start + 0.25)
    }
  }

  // --- Ground Chakri (Spinning Whir & Sizzle) ---
  public playChakri(): void {
    if (!this.ctx || !this.isEnabled || !this.noiseBuffer) return
    const now = this.ctx.currentTime
    const duration = 2.4

    // Whirring pitch oscillation
    const osc = this.ctx.createOscillator()
    const oscGain = this.ctx.createGain()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(380, now)
    osc.frequency.exponentialRampToValueAtTime(750, now + 0.6)
    osc.frequency.exponentialRampToValueAtTime(260, now + duration)

    oscGain.gain.setValueAtTime(0.02, now)
    oscGain.gain.linearRampToValueAtTime(0.06, now + 0.4)
    oscGain.gain.exponentialRampToValueAtTime(0.0001, now + duration)

    osc.connect(oscGain)
    oscGain.connect(this.masterGain!)
    osc.start(now)
    osc.stop(now + duration)

    // Sizzling sparks
    const src = this.ctx.createBufferSource()
    const filter = this.ctx.createBiquadFilter()
    const noiseGain = this.ctx.createGain()

    src.buffer = this.noiseBuffer
    src.loop = true
    filter.type = 'highpass'
    filter.frequency.setValueAtTime(2800, now)

    noiseGain.gain.setValueAtTime(0.01, now)
    noiseGain.gain.linearRampToValueAtTime(0.09, now + 0.3)
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + duration)

    src.connect(filter)
    filter.connect(noiseGain)
    noiseGain.connect(this.masterGain!)

    src.start(now)
    src.stop(now + duration)
  }

  // --- Anar (Flowerpot Fountain Sizzle) ---
  public playAnar(): void {
    if (!this.ctx || !this.isEnabled || !this.noiseBuffer) return
    const now = this.ctx.currentTime
    const duration = 3.0

    const src = this.ctx.createBufferSource()
    const filter = this.ctx.createBiquadFilter()
    const gain = this.ctx.createGain()

    src.buffer = this.noiseBuffer
    src.loop = true
    filter.type = 'bandpass'
    filter.frequency.setValueAtTime(2200, now)
    filter.frequency.linearRampToValueAtTime(4500, now + 1.2)
    filter.frequency.linearRampToValueAtTime(1800, now + duration)
    filter.Q.value = 0.8

    gain.gain.setValueAtTime(0.02, now)
    gain.gain.linearRampToValueAtTime(0.12, now + 0.8)
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration)

    src.connect(filter)
    filter.connect(gain)
    gain.connect(this.masterGain!)

    src.start(now)
    src.stop(now + duration)
  }

  // --- 1000-Wala Ladi (Rapid Firecracker Garland) ---
  public playLadi(): void {
    if (!this.ctx || !this.isEnabled || !this.noiseBuffer) return
    const totalPops = 16
    for (let i = 0; i < totalPops; i++) {
      const delay = i * 0.08 + Math.random() * 0.03
      setTimeout(() => {
        if (!this.ctx || !this.isEnabled || !this.noiseBuffer) return
        const now = this.ctx.currentTime
        const src = this.ctx.createBufferSource()
        const filter = this.ctx.createBiquadFilter()
        const gain = this.ctx.createGain()

        src.buffer = this.noiseBuffer
        filter.type = 'bandpass'
        filter.frequency.setValueAtTime(1400 + Math.random() * 1600, now)
        filter.Q.value = 1.8

        const vol = 0.08 + Math.random() * 0.07
        gain.gain.setValueAtTime(vol, now)
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07)

        src.connect(filter)
        filter.connect(gain)
        gain.connect(this.masterGain!)

        src.start(now)
        src.stop(now + 0.08)
      }, delay * 1000)
    }
  }

  // --- Sparkler (Phuljhadi Sparkle Hiss) ---
  public playSparklerSpark(): void {
    if (!this.ctx || !this.isEnabled || !this.noiseBuffer) return
    const now = this.ctx.currentTime
    const src = this.ctx.createBufferSource()
    const filter = this.ctx.createBiquadFilter()
    const gain = this.ctx.createGain()

    src.buffer = this.noiseBuffer
    filter.type = 'highpass'
    filter.frequency.setValueAtTime(4200 + Math.random() * 1000, now)

    gain.gain.setValueAtTime(0.035, now)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08)

    src.connect(filter)
    filter.connect(gain)
    gain.connect(this.masterGain!)

    src.start(now)
    src.stop(now + 0.09)
  }

  // --- Sky Lantern Ascent Chime ---
  public playLanternChime(): void {
    if (!this.ctx || !this.isEnabled) return
    const now = this.ctx.currentTime
    const freqs = [587.33, 739.99, 880.0, 1174.66] // D-F#-A-D serene chord
    freqs.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator()
      const gain = this.ctx!.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, now)

      gain.gain.setValueAtTime(0.08 / freqs.length, now)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.5 + idx * 0.3)

      osc.connect(gain)
      gain.connect(this.masterGain!)

      osc.start(now)
      osc.stop(now + 3.0)
    })
  }

  public dispose(): void {
    this.disable()
    if (this.ctx) {
      void this.ctx.close()
      this.ctx = null
    }
  }
}

export const diwaliAudio = new DiwaliAudioEngine()
