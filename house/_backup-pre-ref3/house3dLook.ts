/** Look settings for the GEROPHARM strategy house 3D. Tune here only. */
export const HOUSE_LOOK = {
  background: '#f4f8fd',

  renderer: {
    /** Soft ACES — keep cream/peach from clipping while staying bright */
    toneMappingExposure: 1.02,
    maxPixelRatio: 2,
  },

  lights: {
    hemi: {
      sky: '#fff7eb',
      ground: '#9aada6',
      intensity: 1.05,
    },
    key: {
      color: '#ffe9cf',
      intensity: 1.35,
      position: [-9, 20, 14] as const,
    },
    fill: {
      color: '#c5ddd6',
      intensity: 0.45,
      position: [12, 7, -9] as const,
    },
    bounce: {
      color: '#f5e2c8',
      intensity: 0.28,
      position: [4, 3, 14] as const,
    },
    section: {
      color: '#ffe0ad',
      distance: 7.5,
      decay: 2,
      completeIntensity: 1.55,
      activeIntensity: 0.55,
    },
  },

  shadows: {
    enabled: true,
    mapSizeDesktop: 1536,
    mapSizeMobile: 768,
    cameraSize: 22,
    bias: -0.00015,
    normalBias: 0.035,
    radius: 3.2,
  },

  /**
   * Runtime remap by `material.userData.role`.
   * Keep in sync with house/build_model.py palette (light reference look).
   */
  palette: {
    cream: '#f1e4cf',
    peach: '#f5bc8c',
    orange: '#f29e61',
    glass: '#2ec4b6',
    teal: '#2e9e8e',
    green: '#388568',
    base: '#ccd2d9',
    metal: '#b7c0c3',
  } as Record<string, string>,

  highlight: {
    /** House stays pleasant at 0 progress — only a light dim on idle floors */
    dimScale: 0.97,
    activeScale: 1,
    completeScale: 1.01,
    textScale: 1,
    emissive: {
      glass: { r: 0.08, g: 0.55, b: 0.5 },
      glassIdle: 0.1,
      glassActive: 0.26,
      glassComplete: 0.42,
      facade: { r: 0.12, g: 0.18, b: 0.14 },
      facadeIdle: 0,
      facadeActive: 0.006,
      facadeComplete: 0.01,
    },
  },
} as const

export type HouseLook = typeof HOUSE_LOOK
