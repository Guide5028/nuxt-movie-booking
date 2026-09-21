export const useCatalogStore = defineStore("catalog", () => {
  const searchQuery = ref("");
  const genreFilter = ref("All");

  return { searchQuery, genreFilter };
});
