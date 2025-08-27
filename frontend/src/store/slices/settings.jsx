const createSettingsSlice = (set, get) => ({
  settings: null,

  fetchSettings: async () => {
    const res = await fetch("/api/settings");
    const data = await res.json();
    set({ settings: data });
  },

  updateSettings: async (updates) => {
    set((state) => ({
      settings: { ...state.settings, ...updates },
    }));
    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
  },
});

export default createSettingsSlice;
