# Diwali Gift & Festival Experience 🪔✨

An interactive 3D WebGL Deepavali (Diwali) greeting and festival celebration application built with **Nuxt 4**, **Three.js**, and synthesized **Web Audio API**.

---

## 🌟 Next-Level Deepavali Features

### 🪔 Sacred Diya Lighting & Aarti Ritual
- **Interactive Diya Lighting Ceremony**: Tap the traditional terracotta diya to ignite a dual-tone flame (inner blue core + flickering golden aura) that lights up the courtyard, rings the temple bell, and reveals the personalized greeting card.
- **Perform Aarti Mode (आरती)**: A dedicated button animates the sacred lamp in a slow ceremonial circular orbit with multi-harmonic brass temple chimes (*Ghanti*) and a shower of fragrant marigold flower petals.

### 🎆 Interactive Cracker Box & Patakhe Toolbar (पटाखे)
Choose your favorite Indian festive crackers and trigger them in the 3D courtyard:
1. 🚀 **Aakash Rocket (Sky Rocket)**: Launch whistling rockets into the night sky with glowing trails and multi-colored starbursts (Willow, Chrysanthemum, Peony in Golden, Amber, Magenta, and Emerald).
2. 🌀 **Zameen Chakri (Ground Spinner)**: Tap the courtyard floor to spin a rapid fire wheel spitting concentric golden spark rings with realistic rotational hiss audio.
3. 🌋 **Guldasta Anar (Flowerpot Fountain)**: Erupts into a 5-meter tall cascading fountain of sparkling silver and gold embers.
4. 💥 **1000-Wala Ladi (Firecracker Garland)**: Rapid staccato firecracker sequence that flashes and crackles along the courtyard tiles.
5. 🪄 **Phuljhadi (Handheld Sparkler Wand)**: Interactive sparkler follows cursor / touch pointer, casting dazzling golden sparks across the screen.
6. 🏮 **Akashkandil / Sky Lantern (आकाशकंदील)**: Release floating glowing wish lanterns that gently rise into the star-filled sky.

### 🎨 Rangoli Themes & Festive Illumination
- **3 Traditional Rangoli Color Schemes**:
  - 🪷 **Lotus Gold** (Warm Saffron, Marigold Yellow & Ruby Red)
  - 🦚 **Peacock Emerald** (Emerald Turquoise, Royal Blue & Deep Violet)
  - 🌸 **Festive Kumkum** (Sacred Vermillion, Bright Magenta & Pearl Gold)
- **All-in-One Illumination**: Tapping to light the diya instantly illuminates the central sacred diya, all surrounding courtyard lamps, rooftop string lights, and haveli lanterns in one radiant celebration.
- **Marigold Petal Rain (पुष्प वर्षा)**: Gentle drifting flower petals in saffron, yellow, and rose crimson.

### 🎵 100% Web Audio Synthesized Sound Engine
Zero external audio files needed — instant, authentic, lightweight audio:
- **Temple Bell (*Ghanti*)**: Multi-harmonic brass bell resonance with crystalline decay.
- **Ambient Tanpura Drone**: Meditative Indian classical tanpura Sa-Pa drone for authentic festive atmosphere.
- **Realistic Cracker Synthesis**: Rocket launch whistle, deep sub-bass explosions, chakri whirr, anar hiss, and rapid-fire ladi pops.

### 💌 Next-Level Card Customizer (`/send`)
- Custom Sender and Recipient names (e.g. *"To Mom & Dad, from Aditya"*).
- Pre-curated traditional & contemporary Diwali wishes, plus custom message input.
- Choose your preferred Rangoli theme.
- **1-Click WhatsApp Sharing** with pre-formatted festive message & emojis.
- Native Web Share API & Copy Link support.
- Download a personalized, theme-matched Diwali greeting card as a PNG image.
- Fully backward-compatible with legacy links.

---

## 🚀 Running the Project

```powershell
npm install
npm run dev
```

Open the local development URL (typically `http://localhost:3000`).

- `/` &mdash; Opens the default Skylink.in greeting.
- `/send` &mdash; Personalized greeting creator & live 3D preview.
- `/w/[id]` &mdash; Recipient's interactive Diwali greeting experience.

## 🌐 GitHub Pages Deployment

Pushing to the `main` branch runs the GitHub Actions workflow to generate and deploy the static site. The workflow configures GitHub Pages and the `/diwali/` base path for personalized greeting links.

After the workflow completes, the site will be available at `https://karthickmohan221.github.io/diwali/`.
