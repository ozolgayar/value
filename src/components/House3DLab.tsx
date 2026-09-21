import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { asset } from '../asset'
import { HOUSE_LOOK } from '../data/house3dLook'
import '../styles/house-3d-lab.css'

type HouseSection = {
  id: string
  title: string
  items: string[]
}

type MeshUserData = {
  sectionId?: string
  baseColor?: THREE.Color
  role?: string
}

const MODEL_URL = asset('house/geropharm-house-uv-fixed.glb') + '?v=f3fin2'
const SECTIONS_URL = asset('house/sections.json')
const STORAGE_KEY = 'geropharm-house3d-lab-progress'
const LOOK = HOUSE_LOOK

function isMobileViewport() {
  return window.matchMedia('(max-width: 900px), (pointer: coarse)').matches
}

function applyPaletteMaterial(material: THREE.MeshStandardMaterial, role: string) {
  if (role === 'text') return

  const hex = LOOK.palette[role]
  if (hex) {
    material.color.set(hex)
  }

  if (role === 'glass') {
    const { glass } = LOOK.highlight.emissive
    material.emissive.setRGB(glass.r, glass.g, glass.b)
    material.emissiveIntensity = LOOK.highlight.emissive.glassIdle
    material.metalness = Math.min(material.metalness, 0.08)
    material.roughness = Math.min(material.roughness, 0.45)
    material.transparent = true
    material.opacity = Math.min(material.opacity, 0.92)
  } else {
    material.emissive.setRGB(0, 0, 0)
    material.emissiveIntensity = 0
  }

  material.needsUpdate = true
}

