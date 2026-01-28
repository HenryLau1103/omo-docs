import { defineConfig } from 'vitepress'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const docsDir = path.resolve(__dirname, '..')

function getSidebarItems(dir: string) {
  const fullPath = path.resolve(docsDir, dir)
  if (!fs.existsSync(fullPath)) return []
  
  return fs.readdirSync(fullPath)
    .filter(file => file.endsWith('.md') && file !== 'index.md')
    .map(file => {
      const name = path.basename(file, '.md')
      return {
        text: name.replace(/-/g, ' '),
        link: `/${dir}/${name}`
      }
    })
}

export default defineConfig({
  title: "OMO Docs",
  description: "Documentation for OMO",
  base: '/omo-docs/',
  themeConfig: {
    nav: [
      { text: 'Specs', link: '/specs/' },
      { text: 'PRD', link: '/prd/' },
      { text: 'API', link: '/api/' },
      { text: 'Plans', link: '/plans/' },
      { text: 'Changelog', link: '/changelog/' },
    ],
    sidebar: {
      '/specs/': [
        {
          text: 'Specs',
          items: getSidebarItems('specs')
        }
      ],
      '/prd/': [
        {
          text: 'PRD',
          items: getSidebarItems('prd')
        }
      ],
      '/api/': [
        {
          text: 'API',
          items: getSidebarItems('api')
        }
      ],
      '/plans/': [
        {
          text: 'Plans',
          items: getSidebarItems('plans')
        }
      ],
      '/changelog/': [
        {
          text: 'Changelog',
          items: getSidebarItems('changelog')
        }
      ]
    }
  }
})
