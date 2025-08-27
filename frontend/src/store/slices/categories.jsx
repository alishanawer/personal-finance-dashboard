const createCategoriesSlice = (set, get) => ({
  categories: [],

  fetchCategories: async () => {
    const res = await fetch("/api/categories");
    const data = await res.json();
    set({ categories: data });
  },

  addCategory: async (category) => {
    set((state) => ({
      categories: [...state.categories, category],
    }));
    await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(category),
    });
  },
});

export default createCategoriesSlice;
