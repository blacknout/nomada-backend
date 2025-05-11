export const getRideDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const toRad = (x: number) => (x * Math.PI) / 180;

  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
}

// This compares two strings and returns a similarity rating
export const levenshtein = (a: string, b: string) => {
  const tmp = [];
  let i, j, alen = a.length, blen = b.length, res;

  if (alen === 0) { return blen; }
  if (blen === 0) { return alen; }

  for (i = 0; i <= alen; i++) { tmp[i] = [i]; }

  for (j = 0; j <= blen; j++) { tmp[0][j] = j; }

  for (i = 1; i <= alen; i++) {
    for (j = 1; j <= blen; j++) {
      res = a[i - 1] === b[j - 1] ? 0 : 1;
      tmp[i][j] = Math.min(
        tmp[i - 1][j] + 1,
        tmp[i][j - 1] + 1,
        tmp[i - 1][j - 1] + res
      );
    }
  }

  return tmp[alen][blen];
}
