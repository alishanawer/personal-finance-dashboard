import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  Briefcase,
  Bus,
  Car,
  Coffee,
  Gift,
  Heart,
  Home,
  Laptop,
  PiggyBank,
  Plane,
  Receipt,
  ShoppingCart,
  Utensils,
  Wallet,
  Plus,
  Edit,
  Trash,
} from "lucide-react";
import Layout from "@/components/layout";
import useStore from "@/store";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";

const COLOR_OPTIONS = [
  "#2563eb",
  "#16a34a",
  "#dc2626",
  "#f97316",
  "#7c3aed",
  "#0ea5e9",
  "#facc15",
  "#14b8a6",
  "#ef4444",
  "#6366f1",
  "#10b981",
  "#111827",
];

const ICON_OPTIONS = [
  { name: "", label: "None" },
  { name: "shopping-cart", label: "Shopping", icon: ShoppingCart },
  { name: "utensils", label: "Dining", icon: Utensils },
  { name: "car", label: "Car", icon: Car },
  { name: "home", label: "Home", icon: Home },
  { name: "wallet", label: "Wallet", icon: Wallet },
  { name: "receipt", label: "Bills", icon: Receipt },
  { name: "heart", label: "Health", icon: Heart },
  { name: "gift", label: "Gifts", icon: Gift },
  { name: "plane", label: "Travel", icon: Plane },
  { name: "coffee", label: "Coffee", icon: Coffee },
  { name: "laptop", label: "Tech", icon: Laptop },
  { name: "bus", label: "Transit", icon: Bus },
  { name: "briefcase", label: "Work", icon: Briefcase },
  { name: "piggy-bank", label: "Savings", icon: PiggyBank },
];

