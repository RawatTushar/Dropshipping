/** @param {Record<string, unknown>} product */
export function discountPercent(product) {
  const list = Number(product.compareAtPrice || 0);
  const sale = Number(product.price || 0);
  if (!list || list <= sale || !sale) return 0;
  return Math.round(((list - sale) / list) * 100);
}

/** @param {number} n */
export function formatSoldCount(n) {
  const x = Number(n || 0);
  if (x >= 1000000) return `${(x / 1000000).toFixed(1)}M sold`;
  if (x >= 1000) return `${(x / 1000).toFixed(1)}k sold`;
  if (x > 0) return `${x} sold`;
  return 'New';
}

export const SORT_OPTIONS = [
  { id: 'featured', label: 'Featured' },
  { id: 'bestselling', label: 'Best selling' },
  { id: 'trending', label: 'Trending (most activity)' },
  { id: 'price-asc', label: 'Price: Low to high' },
  { id: 'price-desc', label: 'Price: High to low' },
  { id: 'rating', label: 'Highest rated' },
  { id: 'discount', label: 'Biggest discount' },
  { id: 'newest', label: 'Newest' },
];

export const QUICK_FILTERS = [
  { id: 'trending', label: 'Trending', hint: 'High sales velocity' },
  { id: 'topRated', label: 'Top rated', hint: '4.5★ & up' },
  { id: 'bigDeals', label: 'Big deals', hint: '15%+ off' },
];

/**
 * @param {Array<Record<string, unknown>>} baseList — full catalog or search-ranked subset
 * @param {{ category: string; minRating: number; quick: string | null; sort: string }} opts
 */
export function buildCatalogList(baseList, opts) {
  const { category, minRating, quick, sort } = opts;
  let list = [...baseList];

  if (category && category !== 'all') {
    list = list.filter(
      (p) => String(p.category || '').trim() === category,
    );
  }

  if (minRating > 0) {
    list = list.filter((p) => Number(p.rating || 0) >= minRating);
  }

  if (quick === 'trending') {
    const threshold = 15;
    list = list.filter((p) => Number(p.soldCount || 0) >= threshold);
  } else if (quick === 'topRated') {
    list = list.filter((p) => Number(p.rating || 0) >= 4.5);
  } else if (quick === 'bigDeals') {
    list = list.filter((p) => discountPercent(p) >= 15);
  }

  const scoreFeatured = (p) =>
    Number(p.soldCount || 0) * 2 +
    Number(p.rating || 0) * 80 +
    discountPercent(p) * 3;

  const byNewest = (a, b) =>
    new Date(b.createdAt || 0) - new Date(a.createdAt || 0);

  switch (sort) {
    case 'price-asc':
      list.sort((a, b) => Number(a.price) - Number(b.price));
      break;
    case 'price-desc':
      list.sort((a, b) => Number(b.price) - Number(a.price));
      break;
    case 'bestselling':
      list.sort((a, b) => Number(b.soldCount || 0) - Number(a.soldCount || 0));
      break;
    case 'trending':
      list.sort(
        (a, b) =>
          Number(b.soldCount || 0) * 1.2 +
          Number(b.rating || 0) * 50 -
          (Number(a.soldCount || 0) * 1.2 + Number(a.rating || 0) * 50),
      );
      break;
    case 'rating':
      list.sort((a, b) => {
        const rd = Number(b.rating || 0) - Number(a.rating || 0);
        if (rd !== 0) return rd;
        return Number(b.reviewCount || 0) - Number(a.reviewCount || 0);
      });
      break;
    case 'discount':
      list.sort(
        (a, b) => discountPercent(b) - discountPercent(a),
      );
      break;
    case 'newest':
      list.sort(byNewest);
      break;
    case 'featured':
    default:
      list.sort((a, b) => {
        const sd = scoreFeatured(b) - scoreFeatured(a);
        if (sd !== 0) return sd;
        return byNewest(a, b);
      });
      break;
  }

  return list;
}

/**
 * @param {Array<Record<string, unknown>>} items
 */
export function uniqueCategories(items) {
  const set = new Set();
  for (const p of items) {
    const c = String(p.category || '').trim();
    if (c) set.add(c);
  }
  return [...set].sort((a, b) => a.localeCompare(b));
}
