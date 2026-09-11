import { useState } from "react";
import { Plus, Pencil, Trash2, RotateCcw, Tag } from "lucide-react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

const Categories = () => {
  const { data, addCategory, renameCategory, deleteCategory, resetData } =
    useStore();
  const [open, setOpen] = useState(false);
  const [editName, setEditName] = useState<string | null>(null);
  const [name, setName] = useState("");

  const openNew = () => {
    setEditName(null);
    setName("");
    setOpen(true);
  };

  const openEdit = (cat: string) => {
    setEditName(cat);
    setName(cat);
    setOpen(true);
  };

  const handleSubmit = () => {
    const n = name.trim();
    if (!n) return;
    if (editName) {
      renameCategory(editName, n);
      toast.success("Category renamed");
    } else {
      addCategory(n);
      toast.success("Category added");
    }
    setOpen(false);
  };

  const handleDelete = (cat: string) => {
    if (
      confirm(
        `"${cat}" Category Delete? Beneficiary/Work Category        ।`,
      )
    ) {
      deleteCategory(cat);
      toast.success("Category deleted");
    }
  };

  const handleReset = () => {
    if (
      confirm(
        "    (seed)   ?  undo   ।",
      )
    ) {
      resetData();
      toast.success("Data reset to seed");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">
            Categories / Category
          </h1>
          <p className="text-sm text-muted-foreground">
            Service Category 
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleReset}
            className="text-destructive"
          >
            <RotateCcw className="h-4 w-4" /> Reset Data
          </Button>
          <Button
            onClick={openNew}
            className="gradient-primary text-primary-foreground"
          >
            <Plus className="h-4 w-4" /> Add Category
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {data.categories.map((cat) => {
          const count = data.works.filter((w) => w.category === cat).length;
          const clientCount = data.clients.filter(
            (c) => c.category === cat,
          ).length;
          return (
            <div key={cat} className="card-surface card-surface-hover p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-secondary p-2 text-primary">
                    <Tag className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-semibold">{cat}</p>
                    <p className="text-xs text-muted-foreground">
                      {count} works · {clientCount} clients
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => openEdit(cat)}
                    className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(cat)}
                    className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editName ? "Edit Category" : "New Category"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-1.5 py-2">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Category name"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="gradient-primary text-primary-foreground"
            >
              {editName ? "Save" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Categories;
