export type LocaleStrings = {
  preloader: {
    loading: string
    chooseLang: string
    ru: string
    en: string
  }
  nav: {
    sequence: string
    editorial: string
    archive: string
    portfolio: string
    contact: string
    book: string
    menu: string
    closeMenu: string
    openMenu: string
  }
  hero: {
    tagline: string
    label: string
    labelMeta: string
    scroll: string
    alt: string
  }
  storyboard: {
    rec: string
    frames: string
    hudTitle: string
    chapters: { no: string; title: string; text: string }[]
  }
  editorial: {
    manifestoLabel: string
    manifestoFelt: string
    manifestoBlur: string
    tags: string[]
    closeUp: string
    up: string
    reelLabel: string
    loop: string
    sequence: string
    justForYou: string
    caption: string
    copyright: string
  }
  tunnel: {
    label: string
    depth: string
    walk: string
    archive: string
    outro: string
  }
  gallery: {
    selected: string
    stills: string
    meta: string
    hover: string
  }
  albums: {
    port: string
    folio: string
    assets: string
    open: string
    empty: string
    tests: string
    photoshoots: string
    shows: string
    backstage: string
    clips: string
  }
  albumPage: {
    back: string
    portfolio: string
    frame: string
    frames: string
    comingSoon: string
    clip: string
    closeLightbox: string
    closeVideo: string
    photo: string
  }
  footer: {
    nextFrame: string
    bookHer: string
    published: string
    rights: string
    madeBy: string
  }
  notFound: {
    code: string
    title: string
    text: string
    back: string
  }
  app: {
    loading: string
  }
  seo: {
    title: string
    description: string
    ogLocale: string
  }
}

export const en: LocaleStrings = {
  preloader: {
    loading: 'LOADING SEQUENCE',
    chooseLang: 'CHOOSE LANGUAGE',
    ru: 'РУССКИЙ',
    en: 'ENGLISH',
  },
  nav: {
    sequence: 'SEQUENCE',
    editorial: 'EDITORIAL',
    archive: 'ARCHIVE',
    portfolio: 'PORTFOLIO',
    contact: 'CONTACT',
    book: 'BOOK',
    menu: 'MENU',
    closeMenu: 'Close menu',
    openMenu: 'Open menu',
  },
  hero: {
    tagline: 'in motion, out of focus',
    label: 'MOB JOURNAL — VOL.13',
    labelMeta: 'SHUTTER 1/15 · NO FLASH',
    scroll: 'SCROLL TO ENTER THE SEQUENCE ↓',
    alt: 'Victoria Nekrasova',
  },
  storyboard: {
    rec: '● REC — SEQ.01',
    frames: 'FR',
    hudTitle: 'SEQUENCE 01 — PROJECTOR REEL',
    chapters: [
      {
        no: '01',
        title: 'BACKSTAGE',
        text: 'Smoked eyes, steady hands. The face is being assembled before the light hits it.',
      },
      {
        no: '02',
        title: 'RED PROJECTION',
        text: 'A perforated red beam swallows the dress. She stands still — the light does the walking.',
      },
      {
        no: '03',
        title: 'BETWEEN TAKES',
        text: 'The projector cools down to blue. Tripods, cables, a shutter clicking in the dark.',
      },
      {
        no: '04',
        title: 'LAST LOOK',
        text: 'Red blinds across the collarbones, then only a silhouette against the flag of light.',
      },
    ],
  },
  editorial: {
    manifestoLabel: '( MANIFESTO )',
    manifestoFelt: 'felt',
    manifestoBlur: 'BLUR',
    tags: ['EYES NEVER LIE', '100% ACCURACY', 'STATE OF MIND — WILD', 'EST. 2026'],
    closeUp: 'CLOSE',
    up: 'UP',
    reelLabel: 'PARK BY OSIPCHUK — ORIGINAL REEL',
    loop: 'LOOP — 7.2 SEC',
    sequence: '( SEQUENCE 02 )',
    justForYou: 'JUST FOR YOU',
    caption: 'i wanna be a good frame',
    copyright: '©2026 VN.ARCHIVE',
  },
  tunnel: {
    label: '( ARCHIVE FLY-THROUGH )',
    depth: 'DEPTH',
    walk: 'WALK',
    archive: 'THE ARCHIVE',
    outro: '…and she keeps walking',
  },
  gallery: {
    selected: 'SELECTED',
    stills: 'STILLS',
    meta: 'FRAMES / PAUSED MOTION',
    hover: 'HOVER TO REVEAL',
  },
  albums: {
    port: 'PORT',
    folio: 'FOLIO',
    assets: 'ASSETS / CURATED ARCHIVE',
    open: 'OPEN FOLDER TO BROWSE',
    empty: 'EMPTY',
    tests: 'TESTS',
    photoshoots: 'PHOTOSHOOTS',
    shows: 'SHOWS',
    backstage: 'BACKSTAGE',
    clips: 'CLIPS',
  },
  albumPage: {
    back: '← PORTFOLIO',
    portfolio: 'PORTFOLIO',
    frame: 'FRAME',
    frames: 'FRAMES',
    comingSoon: 'COMING SOON',
    clip: 'CLIP',
    closeLightbox: 'Close lightbox',
    closeVideo: 'Close video',
    photo: 'Photo',
  },
  footer: {
    nextFrame: 'NEXT FRAME IS YOURS',
    bookHer: 'BOOK HER',
    published: 'PUBLISHED — MOB JOURNAL VOL.13 · PHOTO — REZEDA MAGIZOVA / OSIPCHUK',
    rights: '©2026 VN.ARCHIVE — ALL FRAMES RESERVED',
    madeBy: 'Made by',
  },
  notFound: {
    code: '404',
    title: 'LOST',
    text: 'This page does not exist. Return to the main sequence.',
    back: 'BACK TO SITE',
  },
  app: {
    loading: 'LOADING…',
  },
  seo: {
    title: 'VICTORIA NEKRASOVA',
    description: 'Victoria Nekrasova — fashion model. Editorial, runway, campaign. Portfolio and booking.',
    ogLocale: 'en_US',
  },
}
