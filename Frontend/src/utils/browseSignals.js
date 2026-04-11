const STORAGE_KEY = 'dropship_viewed_product_ids_v1'
const MAX_IDS = 24

export function recordLocalProductView(productId) {
  if (!productId) return
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    const list = raw ? JSON.parse(raw) : []
    const id = String(productId)
    const next = [id, ...list.filter((x) => String(x) !== id)].slice(0, MAX_IDS)
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    /* ignore quota / private mode */
  }
}

export function getLocalViewedProductIds() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    const list = raw ? JSON.parse(raw) : []
    return Array.isArray(list) ? list.map(String) : []
  } catch {
    return []
  }
}
