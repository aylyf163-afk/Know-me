const en = {
  about: {
    hint: 'Move your cursor to explore · Scroll down to see more',
    heroPrefix: "HELLO, I'M",
    heroName: 'Pinkman',
    heroSubtitle: ['Front-end development', '27', 'Shanghai'],
  },
  header: {
    brand: 'Pinkman',
    city: 'Shanghai',
    navAriaLabel: 'Main navigation',
    switchToEnglish: 'Switch to English',
    switchToChinese: 'Switch to Chinese',
    switchShortEn: 'EN',
    switchShortZh: '中',
  },
  nav: {
    about: 'About',
    skills: 'Skills',
    projects: 'Projects',
    contact: 'Contact',
  },
  skills: {
    title: 'Professional Skills',
    badges: {
      base: 'Base',
    },
    groups: {
      ai: {
        title: 'AI Agent Core',
        desc: 'Agent systems & LLM applications',
        details: [
          { name: 'Cursor usage', level: 'Expert' },
          { name: 'Skills authoring', level: 'Expert' },
          { name: 'Rules authoring', level: 'Expert' },
          { name: 'Claude integration', level: 'Proficient' },
          { name: 'ChatGPT search', level: 'Proficient' },
        ],
      },
      base: {
        title: 'Frontend Fundamentals',
        desc: 'Languages & engineering foundations',
        details: [
          { name: 'JavaScript (ES6+)/TypeScript', level: 'Expert' },
          { name: 'HTML5/CSS3/Sass/Less', level: 'Expert' },
          { name: 'Axios/Fetch/WebSocket', level: 'Expert' },
          { name: 'jQuery/DOM/BOM', level: 'Expert' },
          { name: 'Webpack / Vite', level: 'Proficient' },
          { name: 'Micro‑frontend (qiankun)', level: 'Proficient' },
        ],
      },
      vue: {
        title: 'Vue.js Engineer',
        desc: 'Vue ecosystem & high‑performance apps',
        details: [
          { name: 'Vue3 + Vite + Pinia + Vue Router', level: 'Expert' },
          { name: 'Vue2 + Webpack + Vuex + Vue Router', level: 'Expert' },
          { name: 'UniApp + uView UI', level: 'Proficient' },
        ],
      },
      react: {
        title: 'React Engineer',
        desc: 'React ecosystem & high‑performance apps',
        details: [{ name: 'React + Vite + React Router + Hooks', level: 'Expert' }],
      },
    },
    stats: {
      coreSkills: 'Core skills',
      focusAreas: 'Expert areas',
      fulfillment: 'Delivery rate',
      projects: 'Projects',
      stacks: 'Stacks',
      reliability: 'Reliability',
    },
  },
  projects: {
    title: 'Projects',
    gallerySubtitle: 'Explore · Innovate · Practice',
    galleryQuote: 'Every project is a challenge—and every challenge is growth.',
    galleryAllProjects: 'All projects',
    galleryBottomDragHint: 'Drag to orbit · Wheel zoom · Click a card for details',
    galleryAsideHint:
      'Static showroom plate under the canvas; cards are Three.js + HTML layers. Drag to orbit (damped OrbitControls, mouse wheel zoom). Drag the left/right strips (or Shift+wheel on the bottom bar), arrows, or ← / → to change focus. Click a card for details.',
    galleryDragHint: 'Drag to explore · Click a card for details',
    galleryViewDetails: 'View details',
    galleryClose: 'Close',
    galleryTech: 'Stack',
    galleryPeriod: 'Timeline',
    galleryOutcomes: 'Outcomes',
    galleryNavPrev: 'Previous project',
    galleryNavNext: 'Next project',
    scrolly: {
      hint: 'Scroll down to switch screenshots',
      stackTitle: 'Stack',
      goalsTitle: 'Outcomes',
      items: [
        {
          title: 'Project One (replace with yours)',
          image: '/projects/project-1.png',
          stack: ['React', 'TypeScript', 'Vite'],
          goals: ['Cut LCP from 3.2s to 1.4s', 'Delivered end-to-end core flow', 'Built 12+ reusable components'],
        },
        {
          title: 'Project Two (replace with yours)',
          image: '/projects/project-2.png',
          stack: ['Vue 3', 'Pinia', 'ECharts'],
          goals: ['Shipped dashboards & RBAC', 'Kept uptime at 99.9%', 'Added exports & alert subscriptions'],
        },
        {
          title: 'Project Three (replace with yours)',
          image: '/projects/project-3.png',
          stack: ['Node.js', 'WebSocket', 'Docker'],
          goals: ['Realtime push latency < 200ms', 'Reduced API error rate by 35%', 'Stable production operation'],
        },
        {
          title: 'Project Four (replace with yours)',
          summary: 'Scroll-driven storytelling for marketing and portfolio pages with pacing, readability, and i18n.',
          image: '/projects/project-4.png',
          stack: ['React', 'GSAP', 'ScrollTrigger'],
          goals: ['Built scrollytelling layout', 'Multi-language copy', '5-screenshot scroll switching'],
        },
        {
          title: 'Project Five (replace with yours)',
          summary: 'Performance and DX-focused delivery with monitoring, build pipeline, and cross-device polish.',
          image: '/projects/project-5.png',
          stack: ['Performance', 'DX', 'UX'],
          goals: ['Refined motion & readability', 'Kept layout stable', 'Mobile responsive & graceful fallback'],
        },
      ],
    },
    items: {
      agent: {
        title: 'AI Support Agent Platform',
        summary:
          'Multi‑turn LLM support system with tools, knowledge retrieval and memory, serving 100k+ daily conversations.',
      },
      workflow: {
        title: 'Automation Workflow Engine',
        summary:
          'Visual AI workflow orchestration with approvals, scheduling and monitoring, boosting efficiency by 60%.',
      },
      dashboard: {
        title: 'Enterprise Analytics Dashboard',
        summary:
          'Cross‑department dashboards with permissions, real‑time metrics and alerts to improve data collaboration.',
      },
    },
  },
  contact: {
    title: 'Work With Me',
    profileName: 'Leo Liyunfei',
    profileTitle: 'Front‑end Engineer',
    intro: 'Focused on frontend engineering and AI, helping teams ship reliable, polished user experiences.',
    cardTitle: 'Contact',
    email: 'Email: 1234567890@qq.com',
    phone: 'Phone: 1234567890',
    contactButton: 'Contact me',
    status: 'Open to collaborate',
  },
} as const

export default en

