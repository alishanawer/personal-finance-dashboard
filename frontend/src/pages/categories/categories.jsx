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
import { Plus, Edit, Trash } from "lucide-react";
import Layout from "@/components/layout";
import useStore from "@/store";

export default function CategoriesPage() {
  const categories = useStore((state) => state.categories);
  const fetchCategories = useStore((state) => state.fetchCategories);
  const addCategory = useStore((state) => state.addCategory);
  const updateCategory = useStore((state) => state.updateCategory);
  const deleteCategory = useStore((state) => state.deleteCategory);

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: "", type: "expense" });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        await fetchCategories();
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
  }, [fetchCategories]);

  const resetForm = () => {
    setForm({ name: "", type: "expense" });
    setEditingId(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setOpen(true);
  };

  const handleOpenEdit = (category) => {
    setEditingId(category.id);
    setForm({ name: category.name, type: category.type });
    setOpen(true);
  };

  const handleSave = async () => {
    setError(null);
    try {
      if (editingId) {
        await updateCategory(editingId, form);
      } else {
        await addCategory(form);
      }
      setOpen(false);
      resetForm();
    } catch (err) {
      setError(err?.detail || err?.message || "Failed to save category.");
    }
  };

  const handleDelete = async (id) => {
    setError(null);
    try {
      await deleteCategory(id);
    } catch (err) {
      setError(err?.detail || err?.message || "Failed to delete category.");
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
                    <TableHead>Type</TableHead>
                    <TableHead className="w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((cat) => (
                    <TableRow key={cat.id}>
                      <TableCell>{cat.name}</TableCell>
                      <TableCell className="capitalize">{cat.type}</TableCell>
                      <TableCell className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(cat)}>
                          <Edit size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(cat.id)}>
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
