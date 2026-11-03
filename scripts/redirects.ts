import fs from 'fs-extra'

// Publish only this site's configured shortcuts.
await fs.copy('_redirects', '_dist_redirects')
