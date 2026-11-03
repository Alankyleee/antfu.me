import { createHash } from 'node:crypto'
import { readFile, stat } from 'node:fs/promises'
import { basename, extname } from 'node:path'

const types = {
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
}

async function main() {
  const args = process.argv.slice(2)
  if (!args.length || args.includes('--help')) {
    console.log('Usage: npm run r2:upload -- [--dry-run] image.png [other.webp ...]')
    console.log('Configure .env.r2.local first. --dry-run validates files without uploading.')
    return
  }

  const dryRun = args.includes('--dry-run')
  const paths = args.filter(arg => arg !== '--dry-run')
  if (!paths.length || paths.some(path => path.startsWith('--')))
    throw new Error('Provide image file paths. The only options are --help and --dry-run.')

  const required = ['R2_ACCOUNT_ID', 'R2_BUCKET', 'R2_PUBLIC_URL']
  if (!dryRun)
    required.push('R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY')
  const missing = required.filter(name => !process.env[name]?.trim())
  if (missing.length)
    throw new Error(`Missing configuration: ${missing.join(', ')}. Fill in .env.r2.local.`)

  const env = process.env
  if (!/^[a-f\d]{32}$/i.test(env.R2_ACCOUNT_ID))
    throw new Error('R2_ACCOUNT_ID must be the 32-character Cloudflare Account ID.')
  const publicUrl = new URL(env.R2_PUBLIC_URL)
  if (publicUrl.protocol !== 'https:' || publicUrl.username || publicUrl.password || publicUrl.search || publicUrl.hash)
    throw new Error('R2_PUBLIC_URL must be an HTTPS public URL without credentials, query or fragment.')
  const endpoint = new URL(env.R2_ENDPOINT || `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`)
  if (endpoint.protocol !== 'https:' || !/^[a-f\d]{32}(?:\.(?:eu|fedramp))?\.r2\.cloudflarestorage\.com$/i.test(endpoint.hostname) || endpoint.username || endpoint.password || endpoint.port || endpoint.pathname !== '/' || endpoint.search || endpoint.hash)
    throw new Error('R2_ENDPOINT must be the HTTPS S3 endpoint supplied by Cloudflare.')

  const prefix = (env.R2_PREFIX ?? 'blog').replace(/^\/+|\/+$/g, '')
  if (prefix.split('/').some(part => part === '.' || part === '..'))
    throw new Error('R2_PREFIX cannot contain . or .. path segments.')

  // Validate every file before sending any requests.
  const files = []
  for (const path of paths) {
    const extension = extname(path).toLowerCase()
    if (!types[extension])
      throw new Error(`Unsupported image type: ${path}`)
    const info = await stat(path)
    if (!info.isFile() || info.size === 0 || info.size > 50 * 1024 * 1024)
      throw new Error(`Image must be a non-empty file of at most 50 MiB: ${path}`)
    files.push({ path, extension })
  }

  let client
  let PutObjectCommand
  if (!dryRun) {
    const sdk = await import('@aws-sdk/client-s3')
    PutObjectCommand = sdk.PutObjectCommand
    client = new sdk.S3Client({
      region: 'auto',
      endpoint: endpoint.href,
      credentials: { accessKeyId: env.R2_ACCESS_KEY_ID, secretAccessKey: env.R2_SECRET_ACCESS_KEY },
      requestChecksumCalculation: 'WHEN_REQUIRED',
    })
  }

  try {
    for (const { path, extension } of files) {
      const body = await readFile(path)
      const hash = createHash('sha256').update(body).digest('hex')
      const key = [prefix, `${hash}${extension}`].filter(Boolean).join('/')
      const url = `${publicUrl.href.replace(/\/+$/, '')}/${key.split('/').map(encodeURIComponent).join('/')}`
      if (client) {
        await client.send(new PutObjectCommand({
          Bucket: env.R2_BUCKET,
          Key: key,
          Body: body,
          ContentType: types[extension],
          CacheControl: 'public, max-age=31536000, immutable',
        }), { abortSignal: AbortSignal.timeout(120_000) })
      }
      const alt = basename(path, extname(path)).replace(/[\[\]\\\r\n]/g, ' ')
      console.log(`${dryRun ? '[dry-run] ' : ''}${path}\n${url}\n![${alt}](${url})\n`)
    }
  }
  finally {
    client?.destroy()
  }
}

main().catch((error) => {
  // Avoid dumping SDK request objects or credentials.
  console.error(`R2 upload failed: ${error.message}`)
  process.exitCode = 1
})
