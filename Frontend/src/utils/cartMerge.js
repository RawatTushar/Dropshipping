/**
 * Merge line items by product _id, capping qty by stock.
 * @param {Array} into
 * @param {Array} from
 */
export function mergeCartLineItems(into, from) {
  const merged = [...(into || [])];
  for (const item of from || []) {
    if (!item?._id) continue;
    const existing = merged.find((i) => i._id === item._id);
    if (existing) {
      const stock = Number(existing.countInStock ?? item.countInStock ?? 99);
      existing.qty = Math.min(
        Number(existing.qty || 0) + Number(item.qty || 0),
        Math.max(1, stock),
      );
    } else {
      merged.push({ ...item });
    }
  }
  return merged;
}

/**
 * @param {Record<string, unknown>} byUser
 * @param {string} userKey — same key Redux uses (typically Mongo _id, else email)
 */
export function mergeGuestCartIntoUserBucket(byUser, userKey) {
  if (!userKey || userKey === 'guest') return byUser;
  const guestItems = byUser?.guest;
  if (!guestItems?.length) return byUser;

  const next = { ...byUser };
  const existing = next[userKey] || [];
  next[userKey] = mergeCartLineItems(existing, guestItems);
  delete next.guest;
  return next;
}
