<script setup lang="ts">
import { isDark } from '~/logics'

const props = defineProps<{
  url: string
  title: string
}>()

interface RemarkInstance {
  destroy: () => void
}

interface RemarkApi {
  createInstance: (config: Record<string, unknown>) => RemarkInstance
  changeTheme: (theme: 'dark' | 'light') => void
}

const host = (import.meta.env.VITE_REMARK42_HOST || '').replace(/\/$/, '')
const siteId = import.meta.env.VITE_REMARK42_SITE_ID || 'alankyle'
const container = ref<HTMLElement>()
const failed = ref(false)
let instance: RemarkInstance | undefined
let active = false
let script: HTMLScriptElement | undefined

function api() {
  return (window as Window & { REMARK42?: RemarkApi }).REMARK42
}

function mountComments() {
  if (!active || !container.value || !api())
    return
  instance?.destroy()
  instance = api()!.createInstance({
    node: container.value,
    host,
    site_id: siteId,
    url: props.url,
    page_title: props.title,
    locale: 'zh',
    theme: isDark.value ? 'dark' : 'light',
  })
}

function onError() {
  failed.value = true
  script?.remove()
}

onMounted(() => {
  active = true
  window.addEventListener('REMARK42::ready', mountComments)
  if (api()) {
    mountComments()
    return
  }
  script = document.getElementById('remark42-embed-script') as HTMLScriptElement | null || undefined
  if (!script) {
    script = document.createElement('script')
    script.id = 'remark42-embed-script'
    script.type = 'module'
    script.src = `${host}/web/embed.mjs`
    document.head.appendChild(script)
  }
  script.addEventListener('error', onError)
})

watch(isDark, dark => api()?.changeTheme(dark ? 'dark' : 'light'))

onBeforeUnmount(() => {
  active = false
  window.removeEventListener('REMARK42::ready', mountComments)
  script?.removeEventListener('error', onError)
  instance?.destroy()
})
</script>

<template>
  <section class="m-auto mt-16 mb-8 max-w-65ch print:hidden" aria-label="文章评论">
    <h2 class="text-xl mb-6">
      评论
    </h2>
    <p v-if="failed" role="status" class="opacity-60">
      评论暂时无法加载，请稍后刷新页面重试。
    </p>
    <div ref="container">
      <p v-if="!failed" class="opacity-60">
        正在加载评论…
      </p>
    </div>
  </section>
</template>
