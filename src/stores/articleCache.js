import { reactive } from 'vue'

const cache = reactive(new Map())

export const articleCache = {
  get(id) {
    return cache.get(String(id)) ?? null
  },
  set(id, article) {
    cache.set(String(id), article)
  },
  has(id) {
    return cache.has(String(id))
  },
}
