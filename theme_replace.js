import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const srcDir = path.join(__dirname, 'src')

const replacements = [
  { regex: /bg-\[#0f1117\]/g, replacement: 'bg-background' },
  { regex: /bg-\[#111724\]/g, replacement: 'bg-input-background' },
  { regex: /bg-\[#161b27\]/g, replacement: 'bg-sidebar' },
  { regex: /bg-\[#1e2535\]/g, replacement: 'bg-card' },
  { regex: /bg-\[#252d3f\]/g, replacement: 'bg-muted' },
  { regex: /bg-\[#141a28\]/g, replacement: 'bg-background' },
  { regex: /bg-\[#2d3650\]/g, replacement: 'bg-accent' },
  { regex: /border-\[#252d3f\]/g, replacement: 'border-border' },
  { regex: /border-\[#3c4a68\]/g, replacement: 'border-border' },
  { regex: /border-\[#111724\]/g, replacement: 'border-input' },
  { regex: /text-\[#64748b\]/g, replacement: 'text-muted-foreground' },
  { regex: /text-\[#8b95ad\]/g, replacement: 'text-muted-foreground' },
  { regex: /text-\[#8f9ab2\]/g, replacement: 'text-muted-foreground' },
  { regex: /text-\[#77819a\]/g, replacement: 'text-muted-foreground' },
  { regex: /text-\[#6f7b95\]/g, replacement: 'text-muted-foreground' },
  { regex: /text-\[#cfd8eb\]/g, replacement: 'text-foreground/80' },
  { regex: /text-\[#7d87a0\]/g, replacement: 'text-muted-foreground' },
  { regex: /text-\[#94a3b8\]/g, replacement: 'text-foreground/80' },
  { regex: /text-\[#3c4a68\]/g, replacement: 'text-muted-foreground' },
  { regex: /text-white/g, replacement: 'text-foreground' },
  { regex: /bg-brand-500/g, replacement: 'bg-primary' },
  { regex: /text-brand-500/g, replacement: 'text-primary' },
  { regex: /text-brand-400/g, replacement: 'text-primary' },
  { regex: /text-brand-300/g, replacement: 'text-primary' },
  { regex: /border-brand-500/g, replacement: 'border-primary' },
  { regex: /hover:bg-brand-500\/10/g, replacement: 'hover:bg-primary/10' },
  { regex: /hover:bg-\[#2d3650\]/g, replacement: 'hover:bg-accent' },
  { regex: /bg-white\/5/g, replacement: 'bg-card/40' },
  { regex: /bg-white\/10/g, replacement: 'bg-card/80' },
  { regex: /border-white\/10/g, replacement: 'border-border' },
  { regex: /border-white\/5/g, replacement: 'border-border/50' },
  { regex: /border-white\/20/g, replacement: 'border-border/80' },
  { regex: /border-brand-500\/60/g, replacement: 'border-primary' },
  { regex: /bg-brand-500\/12/g, replacement: 'bg-primary/10' },
  { regex: /bg-brand-500\/20/g, replacement: 'bg-primary/20' },
  { regex: /border-brand-500\/50/g, replacement: 'border-primary/50' },
  { regex: /text-\[#aeb9d3\]/g, replacement: 'text-foreground/90' },
  { regex: /ring-brand-500/g, replacement: 'ring-ring' },
]

function processDir(dir) {
  const files = fs.readdirSync(dir)
  for (const file of files) {
    const fullPath = path.join(dir, file)
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath)
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8')
      let changed = false
      for (const r of replacements) {
        if (content.match(r.regex)) {
          content = content.replace(r.regex, r.replacement)
          changed = true
        }
      }
      if (changed) {
        fs.writeFileSync(fullPath, content)
        console.log('Updated:', fullPath)
      }
    }
  }
}

processDir(srcDir)
console.log('Done.')
