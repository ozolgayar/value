import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { asset } from '../asset'
import { HOUSE_LOOK } from '../data/house3dLook'

export type HouseSectionId =
  | 'foundation'
  | 'floor1'
  | 'floor2'
  | 'floor3'
  | 'floor4'
  | 'mission'

export type MarkerScreenPos = {
  id: HouseSectionId
  x: number
  y: number
  visible: boolean
}

type MeshUserData = {
  sectionId?: string
  baseColor?: THREE.Color
  role?: string
}

const LOOK = HOUSE_LOOK
const MODEL_URL = asset('house/geropharm-house-uv-fixed.glb') + '?v=f3fin2'

/**
 * UV-fixed GLB is standard Y-up; front facade faces +Z.
 * Camera: front-right three-quarter close to reference photo 3.
 */
export const HOUSE_MARKER_ANCHORS: {
  id: HouseSectionId
  position: [number, number, number]
}[] = [
  // Offset to the right so markers don't cover facade text.
  { id: 'foundation', position: [6.8, 0.7, 4.2] },
  { id: 'floor1', position: [6.6, 2.1, 3.4] },
  { id: 'floor2', position: [6.4, 4.2, 3.2] },
  { id: 'floor3', position: [5.2, 6.4, 2.4] },
  { id: 'floor4', position: [3.6, 8.5, 2.0] },
  { id: 'mission', position: [3.8, 9.7, 2.2] },
]

function isMobileViewport() {
  return window.matchMedia('(max-width: 900px), (pointer: coarse)').matches
}

function applyPaletteMaterial(
  material: THREE.MeshStandardMaterial,
  role: string,
) {
  // Keep authored facade colors/textures; tune glass + niche glow only.
  if (role === 'text') return

  if (role === 'niche_light') {
    material.emissive.copy(material.color)
    material.emissiveIntensity = LOOK.lights.niche.intensityIdle
    material.metalness = 0
    material.roughness = 0.55
    material.needsUpdate = true
    return
  }

  if (role === 'glass') {
    const { glass } = LOOK.highlight.emissive
    material.emissive.setRGB(glass.r, glass.g, glass.b)
    material.emissiveIntensity = LOOK.highlight.emissive.glassIdle
    material.metalness = Math.min(material.metalness, 0.08)
    material.roughness = Math.min(material.roughness, 0.45)
    material.transparent = true
    material.opacity = Math.min(material.opacity, 0.9)
    material.needsUpdate = true
    return
  }

  // Plaster / slabs: force authored look palette + matte.
  if (role in LOOK.palette) {
    material.color.set(LOOK.palette[role])
    material.metalness = 0
    material.roughness = Math.max(material.roughness, 0.75)
  } else if (
    role === 'cream' ||
    role === 'cream2' ||
    role === 'fascia' ||
    role === 'peach' ||
    role === 'peach2' ||
    role === 'rim' ||
    role === 'base' ||
    role === 'deck' ||
    role === 'deck2' ||
    role === 'frame'
  ) {
    material.metalness = 0
    material.roughness = Math.max(material.roughness, 0.72)
  }

  material.emissive.setRGB(0, 0, 0)
  material.emissiveIntensity = 0
  material.needsUpdate = true
}

type House3DCanvasProps = {
  selected: HouseSectionId | null
  completed: ReadonlySet<string>
  sectionIds: readonly string[]
  onSelect: (id: HouseSectionId) => void
  onMarkersUpdate?: (markers: MarkerScreenPos[]) => void
  onReady?: () => void
  onError?: (message: string) => void
  className?: string
}

