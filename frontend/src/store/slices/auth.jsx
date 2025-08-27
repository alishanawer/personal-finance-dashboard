const createAuthSlice = (set, get) => ({
  auth: {
    isAuthenticated: false,
    accessToken: null,
    user: null,
  },

  login: async (credentials) => {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    const data = await res.json();

    set({
      auth: {
        isAuthenticated: true,
        accessToken: data.accessToken,
        user: data.user,
      },
    });
  },

  logout: () =>
    set({
      auth: { isAuthenticated: false, accessToken: null, user: null },
    }),
});

export default createAuthSlice;
