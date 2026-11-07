<script setup lang="ts">
import * as THREE from 'three'

const props = withDefaults(defineProps<{
  revealed: boolean
  candlesLit: boolean
  theme?: 'gold' | 'peacock' | 'kumkum'
  activeCracker?: 'rocket' | 'chakri' | 'anar' | 'ladi' | 'sparkler' | 'lantern'
  celebrationTap?: number
  clickPosition?: { x: number; y: number }
  aartiActive?: boolean
  flowerShower?: boolean
}>(), {
  theme: 'gold',
  activeCracker: 'rocket',
  celebrationTap: 0,
  clickPosition: () => ({ x: 0, y: 0 }),
  aartiActive: false,
  flowerShower: false,
})

const emit = defineEmits<{
  cracker: []
  rocketLaunch: []
  chakriSpin: []
  anarBurst: []
  ladiPop: []
  lanternRelease: []
  sparklerSpark: []
}>()

const host = ref<HTMLDivElement | null>(null)
let renderer: THREE.WebGLRenderer | undefined
let frame = 0
let resizeObserver: ResizeObserver | undefined
let scene: THREE.Scene | undefined
let activeCamera: THREE.PerspectiveCamera | undefined
let flame: THREE.Mesh | undefined
let innerFlame: THREE.Mesh | undefined
let flameLight: THREE.PointLight | undefined
let ambient: THREE.HemisphereLight | undefined
let diyaGroup: THREE.Group | undefined
const cameraTarget = new THREE.Vector3(0, 9, 37)

// Particle & Effect types
interface FireworkBurst {
  points: THREE.Points
  positionAttribute: THREE.BufferAttribute
  velocities: THREE.Vector3[]
  rocket: THREE.Mesh
  trail: THREE.Line
  x: number
  z: number
  targetY: number
  exploded: boolean
  age: number
}

interface SparkEffect {
  points: THREE.Points
  positions: THREE.BufferAttribute
  origin: THREE.Vector3
  velocities: THREE.Vector3[]
  lifetime: number
}

interface ChakriEffect {
  mesh: THREE.Group
  light: THREE.PointLight
  points: THREE.Points
  positions: THREE.BufferAttribute
  velocities: THREE.Vector3[]
  age: number
  duration: number
}

interface AnarEffect {
  mesh: THREE.Mesh
  light: THREE.PointLight
  points: THREE.Points
  positions: THREE.BufferAttribute
  velocities: THREE.Vector3[]
  age: number
  duration: number
}

interface SkyLantern {
  mesh: THREE.Group
  light: THREE.PointLight
  vx: number
  vy: number
  vz: number
  swayPhase: number
  age: number
}

interface FlowerPetal {
  mesh: THREE.Mesh
  velocity: THREE.Vector3
  rotSpeed: THREE.Vector3
}

interface LadiCracker {
  group: THREE.Group
  sparks: THREE.Points
  positions: THREE.BufferAttribute
  age: number
  lastPopIndex: number
}

const disposeMaterials = (material: THREE.Material | THREE.Material[]) => {
  const materials = Array.isArray(material) ? material : [material]
  materials.forEach(item => item.dispose())
}

// Rangoli color definitions
const THEME_COLORS = {
  gold: {
    outerRing: '#e8b65f',
    midRing: '#e27b38',
    innerRing: '#ffcc66',
    petalsA: '#e9b65e',
    petalsB: '#bd648b',
    glow: '#ff9c38',
  },
  peacock: {
    outerRing: '#22a085',
    midRing: '#1b639e',
    innerRing: '#3cd070',
    petalsA: '#159678',
    petalsB: '#3554b0',
    glow: '#26c281',
  },
  kumkum: {
    outerRing: '#d43048',
    midRing: '#e66b37',
    innerRing: '#f7bb53',
    petalsA: '#c42844',
    petalsB: '#dc3f83',
    glow: '#e03650',
  },
}

