export async function loadJSON(path) {
  const res = await fetch(path)
  if (!res.ok) throw new Error(`Impossibile caricare ${path}`)
  return res.json()
}

export function encodeState(obj) {
  return btoa(encodeURIComponent(JSON.stringify(obj)))
}
export function decodeState(s, fallback) {
  try { return JSON.parse(decodeURIComponent(atob(s))) } catch { return fallback }
}
