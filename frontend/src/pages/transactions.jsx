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
import { Plus, Edit, Trash } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

export default function TransactionsPage() {
  const transactions = useStore((state) => state.transactions);
  const fetchTransactions = useStore((state) => state.fetchTransactions);
  const transactionsMeta = useStore((state) => state.transactionsMeta);
  const addTransaction = useStore((state) => state.addTransaction);
  const updateTransaction = useStore((state) => state.updateTransaction);
  const deleteTransaction = useStore((state) => state.deleteTransaction);
  const categories = useStore((state) => state.categories);
  const fetchCategories = useStore((state) => state.fetchCategories);
  const currency = useStore((state) => state.settings?.currency || "USD");

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
      <div className="p-6">
        <Card className="shadow-md rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Transactions</CardTitle>
            <Dialog open={open} onOpenChange={setOpen}>
              <Button
                className="flex items-center gap-2"
                onClick={handleOpenCreate}>
                <Plus size={16} /> Add Transaction
              </Button>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingId ? "Edit Transaction" : "Add Transaction"}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
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
                    onClick={handleSave}
                    disabled={!form.amount || Number(form.amount) <= 0}>
                    Save
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <div className="mb-6 grid gap-3 lg:grid-cols-6">
              <Input
                placeholder="Search description"
                value={filters.q}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, q: e.target.value }))
                }
              />
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
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, endDate: e.target.value }))
                }
              />
              <div className="flex flex-wrap gap-2">
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Min"
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
                  placeholder="Max"
                  value={filters.maxAmount}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      maxAmount: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="flex flex-wrap items-center gap-2 lg:col-span-2">
                <Select
                  value={String(pageSize)}
                  onValueChange={(val) => {
                    setPageSize(Number(val));
                    setPage(1);
                  }}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Rows" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 rows</SelectItem>
                    <SelectItem value="20">20 rows</SelectItem>
                    <SelectItem value="50">50 rows</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="secondary" onClick={handleApplyFilters}>
                  Apply
                </Button>
                <Button variant="ghost" onClick={handleResetFilters}>
                  Reset
                </Button>
              </div>
            </div>
            {error ? (
              <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            ) : null}
            {isLoading ? (
              <div className="text-center text-muted-foreground py-10">
                Loading transactions...
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center text-muted-foreground py-10">
                No transactions yet. Add your first one!
              </div>
            ) : (
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="w-24">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell>
                          {tx.date
                            ? new Date(tx.date).toLocaleDateString()
                            : "-"}
                        </TableCell>
                        <TableCell>{tx.description || "-"}</TableCell>
                        <TableCell>
                          {tx.category_id
                            ? categoryLookup[tx.category_id] || "-"
                            : "-"}
                        </TableCell>
                        <TableCell className="capitalize">{tx.type}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(tx.amount, currency)}
                        </TableCell>
                        <TableCell className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEdit(tx)}>
                            <Edit size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(tx.id)}>
                            <Trash size={16} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
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
                      Prev
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
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
