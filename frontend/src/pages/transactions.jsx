import { useEffect, useMemo, useState } from "react";
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

export default function TransactionsPage() {
  const transactions = useStore((state) => state.transactions);
  const fetchTransactions = useStore((state) => state.fetchTransactions);
  const addTransaction = useStore((state) => state.addTransaction);
  const updateTransaction = useStore((state) => state.updateTransaction);
  const deleteTransaction = useStore((state) => state.deleteTransaction);
  const categories = useStore((state) => state.categories);
  const fetchCategories = useStore((state) => state.fetchCategories);

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
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
      setIsLoading(true);
      setError(null);
      try {
        await Promise.all([fetchTransactions(), fetchCategories()]);
      } catch (err) {
        if (isMounted) {
          setError(
            err?.detail || err?.message || "Failed to load transactions.",
          );
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, [fetchTransactions, fetchCategories]);

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
      } else {
        await addTransaction(payload);
      }
      setOpen(false);
      resetForm();
    } catch (err) {
      setError(err?.detail || err?.message || "Failed to save transaction.");
    }
  };

  const handleDelete = async (transactionId) => {
    setError(null);
    try {
      await deleteTransaction(transactionId);
    } catch (err) {
      setError(err?.detail || err?.message || "Failed to delete transaction.");
    }
  };

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
                        {tx.date ? new Date(tx.date).toLocaleDateString() : "-"}
                      </TableCell>
                      <TableCell>{tx.description || "-"}</TableCell>
                      <TableCell>
                        {tx.category_id
                          ? categoryLookup[tx.category_id] || "-"
                          : "-"}
                      </TableCell>
                      <TableCell className="capitalize">{tx.type}</TableCell>
                      <TableCell className="text-right">
                        {tx.amount.toFixed(2)}
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
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
