import api from "../../api/axios";

const createSettingsSlice = (set, get) => ({
  settings: null,

  fetchSettings: async () => {
    const res = await api.get("/settings/");
    set({ settings: res.data });
    return res.data;
  },

  updateSettings: async (updates) => {
    const res = await api.put("/settings/", updates);
    set((state) => ({
      settings: res.data,
    }));
    return res.data;
  },
});

export default createSettingsSlice;
