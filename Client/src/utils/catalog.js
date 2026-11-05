export function locationOf(post) {
  const [province = "", ...town] = String(post.ubication || "").split(",");
  return { province: province.trim(), locality: town.join(",").trim() };
}

export function filterCatalog(posts, { selectedProvince, selectedLocality, selectedCategory }) {
  return posts.filter(post => {
    const { province, locality } = locationOf(post);
    return (!selectedProvince || province === selectedProvince)
      && (!selectedLocality || locality === selectedLocality)
      && (!selectedCategory || post.category === selectedCategory);
  });
}

export const optionsFrom = values => [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b, "es"));
