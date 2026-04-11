/**
 * Multi-field catalog ranking for search + typeahead.
 * Returns a score > 0 if the product matches `query`, else null.
 */
export function rankProductForQuery(product, rawQuery) {
  const q = String(rawQuery || '')
    .trim()
    .toLowerCase()
  if (!q) return null

  const name = String(product.name || '').toLowerCase()
  const cat = String(product.category || '').toLowerCase()
  const brand = String(product.brand || '').toLowerCase()
  const desc = String(product.description || '')
    .toLowerCase()
    .slice(0, 400)

  const tokens = q.split(/\s+/).filter((t) => t.length > 0)
  const hay = `${name} ${cat} ${brand} ${desc}`

  const fullPhraseInHay = hay.includes(q)
  const allTokensMatch =
    tokens.length > 0 &&
    tokens.every((t) => name.includes(t) || cat.includes(t) || brand.includes(t) || desc.includes(t))

  if (!fullPhraseInHay && !allTokensMatch) return null

  let score = 0
  if (name.startsWith(q)) score += 120
  else if (name.includes(q)) score += 95
  else if (fullPhraseInHay) score += 70

  for (const t of tokens) {
    if (name.startsWith(t)) score += 45
    else if (name.includes(t)) score += 32
    if (cat.includes(t)) score += 22
    if (brand.includes(t)) score += 18
    if (desc.includes(t)) score += 8
  }

  const pos = name.indexOf(q)
  if (pos >= 0) score += Math.max(0, 14 - pos / 4)

  return score
}
