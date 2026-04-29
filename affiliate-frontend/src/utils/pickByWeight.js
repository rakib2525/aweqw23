export const pickByWeight = (offers = []) => {
  if (!offers.length) return null;

  const totalWeight = offers.reduce((sum, o) => {
    return sum + (Number(o.weight) || 1);
  }, 0);

  let random = Math.random() * totalWeight;

  for (let offer of offers) {
    random -= (Number(offer.weight) || 1);

    if (random <= 0) {
      return offer;
    }
  }

  return offers[0] || null;
};