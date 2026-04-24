const zh = {
  about: {
    hint: '移动鼠标开启探索 · 向下滚动查看更多',
    heroPrefix: '你好 我是',
    heroName: '李云飞',
    heroSubtitle: ['前端开发工程师', '27岁', '上海'],
  },
  header: {
    brand: '李云飞',
    city: '上海',
    navAriaLabel: '主导航',
    switchToEnglish: '切换为英文',
    switchToChinese: '切换为中文',
    switchShortEn: 'EN',
    switchShortZh: '中',
  },
  nav: {
    about: '关于',
    skills: '技能',
    projects: '项目',
    contact: '合作',
  },
  skills: {
    title: '专业技能',
    badges: {
      base: '基础',
    },
    groups: {
      ai: {
        title: 'AI Agent 核心',
        desc: '智能体系统与大模型应用',
        details: [
          { name: 'Cursor编辑器使用', level: '精通' },
          { name: 'Skills 技能开发', level: '精通' },
          { name: 'Rules 规则开发', level: '精通' },
          { name: 'Claude 开发', level: '熟练' },
          { name: 'ChatGPT 检索', level: '熟练' },
        ],
      },
      base: {
        title: '前端基础核心能力',
        desc: '前端语言能力与工程化基础',
        details: [
          { name: 'JavaScript (ES6+) / TypeScript', level: '精通' },
          { name: 'HTML5 / CSS3 / Sass / Less', level: '精通' },
          { name: 'Axios / Fetch / WebSocket', level: '精通' },
          { name: 'jQuery / DOM / BOM 交互开发', level: '精通' },
          { name: 'Webpack / Vite ', level: '熟练' },
          { name: '微前端架构 (qiankun)', level: '熟练' },
        ],
      },
      vue: {
        title: 'Vue.js 开发工程师',
        desc: 'Vue.js 生态与高性能服务开发',
        details: [
          { name: 'Vue3 + Vite + Pinia + VueRouter', level: '精通' },
          { name: 'Vue2 + Webpack + Vuex + VueRouter', level: '精通' },
          { name: 'UniApp + uView UI', level: '熟练' },
        ],
      },
      react: {
        title: 'React 开发工程师',
        desc: 'React 生态与高性能服务开发',
        details: [{ name: 'React + Vite + React Router  + React Hooks', level: '精通' }],
      },
    },
    stats: {
      coreSkills: '核心技能',
      focusAreas: '精通方向',
      fulfillment: '需求实现度',
      projects: '项目经验',
      stacks: '技术栈',
      reliability: '可用性目标',
    },
  },
  projects: {
    title: '项目经历',
    gallerySubtitle: '探索 · 创新 · 实践',
    galleryQuote: '每一个项目都是一次挑战，每一次挑战都是一次成长。',
    galleryAllProjects: '全部项目',
    galleryBottomDragHint: '中间拖拽旋转视角 · 滚轮缩放 · 点击卡片查看详情',
    galleryAsideHint:
      '底图为静态高清太空舱渲染（Canvas 下方）；项目卡由 Three.js + CSS 浮层呈现。中间拖拽旋转视角（OrbitControls 阻尼 + 滚轮缩放）；两侧边缘水平拖动或底部 Shift+滚轮、箭头、方向键切换焦点；点击卡片查看详情。',
    galleryDragHint: '拖动查看项目 · 点击卡片查看详情',
    galleryViewDetails: '查看详情',
    galleryClose: '关闭',
    galleryTech: '技术栈',
    galleryPeriod: '周期',
    galleryOutcomes: '关键成果',
    galleryNavPrev: '上一个项目',
    galleryNavNext: '下一个项目',
    scrolly: {
      hint: '向下滚动查看下一张 · 右侧截图随滚动切换',
      stackTitle: '技术栈',
      goalsTitle: '达成目标',
      items: [
        {
          title: '项目一（替换成你的项目名）',
          image: '/projects/project-1.png',
          stack: ['React', 'TypeScript', 'Vite'],
          goals: ['首屏加载从 3.2s 优化到 1.4s', '实现核心业务流程闭环', '沉淀可复用组件 12+'],
        },
        {
          title: '项目二（替换成你的项目名）',
          image: '/projects/project-2.png',
          stack: ['Vue3', 'Pinia', 'ECharts'],
          goals: ['搭建权限体系与可视化看板', '关键页面可用性达 99.9%', '支持导出与告警订阅'],
        },
        {
          title: '项目三（替换成你的项目名）',
          image: '/projects/project-3.png',
          stack: ['Node.js', 'WebSocket', 'Docker'],
          goals: ['实时推送延迟 < 200ms', '接口错误率下降 35%', '上线后稳定运行'],
        },
        {
          title: '项目四（替换成你的项目名）',
          summary: '以滚动驱动叙事的营销与作品集页面，强调节奏、可读性与多语言。',
          image: '/projects/project-4.png',
          stack: ['React', 'GSAP', 'ScrollTrigger'],
          goals: ['完成滚动叙事页面搭建', '支持多语言文案', '支持 5 张截图滚动切换'],
        },
        {
          title: '项目五（替换成你的项目名）',
          summary: '围绕性能与工程化落地的前端体验治理，覆盖监控、构建与多端适配。',
          image: '/projects/project-5.png',
          stack: ['性能优化', '工程化', '可用性'],
          goals: ['优化交互与动画体验', '保持布局稳定与清晰阅读', '移动端适配与降级'],
        },
      ],
    },
    items: {
      agent: {
        title: '智能客服 Agent 平台',
        summary:
          '基于大语言模型的多轮对话系统，支持工具调用、知识库实时检索与上下文记忆，日均处理对话 10万+。',
      },
      workflow: {
        title: '自动化流程引擎',
        summary:
          '可视化 AI 工作流编排系统，支持审批流式流程设计、自动化任务调度与执行监控，提升业务效率 60%。',
      },
      dashboard: {
        title: '企业级数据看板平台',
        summary: '搭建跨部门数据看板与权限体系，支持实时指标、告警订阅及导出分析，显著提升数据协同效率。',
      },
    },
  },
  contact: {
    title: '与我合作',
    profileName: '李云飞',
    profileTitle: '前端开发工程师',
    intro: '专注于前端技术研发，探索人工智能的边界，为企业前端项目添砖加瓦。',
    cardTitle: '联系方式',
    email: '邮箱：1234567890@qq.com',
    phone: '电话：1234567890',
    contactButton: '联系我',
    status: '开放合作',
  },
} as const

export default zh

