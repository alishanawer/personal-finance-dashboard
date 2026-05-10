import api from "../../api/axios";

const createCategoriesSlice = (set, get) => ({
  categories: [],
  categoryUsage: {},

  fetchCategories: async () => {
    const res = await api.get("/categories/");
    set({ categories: res.data });
  },

  fetchCategoryUsage: async () => {
    const res = await api.get("/categories/usage");
    const usage = res.data.reduce((acc, item) => {
      acc[item.category_id] = item;
      return acc;
    }, {});
    set({ categoryUsage: usage });
  },

  addCategory: async (category) => {
    const res = await api.post("/categories/", category);
    set((state) => ({
      categories: [...state.categories, res.data],
    }));
    return res.data;
  },

  updateCategory: async (categoryId, updates) => {
    const res = await api.put(`/categories/${categoryId}`, updates);
    set((state) => ({
      categories: state.categories.map((item) =>
        item.id === categoryId ? res.data : item,
      ),
    }));
    return res.data;
  },

  deleteCategory: async (categoryId) => {
    await api.delete(`/categories/${categoryId}`);
    set((state) => ({
      categories: state.categories.filter((item) => item.id !== categoryId),
    }));
  },

  mergeCategory: async (sourceId, targetId) => {
    const res = await api.post(`/categories/${sourceId}/merge`, {
      target_id: targetId,
    });
    return res.data;
  },
});

export default createCategoriesSlice;
