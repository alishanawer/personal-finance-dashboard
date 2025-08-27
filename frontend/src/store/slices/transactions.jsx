const createTransactionsSlice = (set, get) => ({
  transactions: [],

  fetchTransactions: async () => {
    const res = await fetch("/api/transactions");
    const data = await res.json();
    set({ transactions: data });
  },

  addTransaction: async (tx) => {
    set((state) => ({
      transactions: [...state.transactions, tx],
    }));
    await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tx),
    });
  },
});

export default createTransactionsSlice;
