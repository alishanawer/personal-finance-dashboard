import api from "../../api/axios";

const createCategoriesSlice = (set, get) => ({
  categories: [],

  fetchCategories: async () => {
    const res = await api.get("/categories/");
    set({ categories: res.data });
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
});

export default createCategoriesSlice;
