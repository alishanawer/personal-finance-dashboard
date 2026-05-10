import api from "../../api/axios";

const createTransactionsSlice = (set, get) => ({
  transactions: [],
  transactionsMeta: null,

  fetchTransactions: async (params = {}) => {
    const res = await api.get("/transactions/", { params });
    const total = res.headers["x-total-count"]
      ? Number(res.headers["x-total-count"])
      : null;
    const page = res.headers["x-page"] ? Number(res.headers["x-page"]) : null;
    const pageSize = res.headers["x-page-size"]
      ? Number(res.headers["x-page-size"])
      : null;

    set({
      transactions: res.data,
      transactionsMeta:
        total !== null && page !== null && pageSize !== null
          ? { total, page, pageSize }
          : null,
    });
  },

  addTransaction: async (tx) => {
    const res = await api.post("/transactions/", tx);
    set((state) => ({
      transactions: [...state.transactions, res.data],
    }));
    return res.data;
  },

  updateTransaction: async (transactionId, updates) => {
    const res = await api.put(`/transactions/${transactionId}`, updates);
    set((state) => ({
      transactions: state.transactions.map((item) =>
        item.id === transactionId ? res.data : item,
      ),
    }));
    return res.data;
  },

  deleteTransaction: async (transactionId) => {
    await api.delete(`/transactions/${transactionId}`);
    set((state) => ({
      transactions: state.transactions.filter(
        (item) => item.id !== transactionId,
      ),
    }));
  },
});

export default createTransactionsSlice;