export default function CategoriesPage() {
  const categories = useStore((state) => state.categories);
  const categoryUsage = useStore((state) => state.categoryUsage);
  const fetchCategories = useStore((state) => state.fetchCategories);
  const fetchCategoryUsage = useStore((state) => state.fetchCategoryUsage);
  const addCategory = useStore((state) => state.addCategory);
  const updateCategory = useStore((state) => state.updateCategory);
  const deleteCategory = useStore((state) => state.deleteCategory);
  const mergeCategory = useStore((state) => state.mergeCategory);
  const settings = useStore((state) => state.settings);
  const fxRates = useStore((state) => state.fxRates);
  const baseCurrency = settings?.currency || "USD";
  const displayCurrency = settings?.display_currency || baseCurrency;

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    type: "expense",
    color: "#2563eb",
    icon: "",
  });
  const [mergeOpen, setMergeOpen] = useState(false);
  const [mergeSourceId, setMergeSourceId] = useState(null);
  const [mergeTargetId, setMergeTargetId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        await Promise.all([fetchCategories(), fetchCategoryUsage()]);
      } catch (err) {
        if (isMounted) {
          setError(err?.detail || err?.message || "Failed to load categories.");
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, [fetchCategories, fetchCategoryUsage]);

  const resetForm = () => {
    setForm({ name: "", type: "expense", color: "#2563eb", icon: "" });
    setEditingId(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setOpen(true);
  };

  const handleOpenEdit = (category) => {
    setEditingId(category.id);
    setForm({
      name: category.name,
      type: category.type,
      color: category.color || "#2563eb",
      icon: category.icon || "",
    });
    setOpen(true);
  };

  const handleSave = async () => {
    setError(null);
    try {
      if (editingId) {
        await updateCategory(editingId, form);
        toast.success("Category updated.");
      } else {
        await addCategory(form);
        toast.success("Category created.");
      }
      await fetchCategoryUsage();
      setOpen(false);
      resetForm();
    } catch (err) {
      setError(err?.detail || err?.message || "Failed to save category.");
      toast.error(err?.detail || err?.message || "Failed to save category.");
    }
  };

  const handleDelete = async (id) => {
    setError(null);
    try {
      await deleteCategory(id);
      toast.success("Category deleted.");
      await fetchCategoryUsage();
    } catch (err) {
      setError(err?.detail || err?.message || "Failed to delete category.");
      toast.error(err?.detail || err?.message || "Failed to delete category.");
    }
  };

  const handleOpenMerge = (category) => {
    setMergeSourceId(category.id);
    setMergeTargetId("");
    setMergeOpen(true);
  };

  const handleMerge = async () => {
    if (!mergeSourceId || !mergeTargetId) return;
    try {
      await mergeCategory(mergeSourceId, Number(mergeTargetId));
      toast.success("Categories merged.");
      setMergeOpen(false);
      setMergeSourceId(null);
      setMergeTargetId("");
      await Promise.all([fetchCategories(), fetchCategoryUsage()]);
    } catch (err) {
      setError(err?.detail || err?.message || "Failed to merge categories.");
      toast.error(err?.detail || err?.message || "Failed to merge categories.");
    }
  };

  return (
    <Layout>
      <div className="p-6">
        <Card className="shadow-md rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Categories</CardTitle>
            <Dialog open={open} onOpenChange={setOpen}>
              <Button
                className="flex items-center gap-2"
                onClick={handleOpenCreate}>
                <Plus size={16} /> Add Category
              </Button>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingId ? "Edit Category" : "Add Category"}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Category name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">
                      Pick an icon
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {ICON_OPTIONS.map((option) => {
                        const Icon = option.icon;
                        const isActive = form.icon === option.name;
                        return (
                          <Button
                            key={option.name || "none"}
                            type="button"
                            variant={isActive ? "default" : "outline"}
                            size="sm"
                            onClick={() =>
                              setForm({ ...form, icon: option.name })
                            }>
                            {Icon ? <Icon className="h-4 w-4" /> : option.label}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">
                      Pick a color
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {COLOR_OPTIONS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          className={`h-8 w-8 rounded-full border ${
                            form.color === color
                              ? "ring-2 ring-primary ring-offset-2"
                              : ""
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => setForm({ ...form, color })}
                          aria-label={`Select ${color}`}
                        />
                      ))}
                    </div>
                  </div>
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
                </div>
                <DialogFooter>
                  <Button onClick={handleSave} disabled={!form.name.trim()}>
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
                Loading categories...
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center text-gray-500 py-10">
                No categories yet. Create your first one!
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Color</TableHead>
                    <TableHead>Icon</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead className="w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((cat) => {
                    const usage = categoryUsage[cat.id];
                    const net = usage
                      ? (usage.income_total || 0) - (usage.expense_total || 0)
                      : 0;
                    return (
                      <TableRow key={cat.id}>
                        <TableCell>{cat.name}</TableCell>
                        <TableCell>
                          <span
                            className="inline-flex h-4 w-4 rounded-full border"
                            style={{ backgroundColor: cat.color || "#94a3b8" }}
                          />
                        </TableCell>
                        <TableCell>
                          {cat.icon
                            ? (() => {
                                const match = ICON_OPTIONS.find(
                                  (option) => option.name === cat.icon,
                                );
                                const Icon = match?.icon;
                                return Icon ? (
                                  <Icon className="h-4 w-4" />
                                ) : (
                                  cat.icon
                                );
                              })()
                            : "-"}
                        </TableCell>
                        <TableCell className="capitalize">{cat.type}</TableCell>
                        <TableCell>
                          {usage ? (
                            <div className="text-sm text-muted-foreground">
                              {usage.transaction_count} tx ·{" "}
                              {formatCurrency(net, displayCurrency, {
                                rates: fxRates,
                                baseCurrency,
                              })}
                            </div>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEdit(cat)}>
                            <Edit size={16} />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenMerge(cat)}>
                            Merge
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(cat.id)}>
                            <Trash size={16} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
        <Dialog open={mergeOpen} onOpenChange={setMergeOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Merge Category</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Transactions from the source category will be moved to the
                target, then the source will be removed.
              </div>
              <Select
                value={mergeTargetId}
                onValueChange={(val) => setMergeTargetId(val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select target category" />
                </SelectTrigger>
                <SelectContent>
                  {categories
                    .filter((cat) => cat.id !== mergeSourceId)
                    .map((cat) => (
                      <SelectItem key={cat.id} value={String(cat.id)}>
                        {cat.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button onClick={handleMerge} disabled={!mergeTargetId}>
                Merge
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
