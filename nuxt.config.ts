import process from 'node:process'

const appBaseURL = process.env.NUXT_APP_BASE_URL || '/'

export default defineNuxtConfig({
  compatibilityDate: '2026-01-01',
  css: ['~/assets/css/main.css'],
  app: {
    baseURL: appBaseURL,
    head: {
      htmlAttrs: { lang: 'en' },
      title: 'A little Diwali light',
      meta: [
        { name: 'theme-color', content: '#17101d' },
        { name: 'description', content: 'Light a diya and share a little Diwali joy.' },
      ],
    },
  },
  nitro: {
    baseURL: process.env.NITRO_APP_BASE_URL || appBaseURL,
    prerender: {
      routes: ['/', '/send', '/404.html'],
    },
  },
})
