/** Best-effort match of an order line label to a catalog product id */
export function guessProductIdFromLabel(products, label) {
  const low = (label || '').toLowerCase();
  if (!low) return null;
  const sorted = [...products].sort((a, b) => b.name.length - a.name.length);
  const hit = sorted.find((p) => low.includes(p.name.toLowerCase()));
  return hit ? hit.id : null;
}