export function House3DLab() {
  const viewportRef = useRef<HTMLDivElement>(null)
  const [sections, setSections] = useState<HouseSection[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [done, setDone] = useState<Set<string>>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
      return Array.isArray(saved) ? new Set(saved as string[]) : new Set()
    } catch {
      return new Set()
    }
  })
  const [loading, setLoading] = useState('Загрузка модели…')
  const [error, setError] = useState<string | null>(null)

  const selectedRef = useRef<string | null>(null)
  const doneRef = useRef(done)
  const selectRef = useRef<(id: string) => void>(() => {})
  const resetViewRef = useRef<() => void>(() => {})

  selectedRef.current = selected
  doneRef.current = done

  const activeSection = sections.find((s) => s.id === selected) ?? null

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...done]))
    } catch {
      /* ignore */
    }
  }, [done])

  useEffect(() => {
    const container = viewportRef.current
    if (!container) return

    let disposed = false
    let frame = 0
    const meshes: THREE.Mesh[] = []
    const lights = new Map<string, THREE.PointLight>()
    const scratch = new THREE.Color()

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
    controls.target.set(0, 6, 0)
    camera.position.set(19, 17, 30)
    controls.enableDamping = true
    controls.enablePan = false
    controls.minDistance = 12
    controls.maxDistance = 52
    controls.minPolarAngle = 0.85
    controls.maxPolarAngle = 1.48
    controls.minAzimuthAngle = -0.18
    controls.maxAzimuthAngle = 0.85
    controls.update()
    controls.saveState()
    resetViewRef.current = () => controls.reset()

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
      const id = hit?.object.userData.sectionId as string | undefined
      if (id) selectRef.current(id)
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

    const animate = () => {
      frame = requestAnimationFrame(animate)
      const dt = Math.min(clock.getDelta(), 0.05)
      const t = 1 - Math.exp(-dt * 6)
      controls.update()

      const currentSelected = selectedRef.current
      const currentDone = doneRef.current
      const totalSections = Math.max(1, sections.length || 6)
      const progress = currentDone.size / totalSections

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

        const role = data.role || ''
        const material = mesh.material as THREE.MeshStandardMaterial
        const complete = currentDone.has(id)
        const active = currentSelected === id

        if (role === 'text') {
          material.color.copy(data.baseColor)
          material.emissive.setRGB(0, 0, 0)
          material.emissiveIntensity = 0
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
        const target = currentDone.has(id)
          ? LOOK.lights.section.completeIntensity
          : currentSelected === id
            ? LOOK.lights.section.activeIntensity
            : 0
        light.intensity = THREE.MathUtils.lerp(light.intensity, target, t)
      }

      renderer.render(scene, camera)
    }

    void (async () => {
      try {
        const response = await fetch(SECTIONS_URL)
        if (!response.ok) throw new Error('Не загружен sections.json')
        const loaded = (await response.json()) as HouseSection[]
        if (disposed) return

        setSections(loaded)
        setDone((prev) => {
          const next = new Set(
            [...prev].filter((id) => loaded.some((s) => s.id === id)),
          )
          return next
        })

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

          const role =
            (material.userData.role as string | undefined) ||
            (obj.userData.role as string | undefined) ||
            ''

          applyPaletteMaterial(material, role)

          ;(obj.userData as MeshUserData).role = role
          ;(obj.userData as MeshUserData).baseColor = material.color.clone()
          if (sectionId) {
            ;(obj.userData as MeshUserData).sectionId = sectionId
          }

          if (sectionId && loaded.some((s) => s.id === sectionId)) {
            meshes.push(obj)
          }
        })

        for (let i = 0; i < loaded.length; i++) {
          const light = new THREE.PointLight(
            LOOK.lights.section.color,
            0,
            LOOK.lights.section.distance,
            LOOK.lights.section.decay,
          )
          light.position.set(0, i === 0 ? 1 : i === 5 ? 12 : 1 + i * 2.75, 3.8)
          scene.add(light)
          lights.set(loaded[i].id, light)
        }

        setLoading('')
        animate()
      } catch (err) {
        console.error(err)
        if (!disposed) {
          setError(
            'Не удалось загрузить модель. Проверьте /public/house и консоль.',
          )
          setLoading('')
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
  }, [])

  useEffect(() => {
    selectRef.current = (id: string) => {
      if (!sections.some((s) => s.id === id)) return
      setSelected(id)
    }
  }, [sections])

  const toggleDone = () => {
    if (!selected) return
    setDone((prev) => {
      const next = new Set(prev)
      if (next.has(selected)) next.delete(selected)
      else next.add(selected)
      return next
    })
  }

  const resetProgress = () => {
    setDone(new Set())
  }

  return (
    <section className="house-lab" aria-label="Тест 3D-дома">
      <header className="house-lab__header">
        <div>
          <p className="house-lab__eyebrow">Тестовая страница · ?house3d</p>
          <h1 className="house-lab__title">Стратегия ГЕРОФАРМ 2030 — 3D дом</h1>
        </div>
        <p className="house-lab__progress">
          Пройдено {done.size} из {sections.length || 6}
        </p>
      </header>

      <div className="house-lab__viewport" ref={viewportRef} />

      {loading ? (
        <div className="house-lab__loading" role="status">
          {loading}
        </div>
      ) : null}
      {error ? (
        <div className="house-lab__loading" role="alert">
          {error}
        </div>
      ) : null}

      {activeSection ? (
        <aside className="house-lab__card">
          <button
            type="button"
            className="house-lab__card-close"
            aria-label="Закрыть"
            onClick={() => setSelected(null)}
          >
            ×
          </button>
          <p className="house-lab__card-status">
            {done.has(activeSection.id)
              ? 'РАЗДЕЛ ПРОЙДЕН'
              : 'ЗНАКОМСТВО С РАЗДЕЛОМ'}
          </p>
          <h2 className="house-lab__card-title">{activeSection.title}</h2>
          <div className="house-lab__card-text">
            {activeSection.items.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </div>
          <button
            type="button"
            className="house-lab__complete"
            onClick={toggleDone}
          >
            {done.has(activeSection.id)
              ? 'Снять отметку о прохождении'
              : 'Отметить пройденным'}
          </button>
        </aside>
      ) : null}

      <nav className="house-lab__nav" aria-label="Разделы дома">
        {sections.map((section) => (
          <button
            key={section.id}
            type="button"
            className={`house-lab__nav-btn${
              selected === section.id ? ' is-active' : ''
            }${done.has(section.id) ? ' is-done' : ''}`}
            aria-pressed={selected === section.id}
            onClick={() => setSelected(section.id)}
          >
            {section.title}
          </button>
        ))}
      </nav>

      <footer className="house-lab__footer">
        <button type="button" onClick={() => resetViewRef.current()}>
          Сбросить камеру
        </button>
        <button type="button" onClick={resetProgress}>
          Сбросить прогресс
        </button>
        <span>Клик по этажу или кнопке · вращение мышью</span>
      </footer>
    </section>
  )
}
