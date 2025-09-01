import api from "../../api/axios";
import qs from "qs";

function parseJwt(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

function isTokenExpired(token) {
  const payload = parseJwt(token);
  if (!payload || !payload.exp) return true; // treat unknown token as expired
  return payload.exp * 1000 < Date.now();
}

const createAuthSlice = (set, get) => ({
  auth: {
    isAuthenticated: false,
    accessToken: null,
    user: null,
    rehydrated: false,
  },

  signup: async (credentials) => {
    try {
      const res = await api.post("/auth/signup", credentials);
      const { access_token, user } = res.data;

      // persist to localStorage
      localStorage.setItem("accessToken", access_token);
      localStorage.setItem("user", JSON.stringify(user));

      // set default auth header
      api.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;

      // update state
      set({
        auth: {
          isAuthenticated: true,
          accessToken: access_token,
          user,
          rehydrated: true,
        },
      });

      return res.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  login: async (credentials) => {
    try {
      const res = await api.post(
        "/auth/login",
        qs.stringify({
          username: credentials.email,
          password: credentials.password,
        }),
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }
      );

      const { access_token, user } = res.data;

      localStorage.setItem("accessToken", access_token);
      localStorage.setItem("user", JSON.stringify(user));

      api.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;

      set({
        auth: {
          isAuthenticated: true,
          accessToken: access_token,
          user,
          rehydrated: true,
        },
      });

      return res.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  logout: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    delete api.defaults.headers.common["Authorization"];
    set({
      auth: {
        isAuthenticated: false,
        accessToken: null,
        user: null,
        rehydrated: true,
      },
    });
  },

  rehydrateAuth: () => {
    const token = localStorage.getItem("accessToken");
    const userRaw = localStorage.getItem("user");

    if (token && !isTokenExpired(token)) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      set({
        auth: {
          isAuthenticated: true,
          accessToken: token,
          user: userRaw ? JSON.parse(userRaw) : null,
          rehydrated: true,
        },
      });
    } else {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      delete api.defaults.headers.common["Authorization"];
      set({
        auth: {
          isAuthenticated: false,
          accessToken: null,
          user: null,
          rehydrated: true,
        },
      });
    }
  },
});

export default createAuthSlice;