export function House3DCanvas({
  selected,
  completed,
  sectionIds,
  onSelect,
  onMarkersUpdate,
  onReady,
  onError,
  className,
}: House3DCanvasProps) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const selectedRef = useRef(selected)
  const completedRef = useRef(completed)
  const onSelectRef = useRef(onSelect)
  const onMarkersUpdateRef = useRef(onMarkersUpdate)
  const onReadyRef = useRef(onReady)
  const onErrorRef = useRef(onError)

  selectedRef.current = selected
  completedRef.current = completed
  onSelectRef.current = onSelect
  onMarkersUpdateRef.current = onMarkersUpdate
  onReadyRef.current = onReady
  onErrorRef.current = onError

  useEffect(() => {
    const container = viewportRef.current
    if (!container) return

    let disposed = false
    let frame = 0
    const meshes: THREE.Mesh[] = []
    const lights = new Map<string, THREE.PointLight>()
    const scratch = new THREE.Color()
    const projected = new THREE.Vector3()

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(LOOK.background)

    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 120)
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, LOOK.renderer.maxPixelRatio),
    )
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = LOOK.renderer.toneMappingExposure
    renderer.shadowMap.enabled = LOOK.shadows.enabled
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    container.appendChild(renderer.domElement)

    const controls = new OrbitControls(camera, renderer.domElement)
    // Front-right three-quarter closer to reference photo 3 (less top-down).
    controls.target.set(0, 5.0, 0.4)
    camera.position.set(18, 13.5, 26)
    controls.enableDamping = true
    controls.enablePan = false
    controls.enableZoom = true
    controls.zoomSpeed = 0.85
    controls.minDistance = 12
    controls.maxDistance = 52
    controls.minPolarAngle = 0.95
    controls.maxPolarAngle = 1.42
    controls.minAzimuthAngle = -0.12
    controls.maxAzimuthAngle = 0.78
    controls.update()
    controls.saveState()

    const blockPageScroll = (e: WheelEvent) => {
      e.preventDefault()
    }
    renderer.domElement.addEventListener('wheel', blockPageScroll, {
      passive: false,
    })

    const hemi = new THREE.HemisphereLight(
      LOOK.lights.hemi.sky,
      LOOK.lights.hemi.ground,
      LOOK.lights.hemi.intensityStart,
    )
    scene.add(hemi)

    const key = new THREE.DirectionalLight(
      LOOK.lights.key.color,
      LOOK.lights.key.intensityStart,
    )
    key.position.set(...LOOK.lights.key.position)
    if (LOOK.shadows.enabled) {
      const mapSize = isMobileViewport()
        ? LOOK.shadows.mapSizeMobile
        : LOOK.shadows.mapSizeDesktop
      key.castShadow = true
      key.shadow.mapSize.set(mapSize, mapSize)
      key.shadow.bias = LOOK.shadows.bias
      key.shadow.normalBias = LOOK.shadows.normalBias
      key.shadow.radius = LOOK.shadows.radius
      const cam = key.shadow.camera
      const extent = LOOK.shadows.cameraSize
      cam.left = -extent
      cam.right = extent
      cam.top = extent
      cam.bottom = -extent
      cam.near = 2
      cam.far = 55
      cam.updateProjectionMatrix()
    }
    scene.add(key)

    const fill = new THREE.DirectionalLight(
      LOOK.lights.fill.color,
      LOOK.lights.fill.intensity,
    )
    fill.position.set(...LOOK.lights.fill.position)
    scene.add(fill)

    const bounce = new THREE.DirectionalLight(
      LOOK.lights.bounce.color,
      LOOK.lights.bounce.intensity,
    )
    bounce.position.set(...LOOK.lights.bounce.position)
    scene.add(bounce)

    const raycaster = new THREE.Raycaster()
    const pointer = new THREE.Vector2()
    let pointerDown: [number, number] | null = null

    const onPointerDown = (e: PointerEvent) => {
      pointerDown = [e.clientX, e.clientY]
    }
    const onPointerUp = (e: PointerEvent) => {
      if (
        !pointerDown ||
        Math.hypot(e.clientX - pointerDown[0], e.clientY - pointerDown[1]) > 6
      ) {
        pointerDown = null
        return
      }
      pointerDown = null
      const rect = renderer.domElement.getBoundingClientRect()
      pointer.set(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1,
      )
      raycaster.setFromCamera(pointer, camera)
      const hit = raycaster.intersectObjects(meshes, false)[0]
      const id = hit?.object.userData.sectionId as HouseSectionId | undefined
      if (id) onSelectRef.current(id)
    }
    const onPointerCancel = () => {
      pointerDown = null
    }

    renderer.domElement.addEventListener('pointerdown', onPointerDown)
    renderer.domElement.addEventListener('pointerup', onPointerUp)
    renderer.domElement.addEventListener('pointercancel', onPointerCancel)

    const resize = () => {
      const w = container.clientWidth
      const h = container.clientHeight
      if (w <= 0 || h <= 0) return
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.fov = w / h < 0.8 ? 50 : 36
      camera.updateProjectionMatrix()
    }
    const ro = new ResizeObserver(resize)
    ro.observe(container)
    resize()

    const clock = new THREE.Clock()
    const hl = LOOK.highlight
    const em = hl.emissive

    const publishMarkers = () => {
      const cb = onMarkersUpdateRef.current
      if (!cb) return
      const width = container.clientWidth
      const height = container.clientHeight
      cb(
        HOUSE_MARKER_ANCHORS.map(({ id, position }) => {
          projected.set(...position).project(camera)
          const visible =
            projected.z > -1 &&
            projected.z < 1 &&
            Math.abs(projected.x) <= 1.15 &&
            Math.abs(projected.y) <= 1.15
          return {
            id,
            x: (projected.x * 0.5 + 0.5) * width - 100,
            y: (-projected.y * 0.5 + 0.5) * height,
            visible,
          }
        }),
      )
    }

    const animate = () => {
      frame = requestAnimationFrame(animate)
      const dt = Math.min(clock.getDelta(), 0.05)
      const t = 1 - Math.exp(-dt * 6)
      controls.update()

      const currentSelected = selectedRef.current
      const currentDone = completedRef.current
      const progress =
        sectionIds.length > 0 ? currentDone.size / sectionIds.length : 0

      const exposureTarget = THREE.MathUtils.lerp(
        LOOK.renderer.exposureStart,
        LOOK.renderer.exposureEnd,
        progress,
      )
      renderer.toneMappingExposure = THREE.MathUtils.lerp(
        renderer.toneMappingExposure,
        exposureTarget,
        t,
      )
      hemi.intensity = THREE.MathUtils.lerp(
        hemi.intensity,
        THREE.MathUtils.lerp(
          LOOK.lights.hemi.intensityStart,
          LOOK.lights.hemi.intensityEnd,
          progress,
        ),
        t,
      )
      key.intensity = THREE.MathUtils.lerp(
        key.intensity,
        THREE.MathUtils.lerp(
          LOOK.lights.key.intensityStart,
          LOOK.lights.key.intensityEnd,
          progress,
        ),
        t,
      )

      for (const mesh of meshes) {
        const data = mesh.userData as MeshUserData
        const id = data.sectionId
        if (!id || !data.baseColor) continue
        if (!(mesh.material instanceof THREE.MeshStandardMaterial)) continue

        const role = data.role || ''
        const material = mesh.material
        const complete = currentDone.has(id)
        const active = currentSelected === id

        if (role === 'text') continue

        if (role === 'niche_light') {
          material.emissive.copy(data.baseColor)
          const target = complete
            ? LOOK.lights.niche.intensityComplete
            : LOOK.lights.niche.intensityIdle
          material.emissiveIntensity = THREE.MathUtils.lerp(
            material.emissiveIntensity,
            target,
            t,
          )
          continue
        }

        const scale = complete
          ? hl.completeScale
          : active
            ? hl.activeScale
            : hl.dimScale
        scratch.copy(data.baseColor).multiplyScalar(scale)
        material.color.lerp(scratch, t)

        if (role === 'glass') {
          material.emissive.setRGB(em.glass.r, em.glass.g, em.glass.b)
          const target = complete
            ? em.glassComplete
            : active
              ? em.glassActive
              : em.glassIdle
          material.emissiveIntensity = THREE.MathUtils.lerp(
            material.emissiveIntensity,
            target,
            t,
          )
        } else {
          material.emissive.setRGB(em.facade.r, em.facade.g, em.facade.b)
          const target = complete
            ? em.facadeComplete
            : active
              ? em.facadeActive
              : em.facadeIdle
          material.emissiveIntensity = THREE.MathUtils.lerp(
            material.emissiveIntensity,
            target,
            t,
          )
        }
      }

      for (const [id, light] of lights) {
        if (id === '__niche') {
          const anyDone = [...currentDone].length > 0
          const target = anyDone
            ? LOOK.lights.niche.intensityComplete
            : LOOK.lights.niche.intensityIdle
          light.intensity = THREE.MathUtils.lerp(light.intensity, target, t)
          continue
        }
        const target = currentDone.has(id)
          ? LOOK.lights.section.completeIntensity
          : currentSelected === id
            ? LOOK.lights.section.activeIntensity
            : LOOK.lights.section.idleIntensity
        light.intensity = THREE.MathUtils.lerp(light.intensity, target, t)
      }

      publishMarkers()
      renderer.render(scene, camera)
    }

    void (async () => {
      try {
        const gltf = await new GLTFLoader().loadAsync(MODEL_URL)
        if (disposed) return

        scene.add(gltf.scene)
        gltf.scene.updateMatrixWorld(true)

        gltf.scene.traverse((obj) => {
          if (!(obj instanceof THREE.Mesh)) return

          const sectionId =
            (obj.userData.sectionId as string | undefined) ||
            ((obj.material as THREE.Material | undefined)?.userData
              ?.sectionId as string | undefined)

          const sourceMat = obj.material
          const material = (
            Array.isArray(sourceMat) ? sourceMat[0] : sourceMat
          ).clone() as THREE.Material
          obj.material = material

          if (LOOK.shadows.enabled) {
            obj.castShadow = true
            obj.receiveShadow = true
          }

          if (!(material instanceof THREE.MeshStandardMaterial)) return

          const maxAniso = renderer.capabilities.getMaxAnisotropy()
          if (material.map) {
            material.map.anisotropy = Math.min(16, maxAniso)
            material.map.generateMipmaps = true
            material.map.minFilter = THREE.LinearMipmapLinearFilter
            material.map.magFilter = THREE.LinearFilter
            material.map.needsUpdate = true
          }

          const role =
            (material.userData.role as string | undefined) ||
            (obj.userData.role as string | undefined) ||
            ''

          if (role === 'text' && material.map) {
            const basic = new THREE.MeshBasicMaterial({
              map: material.map,
              transparent: material.transparent,
              toneMapped: false,
            })
            material.dispose()
            obj.material = basic
            ;(obj.userData as MeshUserData).role = 'text'
            ;(obj.userData as MeshUserData).baseColor = new THREE.Color(0xffffff)
            if (sectionId) {
              ;(obj.userData as MeshUserData).sectionId = sectionId
            }
            if (sectionId && sectionIds.includes(sectionId)) {
              meshes.push(obj)
            }
            return
          }

          applyPaletteMaterial(material, role)

          ;(obj.userData as MeshUserData).role = role
          ;(obj.userData as MeshUserData).baseColor = material.color.clone()
          if (sectionId) {
            ;(obj.userData as MeshUserData).sectionId = sectionId
          }

          if (sectionId && sectionIds.includes(sectionId)) {
            meshes.push(obj)
          }
        })

        const sectionHeights = [0.8, 2.2, 4.5, 6.7, 8.8, 10.3]
        for (let i = 0; i < sectionIds.length; i++) {
          const light = new THREE.PointLight(
            LOOK.lights.section.color,
            LOOK.lights.section.idleIntensity,
            LOOK.lights.section.distance,
            LOOK.lights.section.decay,
          )
          light.position.set(0, sectionHeights[i] ?? 6, 3.6)
          scene.add(light)
          lights.set(sectionIds[i], light)
        }

        // Warm production-niche accents (always on; progress boosts via materials).
        const nicheGlow = new THREE.PointLight(
          LOOK.lights.niche.color,
          LOOK.lights.niche.intensityIdle,
          LOOK.lights.niche.distance,
          LOOK.lights.niche.decay,
        )
        nicheGlow.position.set(-1.2, 4.3, 3.4)
        scene.add(nicheGlow)
        lights.set('__niche', nicheGlow)

        onReadyRef.current?.()
        animate()
      } catch (err) {
        console.error(err)
        if (!disposed) {
          onErrorRef.current?.(
            'Не удалось загрузить 3D-модель дома. Проверьте /public/house.',
          )
        }
      }
    })()

    return () => {
      disposed = true
      cancelAnimationFrame(frame)
      ro.disconnect()
      renderer.domElement.removeEventListener('pointerdown', onPointerDown)
      renderer.domElement.removeEventListener('pointerup', onPointerUp)
      renderer.domElement.removeEventListener('pointercancel', onPointerCancel)
      renderer.domElement.removeEventListener('wheel', blockPageScroll)
      controls.dispose()
      renderer.dispose()
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement)
      }
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose()
          const mat = obj.material
          if (Array.isArray(mat)) mat.forEach((m) => m.dispose())
          else mat.dispose()
        }
      })
    }
  }, [sectionIds])

  return <div className={className} ref={viewportRef} />
}
