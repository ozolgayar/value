/** Look settings for the GEROPHARM strategy house 3D. Tune here only. */
export const HOUSE_LOOK = {
  background: '#f4f8fd',

  renderer: {
    /** Start darker; rises with floor progress (see exposureStart/End) */
    toneMappingExposure: 0.9,
    exposureStart: 0.86,
    exposureEnd: 1.16,
    maxPixelRatio: 2,
  },

  lights: {
    hemi: {
      sky: '#fff3e0',
      ground: '#b8a890',
      intensity: 1.05,
      intensityStart: 1.0,
      intensityEnd: 1.4,
    },
    key: {
      color: '#ffd7a0',
      intensity: 1.15,
      intensityStart: 1.1,
      intensityEnd: 1.55,
      position: [-8, 18, 16] as const,
    },
    fill: {
      color: '#e8d5c4',
      intensity: 0.45,
      position: [14, 9, -6] as const,
    },
    bounce: {
      color: '#ffcc88',
      intensity: 0.32,
      position: [2, 4, 16] as const,
    },
    /** Warm niche accents — soft; progress boosts them gently */
    niche: {
      color: '#ffb86a',
      intensityIdle: 0.35,
      intensityComplete: 0.95,
      distance: 5.5,
      decay: 2,
    },
    section: {
      /** Amber warmth, not a bright white flash */
      color: '#ffb060',
      distance: 8.5,
      decay: 2,
      idleIntensity: 0.04,
      completeIntensity: 1.55,
      activeIntensity: 0.85,
    },
  },

  shadows: {
    enabled: true,
    mapSizeDesktop: 1536,
    mapSizeMobile: 768,
    cameraSize: 22,
    bias: -0.00015,
    normalBias: 0.035,
    radius: 3.8,
  },

  palette: {
    cream: '#fbf1dc',
    peach: '#f4a66c',
    orange: '#f58257',
    glass: '#18c8b0',
    teal: '#0b8f7a',
    green: '#1fa85c',
    base: '#b7c6d0',
    metal: '#a8b5b8',
  } as Record<string, string>,

  highlight: {
    /** Incomplete floors stay dim; completed lift gently with warm emissive */
    dimScale: 0.74,
    activeScale: 0.92,
    completeScale: 1.05,
    textScale: 1,
    emissive: {
      glass: { r: 0.28, g: 0.48, b: 0.34 },
      glassIdle: 0.08,
      glassActive: 0.2,
      glassComplete: 0.34,
      /** Stronger warm bias, lower intensity than prior “bright” pass */
      facade: { r: 0.48, g: 0.28, b: 0.1 },
      facadeIdle: 0,
      facadeActive: 0.045,
      facadeComplete: 0.085,
    },
  },
} as const

export type HouseLook = typeof HOUSE_LOOK