onMounted(() => {
  const container = host.value
  if (!container) return

  const activeScene = new THREE.Scene()
  scene = activeScene
  activeScene.background = new THREE.Color(0x5a1827)
  activeScene.fog = new THREE.FogExp2('#5b1928', 0.0062)

  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 200)
  activeCamera = camera
  camera.position.copy(cameraTarget)
  camera.lookAt(0, 4.5, -2)

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8))
  renderer.setSize(container.clientWidth, container.clientHeight)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.18
  container.appendChild(renderer.domElement)

  // Collections for animation updates
  const bulbs: THREE.Mesh[] = []
  const lanterns: THREE.Mesh[] = []
  const fireworks: FireworkBurst[] = []
  const sparkEffects: SparkEffect[] = []
  const houseLights: THREE.PointLight[] = []
  const chakris: ChakriEffect[] = []
  const anars: AnarEffect[] = []
  const skyLanterns: SkyLantern[] = []
  const flowerPetals: FlowerPetal[] = []
  const ladis: LadiCracker[] = []
  const rangoliMeshes: { mesh: THREE.Mesh; role: 'outer' | 'mid' | 'inner' | 'petalA' | 'petalB' }[] = []

  // Lighting
  ambient = new THREE.HemisphereLight(0xffdfcb, 0x37151f, props.revealed ? 1.25 : 0.48)
  activeScene.add(ambient)
  activeScene.add(new THREE.AmbientLight(0x8c7088, 0.25))

  const moonlight = new THREE.DirectionalLight(0xffc5ad, 1.1)
  moonlight.position.set(-12, 22, 16)
  activeScene.add(moonlight)

  // Ground Plane
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(120, 120),
    new THREE.MeshStandardMaterial({ color: '#38303a', roughness: 0.92 }),
  )
  ground.rotation.x = -Math.PI / 2
  ground.position.y = -0.12
  activeScene.add(ground)

  // Tile Lines
  const tileMaterial = new THREE.MeshBasicMaterial({ color: '#8f7a7a', transparent: true, opacity: 0.15 })
  for (let x = -48; x <= 48; x += 4) {
    const line = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.018, 90), tileMaterial)
    line.position.set(x, -0.09, 8)
    activeScene.add(line)
  }
  for (let z = -32; z <= 48; z += 4) {
    const line = new THREE.Mesh(new THREE.BoxGeometry(96, 0.018, 0.035), tileMaterial)
    line.position.set(0, -0.09, z)
    activeScene.add(line)
  }

  const makeBox = (
    width: number,
    height: number,
    depth: number,
    color: string,
    position: THREE.Vector3,
    options: { emissive?: string; emissiveIntensity?: number; roughness?: number } = {},
    parent: THREE.Object3D = activeScene,
  ) => {
    const material = new THREE.MeshStandardMaterial({
      color,
      roughness: options.roughness ?? 0.82,
      emissive: options.emissive ?? '#000000',
      emissiveIntensity: options.emissiveIntensity ?? 0,
    })
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material)
    mesh.position.copy(position)
    parent.add(mesh)
    return mesh
  }

  // City Skyline
  const skyline = new THREE.Group()
  activeScene.add(skyline)
  for (let i = 0; i < 38; i += 1) {
    const x = (i - 19) * 2.4 + Math.sin(i * 5.7) * 1.1
    const height = 3 + ((i * 13) % 8)
    const block = makeBox(
      2.1 + (i % 3) * 0.25,
      height,
      1.8,
      i % 2 ? '#37303c' : '#2d2935',
      new THREE.Vector3(x, height / 2 - 0.15, -15 - (i % 3) * 2),
      {},
      skyline,
    )
    for (let row = 1; row < height / 1.6; row += 1) {
      if (i % 4 === 0 || (i + row) % 5 === 0) {
        makeBox(
          0.22,
          0.28,
          0.04,
          '#ffce80',
          new THREE.Vector3(x + ((row % 2) ? -0.45 : 0.45), row * 1.4, block.position.z + 0.93),
          { emissive: '#ffb452', emissiveIntensity: 0.72 },
          skyline,
        )
      }
    }
  }

  // Festive Haveli House
  const house = new THREE.Group()
  activeScene.add(house)
  makeBox(17, 8.8, 0.8, '#b59a86', new THREE.Vector3(0, 4.4, -7), {}, house)
  makeBox(18.5, 0.38, 1.1, '#7b5445', new THREE.Vector3(0, 0.35, -6.9), {}, house)
  makeBox(18, 0.32, 1.15, '#d3ac83', new THREE.Vector3(0, 8.9, -6.9), {}, house)
  makeBox(17.2, 0.22, 1.3, '#89624f', new THREE.Vector3(0, 9.2, -6.9), {}, house)
  makeBox(5.2, 0.52, 1.5, '#d0aa82', new THREE.Vector3(0, 9.65, -6.9), {}, house)
  makeBox(3.9, 1.2, 0.8, '#7a574c', new THREE.Vector3(0, 10.35, -7.05), {}, house)
  makeBox(16.2, 0.16, 1.7, '#c2a184', new THREE.Vector3(0, 5.35, -6.15), {}, house)
  makeBox(16.5, 0.16, 1.7, '#c2a184', new THREE.Vector3(0, 2.3, -6.15), {}, house)

  // Windows with warm Diwali lights
  for (const x of [-6.4, -3.2, 3.2, 6.4]) {
    for (const y of [6.8, 3.6]) {
      makeBox(1.78, 1.92, 0.2, '#5e382c', new THREE.Vector3(x, y, -6.45), {}, house)
      makeBox(1.56, 1.7, 0.12, '#ffd37f', new THREE.Vector3(x, y, -6.3), { emissive: '#ffae4d', emissiveIntensity: 0.8 }, house)
      makeBox(1.34, 1.47, 0.08, '#ffe5a7', new THREE.Vector3(x, y, -6.2), { emissive: '#ffbc62', emissiveIntensity: 2.5 }, house)
      for (const barX of [-0.38, 0, 0.38]) {
        makeBox(0.055, 1.62, 0.1, '#70442f', new THREE.Vector3(x + barX, y, -6.1), {}, house)
      }
      makeBox(1.45, 0.065, 0.1, '#70442f', new THREE.Vector3(x, y, -6.1), {}, house)
      makeBox(1.76, 0.12, 0.16, '#e5c08b', new THREE.Vector3(x, y - 0.94, -6.15), {}, house)
    }
  }

  // Haveli Wooden Main Door
  makeBox(2.55, 3.85, 0.24, '#4b342e', new THREE.Vector3(0, 2.02, -6.3), {}, house)
  makeBox(2.05, 3.35, 0.12, '#d1a96e', new THREE.Vector3(0, 1.93, -6.14), {}, house)
  makeBox(1.78, 3.05, 0.1, '#671f2b', new THREE.Vector3(0, 1.82, -6.05), { emissive: '#45101a', emissiveIntensity: 0.28 }, house)
  makeBox(0.7, 0.07, 0.035, '#f4d296', new THREE.Vector3(0, 2.72, -5.99), {}, house)
  makeBox(0.7, 0.07, 0.035, '#f4d296', new THREE.Vector3(0, 1.62, -5.99), {}, house)
  makeBox(0.07, 1.1, 0.035, '#f4d296', new THREE.Vector3(-0.31, 2.17, -5.99), {}, house)
  makeBox(0.07, 1.1, 0.035, '#f4d296', new THREE.Vector3(0.31, 2.17, -5.99), {}, house)

  const doorKnob = new THREE.Mesh(
    new THREE.SphereGeometry(0.09, 12, 12),
    new THREE.MeshStandardMaterial({ color: '#ffd77d', emissive: '#ffb52e', emissiveIntensity: 0.5, metalness: 0.65, roughness: 0.28 }),
  )
  doorKnob.position.set(0.64, 1.85, -5.91)
  house.add(doorKnob)
  makeBox(2.8, 0.18, 0.28, '#e1c08e', new THREE.Vector3(0, 3.93, -5.98), {}, house)
  makeBox(0.2, 0.85, 0.18, '#e1c08e', new THREE.Vector3(-1.28, 3.48, -5.98), {}, house)
  makeBox(0.2, 0.85, 0.18, '#e1c08e', new THREE.Vector3(1.28, 3.48, -5.98), {}, house)

  // Balcony railings
  for (const x of [-2.2, 2.2]) {
    makeBox(0.2, 1.45, 0.2, '#9a715a', new THREE.Vector3(x, 4.75, -5.95), {}, house)
  }
  makeBox(5.1, 0.15, 0.25, '#bc9672', new THREE.Vector3(0, 5.46, -5.95), {}, house)
  for (let x = -2.35; x <= 2.36; x += 0.32) {
    makeBox(0.055, 1.05, 0.08, '#9b795f', new THREE.Vector3(x, 4.88, -5.9), {}, house)
  }

  // String Lights across house roof
  const stringLights = new THREE.Group()
  house.add(stringLights)
  const lightPoints = [
    new THREE.Vector3(-8.6, 8.55, -5.95),
    new THREE.Vector3(-5.4, 8.15, -5.95),
    new THREE.Vector3(0, 8.55, -5.95),
    new THREE.Vector3(5.4, 8.15, -5.95),
    new THREE.Vector3(8.6, 8.55, -5.95),
  ]
  const curve = new THREE.CatmullRomCurve3(lightPoints)
  stringLights.add(new THREE.Mesh(
    new THREE.TubeGeometry(curve, 48, 0.025, 5, false),
    new THREE.MeshStandardMaterial({ color: '#ddb889', roughness: 0.6 }),
  ))
  for (let i = 0; i <= 42; i += 1) {
    const point = curve.getPoint(i / 42)
    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.085, 8, 8),
      new THREE.MeshStandardMaterial({ color: '#fff0bd', emissive: '#ffb951', emissiveIntensity: 2.4 }),
    )
    bulb.position.copy(point)
    stringLights.add(bulb)
    bulbs.push(bulb)
    if (i % 9 === 0) {
      const glow = new THREE.PointLight('#ffbb62', 0.6, 4.5, 2)
      glow.position.copy(point)
      house.add(glow)
      houseLights.push(glow)
    }
  }

  // Festive Marigold & Mango Leaf Toran (Festoons)
  const toran = new THREE.Group()
  house.add(toran)
  const toranCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-3.1, 4.1, -5.72),
    new THREE.Vector3(-2, 3.65, -5.72),
    new THREE.Vector3(-1, 3.42, -5.72),
    new THREE.Vector3(0, 3.36, -5.72),
    new THREE.Vector3(1, 3.42, -5.72),
    new THREE.Vector3(2, 3.65, -5.72),
    new THREE.Vector3(3.1, 4.1, -5.72),
  ])
  toran.add(new THREE.Mesh(
    new THREE.TubeGeometry(toranCurve, 36, 0.045, 6, false),
    new THREE.MeshStandardMaterial({ color: '#d99b42', roughness: 0.84 }),
  ))
  for (let i = 0; i <= 28; i += 1) {
    const point = toranCurve.getPoint(i / 28)
    const flower = new THREE.Mesh(
      new THREE.SphereGeometry(0.13, 9, 8),
      new THREE.MeshStandardMaterial({
        color: i % 2 ? '#f5ae45' : '#e76b42',
        emissive: '#8b361c',
        emissiveIntensity: 0.12,
      }),
    )
    flower.position.copy(point)
    flower.scale.set(1, 0.86, 0.78)
    toran.add(flower)
  }
  for (const x of [-2.7, -1.8, -0.9, 0.9, 1.8, 2.7]) {
    const leaf = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 8, 8),
      new THREE.MeshStandardMaterial({ color: '#587248', roughness: 0.9 }),
    )
    leaf.scale.set(0.55, 1.5, 0.35)
    leaf.position.set(x, 3.1 + (Math.abs(x) / 2.7) * 0.75, -5.7)
    leaf.rotation.z = x < 0 ? -0.48 : 0.48
    toran.add(leaf)
  }

  // Terrace parapets
  const terrace = new THREE.Group()
  activeScene.add(terrace)
  for (const side of [-1, 1]) {
    makeBox(0.25, 1.35, 18, '#8e7666', new THREE.Vector3(side * 13, 0.68, 0), {}, terrace)
    makeBox(0.15, 0.15, 19, '#dfc09a', new THREE.Vector3(side * 13, 1.36, 0), {}, terrace)
    for (let z = -8; z <= 9; z += 2) {
      makeBox(0.12, 0.75, 0.12, '#a18a77', new THREE.Vector3(side * 13, 0.95, z), {}, terrace)
    }
  }
  for (const x of [-13, 13]) {
    for (let z = -8; z <= 9; z += 0.72) {
      const bulb = new THREE.Mesh(
        new THREE.SphereGeometry(0.075, 8, 8),
        new THREE.MeshStandardMaterial({ color: '#ffdd9c', emissive: '#ffbd62', emissiveIntensity: 1.15 }),
      )
      bulb.position.set(x, 1.5 + Math.sin((z + 8) * 0.27) * 0.55, z)
      terrace.add(bulb)
      bulbs.push(bulb)
    }
  }

  // Courtyard Trees
  const addTree = (x: number, z: number, scale: number) => {
    const tree = new THREE.Group()
    tree.position.set(x, 0, z)
    tree.scale.setScalar(scale)
    activeScene.add(tree)
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.33, 5.3, 7),
      new THREE.MeshStandardMaterial({ color: '#3e302a', roughness: 1 }),
    )
    trunk.position.y = 2.65
    tree.add(trunk)
    for (let i = 0; i < 19; i += 1) {
      const angle = i * 2.399
      const radius = 0.7 + (i % 5) * 0.36
      const foliage = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.95 + (i % 3) * 0.2, 1),
        new THREE.MeshStandardMaterial({ color: i % 2 ? '#39343d' : '#474048', roughness: 1 }),
      )
      foliage.position.set(Math.cos(angle) * radius, 4.2 + Math.sin(i * 2.1) * 1.7, Math.sin(angle) * radius)
      tree.add(foliage)
    }
  }
  addTree(-15, -4, 1.25)
  addTree(15, -5, 1.15)

  // Starry Night Sky
  const starPositions = new Float32Array(500 * 3)
  for (let i = 0; i < 500; i += 1) {
    starPositions[i * 3] = (Math.random() - 0.5) * 100
    starPositions[i * 3 + 1] = 9 + Math.random() * 32
    starPositions[i * 3 + 2] = -36 + Math.random() * 15
  }
  const starGeometry = new THREE.BufferGeometry()
  starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3))
  activeScene.add(new THREE.Points(
    starGeometry,
    new THREE.PointsMaterial({ color: '#ffe9ca', size: 0.1, transparent: true, opacity: 0.8 }),
  ))

  // Floating Sky Lanterns in background
  for (let i = 0; i < 14; i += 1) {
    const x = Math.sin(i * 12.8) * 23
    const z = -11 + (i % 5) * 1.2
    const lantern = makeBox(
      0.48,
      0.82,
      0.42,
      '#ffbf73',
      new THREE.Vector3(x, 4 + (i % 4) * 2.2, z),
      { emissive: '#ff9d46', emissiveIntensity: 1.4 },
    )
    lantern.userData.baseY = lantern.position.y
    lantern.userData.phase = i * 0.8
    lanterns.push(lantern)
  }

  // ==========================================
  // SACRED CENTRAL DIYA & AARTI THALI
  // ==========================================
  const diya = new THREE.Group()
  diya.position.set(0, 0.16, 5)
  diyaGroup = diya
  activeScene.add(diya)

  // Clay Diya Bowl
  const bowl = new THREE.Mesh(
    new THREE.LatheGeometry([
      new THREE.Vector2(0, 0),
      new THREE.Vector2(0.65, 0.08),
      new THREE.Vector2(1.12, 0.28),
      new THREE.Vector2(1.3, 0.57),
      new THREE.Vector2(1.13, 0.82),
      new THREE.Vector2(0.7, 0.9),
      new THREE.Vector2(0, 0.87),
    ], 48),
    new THREE.MeshStandardMaterial({ color: '#70452f', roughness: 0.36, metalness: 0.18 }),
  )
  bowl.scale.set(1.55, 1, 1.1)
  diya.add(bowl)

  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(1.18, 0.1, 12, 48),
    new THREE.MeshStandardMaterial({ color: '#d3a56c', roughness: 0.32, metalness: 0.28 }),
  )
  rim.rotation.x = Math.PI / 2
  rim.scale.set(1.55, 1.1, 1)
  rim.position.y = 0.78
  diya.add(rim)

  for (let i = 0; i < 13; i += 1) {
    const dot = new THREE.Mesh(
      new THREE.SphereGeometry(0.06, 8, 8),
      new THREE.MeshStandardMaterial({ color: '#f1d2a7', roughness: 0.5 }),
    )
    const angle = (i / 13) * Math.PI * 2
    dot.position.set(Math.cos(angle) * 1.65, 0.38, Math.sin(angle) * 1.15)
    diya.add(dot)
  }

  // Realistic Two-Tone Diya Flame (Inner Blue Core + Outer Golden Aura)
  flame = new THREE.Mesh(
    new THREE.SphereGeometry(0.26, 16, 16),
    new THREE.MeshStandardMaterial({ color: '#ffe8ad', emissive: '#ff9d2f', emissiveIntensity: 2.4, toneMapped: false }),
  )
  flame.scale.set(0.64, 1.8, 0.64)
  flame.position.set(0, 1.28, 0)
  flame.visible = props.revealed
  diya.add(flame)

  innerFlame = new THREE.Mesh(
    new THREE.SphereGeometry(0.12, 12, 12),
    new THREE.MeshBasicMaterial({ color: '#7ad9ff', toneMapped: false }),
  )
  innerFlame.scale.set(0.5, 1.0, 0.5)
  innerFlame.position.set(0, 1.05, 0)
  innerFlame.visible = props.revealed
  diya.add(innerFlame)

  flameLight = new THREE.PointLight('#ff9b40', props.revealed ? 5.2 : 0.2, 28, 1.8)
  flameLight.position.set(0, 1.48, 0)
  diya.add(flameLight)

  // ==========================================
  // RANGOLI MANDALA WITH DYNAMIC COLOR THEMES
  // ==========================================
  const rangoli = new THREE.Group()
  rangoli.position.set(0, 0.035, 5)
  activeScene.add(rangoli)

  const currentTheme = THEME_COLORS[props.theme] || THEME_COLORS.gold

  // Rings
  const outerRingMat = new THREE.MeshStandardMaterial({ color: currentTheme.outerRing, emissive: currentTheme.outerRing, emissiveIntensity: 0.28, roughness: 0.72 })
  const outerRing = new THREE.Mesh(new THREE.TorusGeometry(3.05, 0.035, 8, 96), outerRingMat)
  outerRing.rotation.x = Math.PI / 2
  rangoli.add(outerRing)
  rangoliMeshes.push({ mesh: outerRing, role: 'outer' })

  const midRingMat = new THREE.MeshStandardMaterial({ color: currentTheme.midRing, emissive: currentTheme.midRing, emissiveIntensity: 0.28, roughness: 0.72 })
  const midRing = new THREE.Mesh(new THREE.TorusGeometry(2.28, 0.035, 8, 96), midRingMat)
  midRing.rotation.x = Math.PI / 2
  rangoli.add(midRing)
  rangoliMeshes.push({ mesh: midRing, role: 'mid' })

  const innerRingMat = new THREE.MeshStandardMaterial({ color: currentTheme.innerRing, emissive: currentTheme.innerRing, emissiveIntensity: 0.28, roughness: 0.72 })
  const innerRing = new THREE.Mesh(new THREE.TorusGeometry(2.08, 0.035, 8, 96), innerRingMat)
  innerRing.rotation.x = Math.PI / 2
  rangoli.add(innerRing)
  rangoliMeshes.push({ mesh: innerRing, role: 'inner' })

  // Petals
  for (let i = 0; i < 12; i += 1) {
    const angle = (i / 12) * Math.PI * 2
    const isOdd = i % 2 === 1
    const petalMat = new THREE.MeshStandardMaterial({
      color: isOdd ? currentTheme.petalsB : currentTheme.petalsA,
      emissive: isOdd ? currentTheme.petalsB : currentTheme.petalsA,
      emissiveIntensity: 0.22,
      roughness: 0.68,
    })
    const petal = new THREE.Mesh(new THREE.SphereGeometry(0.38, 12, 8), petalMat)
    petal.scale.set(0.68, 0.12, 1.35)
    petal.position.set(Math.sin(angle) * 2.63, 0.025, Math.cos(angle) * 2.63)
    petal.rotation.y = angle
    rangoli.add(petal)
    rangoliMeshes.push({ mesh: petal, role: isOdd ? 'petalB' : 'petalA' })

    const dot = new THREE.Mesh(
      new THREE.SphereGeometry(0.085, 8, 8),
      new THREE.MeshStandardMaterial({ color: '#ffe6ad', emissive: '#d88b37', emissiveIntensity: 0.5 }),
    )
    dot.position.set(Math.sin(angle) * 3.28, 0.04, Math.cos(angle) * 3.28)
    rangoli.add(dot)
  }

  // Update Rangoli Theme function
  const updateRangoliColors = (themeKey: 'gold' | 'peacock' | 'kumkum') => {
    const t = THEME_COLORS[themeKey] || THEME_COLORS.gold
    rangoliMeshes.forEach(({ mesh, role }) => {
      const mat = mesh.material as THREE.MeshStandardMaterial
      let targetColor = t.outerRing
      if (role === 'mid') targetColor = t.midRing
      if (role === 'inner') targetColor = t.innerRing
      if (role === 'petalA') targetColor = t.petalsA
      if (role === 'petalB') targetColor = t.petalsB
      mat.color.set(targetColor)
      mat.emissive.set(targetColor)
    })
  }

  // Courtyard Diyas
  const smallFlames: THREE.Mesh[] = []
  const smallFlameLights: THREE.PointLight[] = []
  for (const x of [-5.5, 5.5, -8, 8, -3, 3]) {
    const zPos = Math.abs(x) > 6 ? 1 : 2.5
    const smallDiya = new THREE.Mesh(
      new THREE.LatheGeometry([
        new THREE.Vector2(0, 0),
        new THREE.Vector2(0.45, 0.12),
        new THREE.Vector2(0.55, 0.48),
        new THREE.Vector2(0.35, 0.62),
        new THREE.Vector2(0, 0.6),
      ], 24),
      new THREE.MeshStandardMaterial({ color: '#79503b', roughness: 0.48, metalness: 0.1 }),
    )
    smallDiya.position.set(x, 0, zPos)
    smallDiya.scale.setScalar(0.72)
    activeScene.add(smallDiya)

    const smallFlame = new THREE.Mesh(
      new THREE.SphereGeometry(0.19, 12, 12),
      new THREE.MeshStandardMaterial({ color: '#fff0bd', emissive: '#ff9d35', emissiveIntensity: 2, toneMapped: false }),
    )
    smallFlame.scale.set(0.62, 1.7, 0.62)
    smallFlame.position.set(x, 0.82, zPos)
    smallFlame.visible = props.revealed || props.candlesLit
    activeScene.add(smallFlame)
    smallFlames.push(smallFlame)

    const smallLight = new THREE.PointLight('#ff9b40', (props.revealed || props.candlesLit) ? 1.8 : 0, 8, 2)
    smallLight.position.set(x, 1, zPos)
    activeScene.add(smallLight)
    smallFlameLights.push(smallLight)
  }

  // Generic Spark Effect Spawner
  const addSparkEffect = (origin: THREE.Vector3, color: number, upward: boolean, count: number) => {
    const data = new Float32Array(count * 3)
    const positions = new THREE.BufferAttribute(data, 3)
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', positions)
    const points = new THREE.Points(
      geometry,
      new THREE.PointsMaterial({
        color,
        size: upward ? 0.2 : 0.14,
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
        depthWrite: false,
      }),
    )
    points.frustumCulled = false
    activeScene.add(points)
    const velocities = Array.from({ length: count }, (_, index) => {
      const angle = (index / count) * Math.PI * 2
      return upward
        ? new THREE.Vector3(Math.cos(angle) * (0.25 + Math.random() * 0.7), 3 + Math.random() * 2.5, Math.sin(angle) * (0.25 + Math.random() * 0.7))
        : new THREE.Vector3(Math.cos(angle) * (0.35 + Math.random() * 1.1), 2.4 + Math.random() * 3.2, Math.sin(angle) * (0.3 + Math.random() * 1.1))
    })
    sparkEffects.push({
      points,
      positions,
      origin,
      velocities,
      lifetime: upward ? 1.25 : 1.05,
    })
    return points
  }

  // Sparkler stands at sides
  const leftSparkler = new THREE.Group()
  leftSparkler.position.set(-11, 0.08, 2)
  leftSparkler.rotation.z = -0.12
  activeScene.add(leftSparkler)

  const rightSparkler = new THREE.Group()
  rightSparkler.position.set(11, 0.08, 2)
  rightSparkler.rotation.z = 0.12
  activeScene.add(rightSparkler)

  for (const sparkler of [leftSparkler, rightSparkler]) {
    const stick = new THREE.Mesh(
      new THREE.CylinderGeometry(0.055, 0.07, 2.2, 8),
      new THREE.MeshStandardMaterial({ color: '#cbb89c', metalness: 0.35, roughness: 0.48 }),
    )
    stick.position.y = 1.05
    sparkler.add(stick)
    const tip = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 10, 10),
      new THREE.MeshBasicMaterial({ color: '#fff2bd', toneMapped: false }),
    )
    tip.position.y = 2.18
    sparkler.add(tip)
  }
  const sparklerEffects = [
    addSparkEffect(new THREE.Vector3(-11, 2.25, 2), 0xffd77b, true, 36),
    addSparkEffect(new THREE.Vector3(11, 2.25, 2), 0xffa45b, true, 36),
  ]

  // Courtyard Flowerpots (Anars)
  const flowerpotPositions = [
    new THREE.Vector3(-9, 0.1, -3),
    new THREE.Vector3(9, 0.1, -3),
  ]
  const flowerpotEffects = flowerpotPositions.map((position, index) => {
    const pot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.72, 0.95, 12, 1, false),
      new THREE.MeshStandardMaterial({
        color: index ? '#b54e3f' : '#c26040',
        emissive: '#461a13',
        emissiveIntensity: 0.22,
        roughness: 0.66,
      }),
    )
    pot.position.copy(position)
    pot.position.y += 0.47
    activeScene.add(pot)
    const potRim = new THREE.Mesh(
      new THREE.TorusGeometry(0.26, 0.08, 8, 16),
      new THREE.MeshStandardMaterial({ color: '#f0be78', metalness: 0.38, roughness: 0.44 }),
    )
    potRim.rotation.x = Math.PI / 2
    potRim.position.set(position.x, position.y + 0.92, position.z)
    activeScene.add(potRim)
    const fountainGlow = new THREE.PointLight('#ff9c49', 0, 9, 2)
    fountainGlow.position.set(position.x, position.y + 0.7, position.z)
    activeScene.add(fountainGlow)
    return {
      effect: addSparkEffect(new THREE.Vector3(position.x, position.y + 0.9, position.z), index ? 0xffa454 : 0xffd56c, false, 52),
      glow: fountainGlow,
    }
  })

  // Handheld Sparkler Wand for Cursor/Pointer
  const wandGroup = new THREE.Group()
  activeScene.add(wandGroup)
  const wandStick = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.04, 2.2, 8),
    new THREE.MeshStandardMaterial({ color: '#e0c8a0', metalness: 0.5, roughness: 0.3 }),
  )
  wandStick.rotation.z = Math.PI / 4
  wandStick.position.set(-0.6, -0.6, 0)
  wandGroup.add(wandStick)
  const wandTip = new THREE.Mesh(
    new THREE.SphereGeometry(0.12, 12, 12),
    new THREE.MeshBasicMaterial({ color: '#fff9e6', toneMapped: false }),
  )
  wandGroup.add(wandTip)
  wandGroup.visible = false

  const wandSparkPositions = new Float32Array(48 * 3)
  const wandSparkAttr = new THREE.BufferAttribute(wandSparkPositions, 3)
  const wandSparkGeo = new THREE.BufferGeometry()
  wandSparkGeo.setAttribute('position', wandSparkAttr)
  const wandSparkPoints = new THREE.Points(
    wandSparkGeo,
    new THREE.PointsMaterial({
      color: 0xffd875,
      size: 0.28,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
    }),
  )
  wandSparkPoints.frustumCulled = false
  wandSparkPoints.visible = false
  activeScene.add(wandSparkPoints)
  const wandVelocities = Array.from({ length: 48 }, () => new THREE.Vector3(
    (Math.random() - 0.5) * 4.5,
    (Math.random() - 0.5) * 4.5,
    (Math.random() - 0.5) * 3.5,
  ))

  // ==========================================
  // NEXT-LEVEL CRACKER SPAWNERS
  // ==========================================

  // 1. Firework Rocket Burst Spawner
  const spawnFirework = (x: number, y: number, z: number, color: number) => {
    emit('rocketLaunch')
    const count = 160
    const positions = new Float32Array(count * 3)
    const velocities: THREE.Vector3[] = []
    for (let i = 0; i < count; i += 1) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const speed = 4.0 + Math.random() * 5.0
      positions.set([x, y, z], i * 3)
      velocities.push(new THREE.Vector3(
        Math.sin(phi) * Math.cos(theta) * speed,
        Math.cos(phi) * speed,
        Math.sin(phi) * Math.sin(theta) * speed,
      ))
    }

    const geometry = new THREE.BufferGeometry()
    const positionAttribute = new THREE.BufferAttribute(positions, 3)
    geometry.setAttribute('position', positionAttribute)
    const points = new THREE.Points(
      geometry,
      new THREE.PointsMaterial({
        color,
        size: 0.65,
        transparent: true,
        opacity: 1,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
        depthWrite: false,
      }),
    )
    points.frustumCulled = false
    points.visible = false
    activeScene.add(points)

    const rocket = new THREE.Mesh(
      new THREE.SphereGeometry(0.14, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xfff0bd, toneMapped: false }),
    )
    rocket.position.set(x, 1, z)
    activeScene.add(rocket)

    const trailGeometry = new THREE.BufferGeometry()
    trailGeometry.setAttribute('position', new THREE.Float32BufferAttribute([x, 0.2, z, x, 1, z], 3))
    const trail = new THREE.Line(
      trailGeometry,
      new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.8 }),
    )
    activeScene.add(trail)

    fireworks.push({
      points,
      positionAttribute,
      velocities,
      rocket,
      trail,
      x,
      z,
      targetY: y,
      exploded: false,
      age: 0,
    })
  }

  // 2. Ground Chakri (Spinning Fire Wheel) Spawner
  const spawnChakri = (x: number, z: number) => {
    emit('chakriSpin')
    const chakriGroup = new THREE.Group()
    chakriGroup.position.set(x, 0.08, z)
    activeScene.add(chakriGroup)

    // Disc body with festive coil texture
    const disc = new THREE.Mesh(
      new THREE.CylinderGeometry(0.65, 0.72, 0.12, 24),
      new THREE.MeshStandardMaterial({ color: '#ff4438', emissive: '#aa1c12', emissiveIntensity: 0.6, metalness: 0.2 }),
    )
    chakriGroup.add(disc)

    const centerPin = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 0.2, 12),
      new THREE.MeshStandardMaterial({ color: '#ffe699', metalness: 0.8, roughness: 0.2 }),
    )
    centerPin.position.y = 0.08
    chakriGroup.add(centerPin)

    const chakriLight = new THREE.PointLight('#ff9d3b', 4.5, 12, 1.8)
    chakriLight.position.set(x, 0.4, z)
    activeScene.add(chakriLight)

    // Tangential high-speed spark particles
    const sparkCount = 96
    const data = new Float32Array(sparkCount * 3)
    const positions = new THREE.BufferAttribute(data, 3)
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', positions)
    const points = new THREE.Points(
      geo,
      new THREE.PointsMaterial({
        color: 0xffda68,
        size: 0.25,
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
      }),
    )
    points.frustumCulled = false
    activeScene.add(points)

    const velocities = Array.from({ length: sparkCount }, () => new THREE.Vector3())

    chakris.push({
      mesh: chakriGroup,
      light: chakriLight,
      points,
      positions,
      velocities,
      age: 0,
      duration: 2.8,
    })
  }

  // 3. Dynamic Anar / Flowerpot Spawner
  const spawnAnar = (x: number, z: number) => {
    emit('anarBurst')
    const pot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.62, 0.85, 16),
      new THREE.MeshStandardMaterial({ color: '#d85038', emissive: '#55150c', emissiveIntensity: 0.35, roughness: 0.6 }),
    )
    pot.position.set(x, 0.42, z)
    activeScene.add(pot)

    const light = new THREE.PointLight('#ffaa4e', 5.5, 16, 1.8)
    light.position.set(x, 1.5, z)
    activeScene.add(light)

    const sparkCount = 120
    const data = new Float32Array(sparkCount * 3)
    const positions = new THREE.BufferAttribute(data, 3)
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', positions)
    const points = new THREE.Points(
      geo,
      new THREE.PointsMaterial({
        color: 0xffea95,
        size: 0.28,
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
      }),
    )
    points.frustumCulled = false
    activeScene.add(points)

    const velocities = Array.from({ length: sparkCount }, () => {
      const spreadAngle = Math.random() * Math.PI * 2
      const spreadSpeed = 0.4 + Math.random() * 1.8
      return new THREE.Vector3(
        Math.cos(spreadAngle) * spreadSpeed,
        4.8 + Math.random() * 4.2, // Shoot high up
        Math.sin(spreadAngle) * spreadSpeed,
      )
    })

    anars.push({
      mesh: pot,
      light,
      points,
      positions,
      velocities,
      age: 0,
      duration: 3.2,
    })
  }

  // 4. Sky Lantern (Akashkandil) Release
  const spawnSkyLantern = (x: number, z: number) => {
    emit('lanternRelease')
    const lanternGroup = new THREE.Group()
    lanternGroup.position.set(x, 0.5, z)
    activeScene.add(lanternGroup)

    // Lantern cylinder/octagon body with warm glow
    const lanternMat = new THREE.MeshStandardMaterial({
      color: '#ffc873',
      emissive: '#ff9033',
      emissiveIntensity: 2.2,
      roughness: 0.4,
    })
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.48, 0.95, 8), lanternMat)
    lanternGroup.add(body)

    // Inner glowing diya flame inside lantern
    const core = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 8, 8),
      new THREE.MeshBasicMaterial({ color: '#fff9d6', toneMapped: false }),
    )
    core.position.y = -0.2
    lanternGroup.add(core)

    const light = new THREE.PointLight('#ffab4a', 1.8, 8, 2)
    light.position.set(x, 0.5, z)
    activeScene.add(light)

    skyLanterns.push({
      mesh: lanternGroup,
      light,
      vx: (Math.random() - 0.5) * 0.4,
      vy: 1.2 + Math.random() * 0.6,
      vz: -0.2 - Math.random() * 0.3,
      swayPhase: Math.random() * Math.PI * 2,
      age: 0,
    })
  }

  // 5. 1000-Wala Ladi Firecracker Garland Spawner
  const spawnLadi = (startX: number, startZ: number) => {
    emit('ladiPop')
    const ladiGroup = new THREE.Group()
    activeScene.add(ladiGroup)

    // Place small red firecracker tubes in a zig-zag chain
    const popCount = 18
    for (let i = 0; i < popCount; i += 1) {
      const tube = new THREE.Mesh(
        new THREE.CylinderGeometry(0.045, 0.045, 0.22, 6),
        new THREE.MeshStandardMaterial({ color: '#c41d1d', roughness: 0.6 }),
      )
      tube.rotation.x = Math.PI / 2
      tube.rotation.z = (Math.random() - 0.5) * 0.8
      tube.position.set(startX + (i - popCount / 2) * 0.24, 0.04, startZ + Math.sin(i * 1.5) * 0.15)
      ladiGroup.add(tube)
    }

    const sparkCount = 36
    const data = new Float32Array(sparkCount * 3)
    const positions = new THREE.BufferAttribute(data, 3)
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', positions)
    const sparks = new THREE.Points(
      geo,
      new THREE.PointsMaterial({
        color: 0xfff0ad,
        size: 0.35,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
      }),
    )
    sparks.frustumCulled = false
    activeScene.add(sparks)

    ladis.push({
      group: ladiGroup,
      sparks,
      positions,
      age: 0,
      lastPopIndex: -1,
    })
  }

  // 6. Marigold Flower Petal Rain System
  const petalColors = ['#f59b22', '#ffc12e', '#e74c3c', '#d35400', '#f39c12']
  const spawnPetal = () => {
    const color = petalColors[Math.floor(Math.random() * petalColors.length)] ?? '#f59b22'
    const petalGeo = new THREE.SphereGeometry(0.16, 6, 4)
    petalGeo.scale(1, 0.18, 1.4)
    const petalMesh = new THREE.Mesh(
      petalGeo,
      new THREE.MeshStandardMaterial({ color, roughness: 0.85, emissive: color, emissiveIntensity: 0.15 }),
    )
    petalMesh.position.set(
      (Math.random() - 0.5) * 36,
      22 + Math.random() * 8,
      -8 + (Math.random() - 0.5) * 20,
    )
    petalMesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI)
    activeScene.add(petalMesh)

    flowerPetals.push({
      mesh: petalMesh,
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 0.8,
        -1.4 - Math.random() * 0.9,
        (Math.random() - 0.5) * 0.8,
      ),
      rotSpeed: new THREE.Vector3(
        (Math.random() - 0.5) * 2.5,
        (Math.random() - 0.5) * 2.5,
        (Math.random() - 0.5) * 2.5,
      ),
    })
  }

  const clearFireworks = () => {
    fireworks.forEach(({ points, rocket, trail }) => {
      activeScene.remove(points)
      activeScene.remove(rocket)
      activeScene.remove(trail)
      points.geometry.dispose()
      disposeMaterials(points.material)
      rocket.geometry.dispose()
      disposeMaterials(rocket.material)
      trail.geometry.dispose()
      disposeMaterials(trail.material)
    })
    fireworks.length = 0
  }

  const removeFirework = (index: number) => {
    const burst = fireworks[index]
    if (!burst) return
    activeScene.remove(burst.points)
    activeScene.remove(burst.rocket)
    activeScene.remove(burst.trail)
    burst.points.geometry.dispose()
    disposeMaterials(burst.points.material)
    burst.rocket.geometry.dispose()
    disposeMaterials(burst.rocket.material)
    burst.trail.geometry.dispose()
    disposeMaterials(burst.trail.material)
    fireworks.splice(index, 1)
  }

  // Animation Loop variables
  const clock = new THREE.Clock()
  let wasRevealed = props.revealed
  const fireworkColors = [0xffc15e, 0xff7185, 0x7de0ce, 0xa994ff, 0xffedb2, 0xff8c42, 0x48dbfb]
  let nextFireworkAt = 0
  let fireworkIndex = 0
  let lastCelebrationTap = props.celebrationTap
  let petalSpawnTimer = 0

  const clickRaycaster = new THREE.Raycaster()
  const skyPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 8)
  const floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
  const clickNdc = new THREE.Vector2()
  const clickWorld = new THREE.Vector3()

  // MAIN RENDER LOOP
  const render = () => {
    frame = window.requestAnimationFrame(render)
    const delta = Math.min(clock.getDelta(), 0.05)
    const time = clock.elapsedTime

    // Handle User Click / Tap interaction based on Active Cracker
    if (props.celebrationTap !== lastCelebrationTap) {
      lastCelebrationTap = props.celebrationTap
      clickNdc.set(props.clickPosition.x, props.clickPosition.y)
      clickRaycaster.setFromCamera(clickNdc, camera)

      const mode = props.activeCracker || 'rocket'

      if (mode === 'chakri') {
        if (clickRaycaster.ray.intersectPlane(floorPlane, clickWorld)) {
          const x = THREE.MathUtils.clamp(clickWorld.x, -14, 14)
          const z = THREE.MathUtils.clamp(clickWorld.z, -3, 8)
          spawnChakri(x, z)
        } else {
          spawnChakri((Math.random() - 0.5) * 8, 4 + Math.random() * 2)
        }
      } else if (mode === 'anar') {
        if (clickRaycaster.ray.intersectPlane(floorPlane, clickWorld)) {
          const x = THREE.MathUtils.clamp(clickWorld.x, -14, 14)
          const z = THREE.MathUtils.clamp(clickWorld.z, -3, 8)
          spawnAnar(x, z)
        } else {
          spawnAnar((Math.random() - 0.5) * 10, 3 + Math.random() * 2)
        }
      } else if (mode === 'ladi') {
        if (clickRaycaster.ray.intersectPlane(floorPlane, clickWorld)) {
          const x = THREE.MathUtils.clamp(clickWorld.x, -10, 10)
          const z = THREE.MathUtils.clamp(clickWorld.z, -2, 7)
          spawnLadi(x, z)
        } else {
          spawnLadi(0, 4)
        }
      } else if (mode === 'lantern') {
        if (clickRaycaster.ray.intersectPlane(floorPlane, clickWorld)) {
          const x = THREE.MathUtils.clamp(clickWorld.x, -16, 16)
          const z = THREE.MathUtils.clamp(clickWorld.z, -5, 7)
          spawnSkyLantern(x, z)
        } else {
          spawnSkyLantern((Math.random() - 0.5) * 12, 2)
        }
      } else if (mode === 'sparkler') {
        emit('sparklerSpark')
      } else {
        // Default Sky Rocket
        if (clickRaycaster.ray.intersectPlane(skyPlane, clickWorld)) {
          if (fireworks.length >= 14) removeFirework(0)
          const x = THREE.MathUtils.clamp(clickWorld.x, -24, 24)
          const targetY = THREE.MathUtils.clamp(clickWorld.y, 4, 27)
          const color = fireworkColors[fireworkIndex % fireworkColors.length] ?? 0xffd080
          spawnFirework(x, targetY, -8, color)
          fireworkIndex += 1
        }
      }
    }

    // Sparkler Wand pointer tracking
    if (props.activeCracker === 'sparkler') {
      wandGroup.visible = true
      wandSparkPoints.visible = true
      clickNdc.set(props.clickPosition.x, props.clickPosition.y)
      clickRaycaster.setFromCamera(clickNdc, camera)
      const wandPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 18)
      if (clickRaycaster.ray.intersectPlane(wandPlane, clickWorld)) {
        wandGroup.position.copy(clickWorld)
        for (let i = 0; i < wandVelocities.length; i += 1) {
          const vel = wandVelocities[i]
          if (!vel) continue
          const phase = ((time * 2.8 + i * 0.15) % 0.6)
          wandSparkAttr.setXYZ(
            i,
            clickWorld.x + vel.x * phase,
            clickWorld.y + vel.y * phase - 1.8 * phase * phase,
            clickWorld.z + vel.z * phase,
          )
        }
        wandSparkAttr.needsUpdate = true
      }
    } else {
      wandGroup.visible = false
      wandSparkPoints.visible = false
    }

    // Initial Lighting sequence fireworks
    if (props.revealed && !wasRevealed) {
      spawnFirework(-14, 15, -8, 0xff75a8)
      spawnFirework(14, 13, -8, 0x7de0ce)
      fireworkIndex = 0
      nextFireworkAt = time + 0.45
    } else if (!props.revealed && wasRevealed) {
      clearFireworks()
      nextFireworkAt = 0
    }
    wasRevealed = props.revealed

    // Ambient sporadic fireworks while lit
    if (props.revealed && time >= nextFireworkAt && fireworks.length < 5) {
      const positions = [-13, 13, -9, 9, 12, -12, 5, -5]
      const x = positions[fireworkIndex % positions.length] ?? 0
      const targetY = 10 + ((fireworkIndex * 7) % 8)
      const color = fireworkColors[fireworkIndex % fireworkColors.length] ?? 0xffd080
      spawnFirework(x, targetY, -8, color)
      fireworkIndex += 1
      nextFireworkAt = time + 1.6 + Math.random() * 0.8
    }

    // Camera transitions & Aarti motion
    const targetZ = props.revealed ? 37 : 24
    const targetY = props.revealed ? 11 : 8
    cameraTarget.z += (targetZ - cameraTarget.z) * 0.012
    cameraTarget.y += (targetY - cameraTarget.y) * 0.012
    camera.position.set(0, cameraTarget.y, cameraTarget.z)

    // Aarti sacred circular movement
    if (props.aartiActive && diyaGroup) {
      const aartiRadius = 0.55
      const aartiSpeed = time * 2.2
      diyaGroup.position.x = Math.cos(aartiSpeed) * aartiRadius
      diyaGroup.position.y = 0.16 + 0.12 * Math.sin(aartiSpeed * 2)
      diyaGroup.position.z = 5 + Math.sin(aartiSpeed) * aartiRadius
      diyaGroup.rotation.y = aartiSpeed
    } else if (diyaGroup) {
      diyaGroup.position.set(0, 0.16, 5)
      diyaGroup.rotation.set(0, 0, 0)
    }

    camera.lookAt(0, 4.5, -2)

    // Lighting updates
    if (ambient) ambient.intensity += ((props.revealed ? 1.25 : 0.48) - ambient.intensity) * 0.018

    // Flame flicker
    if (flame && innerFlame) {
      flame.visible = props.revealed
      innerFlame.visible = props.revealed
      const flicker = Math.sin(time * 12) * 0.08 + Math.cos(time * 24) * 0.04
      flame.scale.y = 1.8 + flicker
      flame.rotation.z = Math.sin(time * 5.2) * 0.06
      innerFlame.scale.y = 1.0 + flicker * 0.8
    }
    if (flameLight) {
      flameLight.intensity += ((props.revealed ? 5.2 : 0.2) - flameLight.intensity) * 0.04
      flameLight.intensity += Math.sin(time * 10) * 0.18
    }

    // Courtyard Diyas & String Lights
    const allLit = props.revealed || props.candlesLit
    smallFlames.forEach((smallFlame, index) => {
      smallFlame.visible = allLit
      smallFlame.scale.y = 1.7 + Math.sin(time * 8 + index) * 0.15
    })
    smallFlameLights.forEach((light) => {
      light.intensity += ((allLit ? 1.8 : 0) - light.intensity) * 0.04
      if (allLit) light.intensity += Math.sin(time * 9 + light.position.x) * 0.06
    })
    houseLights.forEach((light, index) => {
      light.intensity = 0.48 + Math.sin(time * 2.6 + index * 1.7) * 0.18
    })

    // Sparklers at sides
    sparklerEffects.forEach((effect, effectIndex) => {
      const isLit = props.revealed || props.candlesLit
      effect.visible = isLit
      if (effectIndex === 0) leftSparkler.visible = isLit
      if (effectIndex === 1) rightSparkler.visible = isLit
      const tip = effectIndex === 0 ? leftSparkler.children[1] : rightSparkler.children[1]
      if (tip) tip.visible = isLit
    })
    flowerpotEffects.forEach(({ effect, glow }) => {
      effect.visible = props.revealed
      glow.intensity += ((props.revealed ? 2.3 : 0) - glow.intensity) * 0.07
    })

    // Update Spark Effects
    sparkEffects.forEach((effect, effectIndex) => {
      const isLit = effectIndex < sparklerEffects.length
        ? props.revealed || props.candlesLit
        : props.revealed
      if (!isLit) return
      for (let point = 0; point < effect.velocities.length; point += 1) {
        const velocity = effect.velocities[point]
        if (!velocity) continue
        const phase = ((time + point * 0.037 + effectIndex * 0.23) % effect.lifetime)
        effect.positions.setXYZ(
          point,
          effect.origin.x + velocity.x * phase,
          effect.origin.y + velocity.y * phase - 1.9 * phase * phase,
          effect.origin.z + velocity.z * phase,
        )
      }
      effect.positions.needsUpdate = true
    })

    // Background lanterns sway
    lanterns.forEach((lantern) => {
      lantern.position.y = lantern.userData.baseY + Math.sin(time * 0.65 + lantern.userData.phase) * 0.42
    })
    bulbs.forEach((bulb, index) => {
      const material = bulb.material as THREE.MeshStandardMaterial
      material.emissiveIntensity = 0.95 + Math.sin(time * 2.8 + index * 0.32) * 0.3
    })

    // Update Ground Chakris
    for (let i = chakris.length - 1; i >= 0; i -= 1) {
      const ch = chakris[i]
      if (!ch) continue
      ch.age += delta
      const progress = ch.age / ch.duration
      if (progress >= 1) {
        activeScene.remove(ch.mesh)
        activeScene.remove(ch.light)
        activeScene.remove(ch.points)
        ch.points.geometry.dispose()
        disposeMaterials(ch.points.material)
        chakris.splice(i, 1)
        continue
      }
      // Rapid spin
      const spinSpeed = 35 * (1 - progress * 0.7)
      ch.mesh.rotation.y += spinSpeed * delta
      ch.light.intensity = 4.5 * (1 - progress) + Math.sin(time * 40) * 0.8

      // Tangential flying sparks
      const pos = ch.mesh.position
      for (let p = 0; p < ch.positions.count; p += 1) {
        const pPhase = ((time * 6 + p * 0.12) % 0.35)
        const angle = ch.mesh.rotation.y + (p / ch.positions.count) * Math.PI * 2
        const sparkRadius = 0.6 + pPhase * (4.5 + Math.random() * 1.5)
        ch.positions.setXYZ(
          p,
          pos.x + Math.cos(angle) * sparkRadius,
          pos.y + 0.05 + Math.sin(pPhase * Math.PI) * 0.45,
          pos.z + Math.sin(angle) * sparkRadius,
        )
      }
      ch.positions.needsUpdate = true
    }

    // Update Anars
    for (let i = anars.length - 1; i >= 0; i -= 1) {
      const an = anars[i]
      if (!an) continue
      an.age += delta
      const progress = an.age / an.duration
      if (progress >= 1) {
        activeScene.remove(an.mesh)
        activeScene.remove(an.light)
        activeScene.remove(an.points)
        an.points.geometry.dispose()
        disposeMaterials(an.points.material)
        anars.splice(i, 1)
        continue
      }
      an.light.intensity = 5.5 * (1 - progress) + Math.sin(time * 30) * 0.9
      const pos = an.mesh.position
      for (let p = 0; p < an.positions.count; p += 1) {
        const vel = an.velocities[p]
        if (!vel) continue
        const phase = ((time * 1.4 + p * 0.04) % 0.8)
        an.positions.setXYZ(
          p,
          pos.x + vel.x * phase,
          pos.y + 0.85 + vel.y * phase - 3.8 * phase * phase,
          pos.z + vel.z * phase,
        )
      }
      an.positions.needsUpdate = true
    }

    // Update Sky Lanterns
    for (let i = skyLanterns.length - 1; i >= 0; i -= 1) {
      const sl = skyLanterns[i]
      if (!sl) continue
      sl.age += delta
      sl.mesh.position.x += sl.vx * delta + Math.sin(time * 0.8 + sl.swayPhase) * 0.02
      sl.mesh.position.y += sl.vy * delta
      sl.mesh.position.z += sl.vz * delta
      sl.mesh.rotation.z = Math.sin(time * 0.9 + sl.swayPhase) * 0.08
      sl.light.position.copy(sl.mesh.position)

      if (sl.mesh.position.y > 45 || sl.age > 30) {
        activeScene.remove(sl.mesh)
        activeScene.remove(sl.light)
        skyLanterns.splice(i, 1)
      }
    }

    // Update Ladi Firecrackers
    for (let i = ladis.length - 1; i >= 0; i -= 1) {
      const ld = ladis[i]
      if (!ld) continue
      ld.age += delta
      const currentPop = Math.floor(ld.age / 0.09)
      if (currentPop > ld.lastPopIndex && currentPop < 18) {
        ld.lastPopIndex = currentPop
        emit('cracker')
        const tube = ld.group.children[currentPop] as THREE.Mesh | undefined
        if (tube) {
          tube.visible = false
          const pMat = ld.sparks.material as THREE.PointsMaterial
          pMat.opacity = 1
          const tubePos = tube.position
          for (let p = 0; p < ld.positions.count; p += 1) {
            ld.positions.setXYZ(
              p,
              tubePos.x + (Math.random() - 0.5) * 0.9,
              tubePos.y + 0.1 + Math.random() * 0.7,
              tubePos.z + (Math.random() - 0.5) * 0.9,
            )
          }
          ld.positions.needsUpdate = true
        }
      }
      if (ld.age > 2.0) {
        activeScene.remove(ld.group)
        activeScene.remove(ld.sparks)
        ld.sparks.geometry.dispose()
        disposeMaterials(ld.sparks.material)
        ladis.splice(i, 1)
      }
    }

    // Flower Shower Petals
    if (props.flowerShower || props.aartiActive) {
      petalSpawnTimer += delta
      if (petalSpawnTimer > 0.08 && flowerPetals.length < 120) {
        spawnPetal()
        petalSpawnTimer = 0
      }
    }
    for (let i = flowerPetals.length - 1; i >= 0; i -= 1) {
      const pt = flowerPetals[i]
      if (!pt) continue
      pt.mesh.position.addScaledVector(pt.velocity, delta)
      pt.mesh.rotation.x += pt.rotSpeed.x * delta
      pt.mesh.rotation.y += pt.rotSpeed.y * delta
      pt.mesh.rotation.z += pt.rotSpeed.z * delta

      if (pt.mesh.position.y <= 0.02) {
        activeScene.remove(pt.mesh)
        pt.mesh.geometry.dispose()
        disposeMaterials(pt.mesh.material)
        flowerPetals.splice(i, 1)
      }
    }

    // Update Firework Rockets and Explosions
    for (let index = fireworks.length - 1; index >= 0; index -= 1) {
      const burst = fireworks[index]
      if (!burst) continue
      burst.age += delta
      if (!burst.exploded) {
        const launchProgress = Math.min(burst.age / 0.72, 1)
        const easedProgress = 1 - (1 - launchProgress) ** 2
        const rocketY = 1 + (burst.targetY - 1) * easedProgress
        burst.rocket.position.set(burst.x, rocketY, burst.z)
        const trailPositions = burst.trail.geometry.attributes.position
        if (trailPositions) {
          trailPositions.setXYZ(0, burst.x, Math.max(0.3, rocketY - 1.25), burst.z)
          trailPositions.setXYZ(1, burst.x, rocketY, burst.z)
          trailPositions.needsUpdate = true
        }
        if (launchProgress >= 1) {
          burst.exploded = true
          burst.rocket.visible = false
          burst.trail.visible = false
          burst.points.visible = true
          for (let point = 0; point < burst.positionAttribute.count; point += 1) {
            burst.positionAttribute.setXYZ(point, burst.x, burst.targetY, burst.z)
          }
          burst.positionAttribute.needsUpdate = true
          emit('cracker')
        }
        continue
      }
      for (let point = 0; point < burst.velocities.length; point += 1) {
        const velocity = burst.velocities[point]
        if (!velocity) continue
        burst.positionAttribute.setXYZ(
          point,
          burst.positionAttribute.getX(point) + velocity.x * delta,
          burst.positionAttribute.getY(point) + velocity.y * delta,
          burst.positionAttribute.getZ(point) + velocity.z * delta,
        )
        velocity.y -= 2.8 * delta
      }
      burst.positionAttribute.needsUpdate = true
      const fireworkMaterial = burst.points.material as THREE.PointsMaterial
      const explosionAge = burst.age - 0.72
      fireworkMaterial.opacity = Math.max(0, 1 - explosionAge / 2.5)
      if (explosionAge >= 2.5) {
        removeFirework(index)
      }
    }

    renderer?.render(activeScene, camera)
  }
  render()

  // Watch for theme changes
  watch(() => props.theme, (newTheme) => {
    updateRangoliColors(newTheme)
  })

  resizeObserver = new ResizeObserver(() => {
    if (!renderer || !activeCamera) return
    const width = container.clientWidth
    const height = container.clientHeight
    activeCamera.aspect = width / Math.max(height, 1)
    activeCamera.updateProjectionMatrix()
    renderer.setSize(width, height)
  })
  resizeObserver.observe(container)
})

onBeforeUnmount(() => {
  window.cancelAnimationFrame(frame)
  resizeObserver?.disconnect()
  scene?.traverse((object) => {
    if (object instanceof THREE.Mesh || object instanceof THREE.Points || object instanceof THREE.Line) {
      object.geometry.dispose()
      disposeMaterials(object.material)
    }
  })
  renderer?.dispose()
  const container = host.value
  if (renderer && container && renderer.domElement.parentElement === container) {
    container.removeChild(renderer.domElement)
  }
})
</script>

<template>
  <div ref="host" class="scene-canvas" aria-hidden="true" />
</template>
