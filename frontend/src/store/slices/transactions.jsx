import api from "../../api/axios";

const createTransactionsSlice = (set, get) => ({
  transactions: [],

  fetchTransactions: async () => {
    const res = await api.get("/transactions/");
    set({ transactions: res.data });
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
