import fs from 'node:fs/promises'

// Keep the list empty until this site's own sponsor data is configured.
await fs.mkdir('src/data', { recursive: true })
await fs.writeFile('src/data/sponsors-circles.json', '[]\n')
