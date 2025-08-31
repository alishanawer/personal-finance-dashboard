import api from "../../api/axios";
import qs from "qs";

const createAuthSlice = (set, get) => ({
  auth: {
    isAuthenticated: false,
    accessToken: null,
    user: null,
  },

  signup: async (credentials) => {
    try {
      const res = await api.post("/auth/signup", credentials);
      const { access_token } = res.data;

      set({
        auth: {
          isAuthenticated: true,
          accessToken: access_token,
          user: null,
        },
      });

      return res.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  login: async (credentials) => {
    try {
      // Backend expects form-data for login
      const res = await api.post(
        "/auth/login",
        qs.stringify({
          username: credentials.email, // OAuth2 expects "username"
          password: credentials.password,
        }),
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }
      );

      const { access_token } = res.data;

      set({
        auth: {
          isAuthenticated: true,
          accessToken: access_token,
          user: null,
        },
      });

      return res.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  logout: () =>
    set({
      auth: { isAuthenticated: false, accessToken: null, user: null },
    }),
});

export default createAuthSlice;
