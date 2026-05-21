import { useCallback, useEffect, useMemo, useState } from "react";
import Layout from "@/components/layout";
import useStore from "@/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { LoadingState } from "@/components/loading-state";
import { EmptyState } from "@/components/empty-state";

export default function TransactionsPage() {
  const transactions = useStore((state) => state.transactions);
  const fetchTransactions = useStore((state) => state.fetchTransactions);
  const transactionsMeta = useStore((state) => state.transactionsMeta);
  const addTransaction = useStore((state) => state.addTransaction);
  const updateTransaction = useStore((state) => state.updateTransaction);
  const deleteTransaction = useStore((state) => state.deleteTransaction);
  const categories = useStore((state) => state.categories);
  const fetchCategories = useStore((state) => state.fetchCategories);
  const settings = useStore((state) => state.settings);
  const fxRates = useStore((state) => state.fxRates);
  const baseCurrency = settings?.currency || "USD";
  const displayCurrency = settings?.display_currency || baseCurrency;

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filters, setFilters] = useState({
    q: "",
    txType: "all",
    categoryId: "all",
    startDate: "",
    endDate: "",
    minAmount: "",
    maxAmount: "",
  });
  const [appliedFilters, setAppliedFilters] = useState({
    q: "",
    txType: "all",
    categoryId: "all",
    startDate: "",
    endDate: "",
    minAmount: "",
    maxAmount: "",
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [form, setForm] = useState({
    amount: "",
    type: "expense",
    categoryId: "",
    description: "",
    date: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        await fetchCategories();
      } catch (err) {
        if (isMounted) {
          setError(err?.detail || err?.message || "Failed to load categories.");
        }
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, [fetchCategories]);

  const buildQueryParams = useCallback(
    (nextFilters, nextPage, nextPageSize) => {
      const params = {};
      if (nextFilters.q) params.q = nextFilters.q;
      if (nextFilters.txType !== "all") params.tx_type = nextFilters.txType;
      if (nextFilters.categoryId !== "all") {
        params.category_id = Number(nextFilters.categoryId);
      }
      if (nextFilters.startDate) {
        params.start_date = new Date(nextFilters.startDate).toISOString();
      }
      if (nextFilters.endDate) {
        params.end_date = new Date(nextFilters.endDate).toISOString();
      }
      if (nextFilters.minAmount)
        params.min_amount = Number(nextFilters.minAmount);
      if (nextFilters.maxAmount)
        params.max_amount = Number(nextFilters.maxAmount);

      if (nextPage && nextPageSize) {
        params.page = nextPage;
        params.page_size = nextPageSize;
      }

      return params;
    },
    [],
  );

  const loadTransactions = useCallback(
    async (
      nextFilters = appliedFilters,
      nextPage = page,
      nextPageSize = pageSize,
    ) => {
      setIsLoading(true);
      setError(null);
      try {
        await fetchTransactions(
          buildQueryParams(nextFilters, nextPage, nextPageSize),
        );
      } catch (err) {
        setError(err?.detail || err?.message || "Failed to load transactions.");
      } finally {
        setIsLoading(false);
      }
    },
    [appliedFilters, buildQueryParams, fetchTransactions, page, pageSize],
  );

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      if (!isMounted) return;
      await loadTransactions(appliedFilters, page, pageSize);
    };
    load();
    return () => {
      isMounted = false;
    };
  }, [appliedFilters, loadTransactions, page, pageSize]);

  const categoryLookup = useMemo(() => {
    return categories.reduce((acc, category) => {
      acc[category.id] = category.name;
      return acc;
    }, {});
  }, [categories]);

  const resetForm = () => {
    setForm({
      amount: "",
      type: "expense",
      categoryId: "",
      description: "",
      date: "",
    });
    setEditingId(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setOpen(true);
  };

  const handleOpenEdit = (tx) => {
    setEditingId(tx.id);
    setForm({
      amount: String(tx.amount ?? ""),
      type: tx.type,
      categoryId: tx.category_id ? String(tx.category_id) : "",
      description: tx.description ?? "",
      date: tx.date ? new Date(tx.date).toISOString().slice(0, 10) : "",
    });
    setOpen(true);
  };

  const handleSave = async () => {
    setError(null);
    const payload = {
      amount: Number(form.amount),
      type: form.type,
      description: form.description?.trim() || null,
      category_id: form.categoryId ? Number(form.categoryId) : null,
      date: form.date ? new Date(form.date).toISOString() : null,
    };

    try {
      if (editingId) {
        await updateTransaction(editingId, payload);
        toast.success("Transaction updated.");
      } else {
        await addTransaction(payload);
        toast.success("Transaction added.");
      }
      setOpen(false);
      resetForm();
      await loadTransactions();
    } catch (err) {
      setError(err?.detail || err?.message || "Failed to save transaction.");
      toast.error(err?.detail || err?.message || "Failed to save transaction.");
    }
  };

  const handleDelete = async (transactionId) => {
    setError(null);
    try {
      await deleteTransaction(transactionId);
      toast.success("Transaction deleted.");
      await loadTransactions();
    } catch (err) {
      setError(err?.detail || err?.message || "Failed to delete transaction.");
      toast.error(
        err?.detail || err?.message || "Failed to delete transaction.",
      );
    }
  };

  const handleApplyFilters = () => {
    setAppliedFilters(filters);
    setPage(1);
  };

  const handleResetFilters = () => {
    const nextFilters = {
      q: "",
      txType: "all",
      categoryId: "all",
      startDate: "",
      endDate: "",
      minAmount: "",
      maxAmount: "",
    };
    setFilters(nextFilters);
    setAppliedFilters(nextFilters);
    setPage(1);
  };

  const totalPages = transactionsMeta
    ? Math.max(1, Math.ceil(transactionsMeta.total / transactionsMeta.pageSize))
    : 1;

  return (
    <Layout>
      <div className="space-y-6">
        <PageHeader
          title="Transactions"
          subtitle="Track all your income and expenses"
          actions={
            <Dialog open={open} onOpenChange={setOpen}>
              <Button
                className="gap-2"
                onClick={handleOpenCreate}>
                <Plus size={18} /> Add Transaction
              </Button>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingId ? "Edit Transaction" : "Add Transaction"}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Amount"
                    value={form.amount}
                    onChange={(e) =>
                      setForm({ ...form, amount: e.target.value })
                    }
                  />
                  <Select
                    value={form.type}
                    onValueChange={(val) => setForm({ ...form, type: val })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={form.categoryId}
                    onValueChange={(val) =>
                      setForm({ ...form, categoryId: val })
                    }>
                    <SelectTrigger>
                      <SelectValue placeholder="Category (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem
                          key={category.id}
                          value={String(category.id)}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Description"
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                  />
                  <Input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                  />
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={!form.amount || Number(form.amount) <= 0}>
                    {editingId ? "Update" : "Create"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          }
        />

        {error ? (
          <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Filter Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex items-center gap-2">
                <Search size={16} className="text-muted-foreground" />
                <Input
                  placeholder="Search description"
                  value={filters.q}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, q: e.target.value }))
                  }
                  className="flex-1"
                />
              </div>
              <Select
                value={filters.txType}
                onValueChange={(val) =>
                  setFilters((prev) => ({ ...prev, txType: val }))
                }>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={filters.categoryId}
                onValueChange={(val) =>
                  setFilters((prev) => ({ ...prev, categoryId: val }))
                }>
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={String(category.id)}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, startDate: e.target.value }))
                }
              />
            </div>
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mt-3">
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, endDate: e.target.value }))
                }
              />
              <div className="flex gap-2">
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Min amount"
                  value={filters.minAmount}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      minAmount: e.target.value,
                    }))
                  }
                />
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Max amount"
                  value={filters.maxAmount}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      maxAmount: e.target.value,
                    }))
                  }
                />
              </div>
              <Select
                value={String(pageSize)}
                onValueChange={(val) => {
                  setPageSize(Number(val));
                  setPage(1);
                }}>
                <SelectTrigger>
                  <SelectValue placeholder="Rows per page" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 rows</SelectItem>
                  <SelectItem value="20">20 rows</SelectItem>
                  <SelectItem value="50">50 rows</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Button
                  variant="default"
                  onClick={handleApplyFilters}
                  className="flex-1">
                  Apply
                </Button>
                <Button
                  variant="outline"
                  onClick={handleResetFilters}
                  className="flex-1">
                  Reset
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <LoadingState message="Loading transactions..." />
        ) : transactions.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No transactions yet"
            description="Start tracking your finances by adding your first transaction."
            actionLabel="Add Transaction"
            action={handleOpenCreate}
          />
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-24">Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="w-32">Category</TableHead>
                      <TableHead className="w-24">Type</TableHead>
                      <TableHead className="text-right w-32">Amount</TableHead>
                      <TableHead className="w-24 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((tx) => (
                      <TableRow key={tx.id} className="hover:bg-accent/30">
                        <TableCell className="font-medium text-sm">
                          {tx.date
                            ? new Date(tx.date).toLocaleDateString()
                            : "-"}
                        </TableCell>
                        <TableCell className="text-sm">{tx.description || "-"}</TableCell>
                        <TableCell className="text-sm">
                          {tx.category_id
                            ? categoryLookup[tx.category_id] || "-"
                            : "-"}
                        </TableCell>
                        <TableCell className="capitalize text-sm">
                          <span
                            className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                              tx.type === "income"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                            }`}>
                            {tx.type}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-semibold text-sm">
                          <span
                            className={
                              tx.type === "income"
                                ? "text-green-600 dark:text-green-400"
                                : "text-red-600 dark:text-red-400"
                            }>
                            {formatCurrency(tx.amount, displayCurrency, {
                              rates: fxRates,
                              baseCurrency,
                            })}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenEdit(tx)}
                              className="h-8 w-8 p-0">
                              <Edit size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(tx.id)}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive">
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {transactions.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t text-sm text-muted-foreground">
                  <div>
                    {transactionsMeta
                      ? `Page ${transactionsMeta.page} of ${totalPages}`
                      : "Showing all results"}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage((prev) => Math.max(1, prev - 1))}>
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= totalPages}
                      onClick={() =>
                        setPage((prev) => Math.min(totalPages, prev + 1))
                      }>
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
