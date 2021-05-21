// import { resolve } from 'path'
// import { resolve } from 'resolve-from';
// const path = require('path');

module.exports = {
  base: '/docs/',
  dest: 'public/docs',
  title:'Docs',
  description:'VuePress Docs for Cottontail',
  head: [
    ['link', { rel: 'icon', href: 'https://picsum.photos/100' }]
  ],
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Getting Started', link: '/getstarted/' },
      { text: 'Demo Notes', link: '/clientdemo/' }
    ],
    sidebar: [
      ['/', 'Welcome to Docs'],
      {
        title: 'Getting Started',
        collapsable: true,
        children: [
          ['/getstarted/', 'System Setup'],
          ['/clientdemo/', 'Demo Notes']
        ]
      },
      {
        title: 'Technical Rundown',
        collapsable: true,
        children: [
          ['/providers/', 'Service vs Identity Providers'],
          ['/hypotheses/', 'Tested Hypotheses'],
          ['/techrundown/', 'Detailed Examples']
        ]
      }
    ],
  extendMarkdown: md => {
    md.set({ breaks: true })
    md.use(require('markdown-it'))
  },
  plugins: [
    'tag',
    'category'
  ],
  chainWebpack (config) {
    config.plugin('injections').tap(([options]) => [
      Object.assign(options, {
        SW_BASE_URL: JSON.stringify('/')
      })
    ])
  },
  extraWatchFiles: ["**/*.md", "**/*.vue", "**/*.styl"]
}
}
