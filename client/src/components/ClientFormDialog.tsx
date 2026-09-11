import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useStore } from "@/lib/store";
import type { Contact } from "@/lib/types";
import { uid } from "@/lib/format";
import { Plus, Trash2 } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editId?: string | null;
}

const emptyContact = (): Contact => ({
  id: uid("ct"),
  name: "",
  role: "",
  phone: "",
  email: "",
});

export function ClientFormDialog({ open, onOpenChange, editId }: Props) {
  const { data, addClient, updateClient } = useStore();
  const editing = editId ? data.clients.find((c) => c.id === editId) : null;

  const [name, setName] = useState(editing?.name ?? "");
  const [businessName, setBusinessName] = useState(editing?.businessName ?? "");
  const [category, setCategory] = useState(
    editing?.category ?? data.categories[0] ?? "",
  );
  const [notes, setNotes] = useState(editing?.notes ?? "");
  const [contacts, setContacts] = useState<Contact[]>(
    editing?.contacts ?? [emptyContact()],
  );

  const updateContact = (id: string, patch: Partial<Contact>) =>
    setContacts((cs) => cs.map((c) => (c.id === id ? { ...c, ...patch } : c)));

  const handleSubmit = () => {
    if (!name.trim()) return;
    const cleanContacts = contacts.filter(
      (c) => c.name.trim() || c.phone.trim(),
    );
    if (editing) {
      updateClient(editing.id, {
        name,
        businessName,
        category,
        notes,
        contacts: cleanContacts,
        type: "Regular",
        address: "",
        rating: 0,
      });
    } else {
      addClient({
        name,
        businessName,
        category,
        notes,
        contacts: cleanContacts,
        type: "Regular",
        address: "",
        rating: 0,
      });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {editing ? "Edit Client" : "New Client / New Beneficiary"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Name / Name *</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Client name"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Business Name / Business Name</Label>
              <Input
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Category / Category</Label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            >
              {data.categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Contacts / Contacts</Label>
              <button
                type="button"
                onClick={() => setContacts((cs) => [...cs, emptyContact()])}
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <Plus className="h-3 w-3" /> Add
              </button>
            </div>
            <div className="space-y-3">
              {contacts.map((ct) => (
                <div
                  key={ct.id}
                  className="rounded-lg border border-border p-3"
                >
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Input
                      placeholder="Name"
                      value={ct.name}
                      onChange={(e) =>
                        updateContact(ct.id, { name: e.target.value })
                      }
                    />
                    <Input
                      placeholder="Role"
                      value={ct.role}
                      onChange={(e) =>
                        updateContact(ct.id, { role: e.target.value })
                      }
                    />
                    <Input
                      placeholder="Phone"
                      value={ct.phone}
                      onChange={(e) =>
                        updateContact(ct.id, { phone: e.target.value })
                      }
                    />
                    <Input
                      placeholder="Email"
                      value={ct.email}
                      onChange={(e) =>
                        updateContact(ct.id, { email: e.target.value })
                      }
                    />
                  </div>
                  {contacts.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        setContacts((cs) => cs.filter((c) => c.id !== ct.id))
                      }
                      className="mt-2 inline-flex items-center gap-1 text-xs text-destructive hover:underline"
                    >
                      <Trash2 className="h-3 w-3" /> Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Notes / Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="gradient-primary text-primary-foreground"
          >
            {editing ? "Save Changes" : "Add Client"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
