import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const srcDir = path.join(__dirname, 'src')

const replacements = [
  { regex: /bg-\[#1a2030\]/g, replacement: 'bg-muted' },
  { regex: /text-\[#d9deea\]/g, replacement: 'text-foreground' },
  { regex: /text-\[#8c97af\]/g, replacement: 'text-muted-foreground' },
  { regex: /text-\[#aab4cc\]/g, replacement: 'text-foreground/80' },
  { regex: /text-\[#7f8aa3\]/g, replacement: 'text-muted-foreground' },
  { regex: /text-\[#b1bdd4\]/g, replacement: 'text-foreground/90' },
  { regex: /text-\[#d5dbeb\]/g, replacement: 'text-foreground' },
  { regex: /text-\[#76829c\]/g, replacement: 'text-muted-foreground' },
  { regex: /text-\[#cbd5e1\]/g, replacement: 'text-foreground/90' }
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
