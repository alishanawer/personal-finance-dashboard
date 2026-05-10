import api from "../../api/axios";

const createSettingsSlice = (set, get) => ({
  settings: null,
  fxRates: null,
  fxBase: null,
  fxUpdatedAt: null,

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

  fetchFxRates: async (baseCurrency, symbols = []) => {
    const base = baseCurrency?.toUpperCase();
    if (!base) return null;

    const { fxBase, fxUpdatedAt } = get();
    if (fxBase === base && fxUpdatedAt) {
      const lastUpdated = new Date(fxUpdatedAt).getTime();
      if (Number.isFinite(lastUpdated)) {
        const minutesSince = (Date.now() - lastUpdated) / 60000;
        if (minutesSince < 30) {
          return { base: fxBase, rates: get().fxRates };
        }
      }
    }

    const params = new URLSearchParams({ base });
    if (symbols.length) {
      params.set("symbols", symbols.join(","));
    }

    const res = await fetch(
      `https://api.exchangerate.host/latest?${params.toString()}`,
    );

    if (!res.ok) {
      throw new Error("Failed to fetch exchange rates.");
    }

    const data = await res.json();
    set({
      fxRates: data.rates || {},
      fxBase: base,
      fxUpdatedAt: data.date || new Date().toISOString(),
    });
    return data;
  },
});

export default createSettingsSlice;
