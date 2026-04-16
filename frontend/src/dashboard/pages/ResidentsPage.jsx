import { useMemo, useState } from "react";
import { Mail, Phone, Pencil, Plus, Trash2, UserRound } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { mockAppartements, mockImmeubles, mockResidents } from "@/dashboard/mockData";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
  fullName: z.string().min(2, "Nom requis"),
  email: z.string().email("Email invalide"),
  phone: z.string().min(5, "Téléphone requis"),
  apartmentId: z.string().min(1, "Appartement requis"),
  entryDate: z.string().min(6, "Date requise"),
});

let idSeq = 1;

export function ResidentsPage() {
  const [items, setItems] = useState(mockResidents);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(true);

  const appartementsById = useMemo(() => {
    const map = new Map(mockAppartements.map((a) => [a.id, a]));
    return map;
  }, []);

  const immeublesById = useMemo(() => {
    const map = new Map(mockImmeubles.map((i) => [i.id, i]));
    return map;
  }, []);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      apartmentId: mockAppartements[0]?.id ?? "",
      entryDate: "",
    },
  });

  const resetForm = (data) => {
    form.reset({
      fullName: data?.fullName ?? "",
      email: data?.email ?? "",
      phone: data?.phone ?? "",
      apartmentId: data?.apartmentId ?? (mockAppartements[0]?.id ?? ""),
      entryDate: data?.entryDate ?? "",
    });
  };

  const onEdit = (item) => {
    setEditingId(item.id);
    setShowForm(true);
    resetForm(item);
  };

  const onDelete = (id) => {
    const ok = window.confirm("Supprimer ce résident ?");
    if (!ok) return;
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const onSubmit = (values) => {
    if (editingId) {
      setItems((prev) =>
        prev.map((i) =>
          i.id === editingId
            ? {
                ...i,
                fullName: values.fullName,
                email: values.email,
                phone: values.phone,
                apartmentId: values.apartmentId,
                entryDate: values.entryDate,
              }
            : i,
        ),
      );
    } else {
      const newItem = {
        id: `r_${idSeq++}`,
        fullName: values.fullName,
        email: values.email,
        phone: values.phone,
        apartmentId: values.apartmentId,
        entryDate: values.entryDate,
      };
      setItems((prev) => [newItem, ...prev]);
    }
    setEditingId(null);
    resetForm(null);
    setShowForm(true);
  };

  const isSubmitting = form.formState.isSubmitting;
  const tableRows = useMemo(() => items, [items]);

  return (
    <div className="pb-2">
      <PageHeader
        title="Gestion des résidents"
        description="Gérez tous vos résidents"
        onAdd={() => setShowForm((v) => !v)}
      />

      {showForm ? (
        <Card className="mb-5">
          <CardContent className="p-6">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <div className="text-sm font-semibold text-muted-foreground">
                Nouvel résident
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Nom complet</label>
                  <Input placeholder="Jean Dupont" {...form.register("fullName")} aria-invalid={!!form.formState.errors.fullName} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Email</label>
                  <Input placeholder="jean@email.com" {...form.register("email")} aria-invalid={!!form.formState.errors.email} />
                </div>

                <div className="space-y-2 md:col-span-1">
                  <label className="text-sm font-medium text-foreground">Téléphone</label>
                  <Input placeholder="06 12 34 56 78" {...form.register("phone")} aria-invalid={!!form.formState.errors.phone} />
                </div>

                <div className="space-y-2 md:col-span-1">
                  <label className="text-sm font-medium text-foreground">Associer à un appartement</label>
                  <select
                    className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
                    {...form.register("apartmentId")}
                  >
                    {mockAppartements.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.number} - étage {a.floor}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-foreground">Date d&apos;entrée</label>
                  <Input placeholder="mm/dd/yyyy" {...form.register("entryDate")} aria-invalid={!!form.formState.errors.entryDate} />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button type="submit" disabled={isSubmitting}>
                  Enregistrer
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={isSubmitting}
                  onClick={() => {
                    setEditingId(null);
                    resetForm(null);
                  }}
                >
                  Annuler
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>RÉSIDENT</TableHead>
                <TableHead>CONTACT</TableHead>
                <TableHead>APPARTEMENT</TableHead>
                <TableHead>IMMEUBLE</TableHead>
                <TableHead>DATE D&apos;ENTRÉE</TableHead>
                <TableHead className="w-[120px] text-right">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableRows.map((r) => {
                const apt = appartementsById.get(r.apartmentId);
                const building = apt ? immeublesById.get(apt.buildingId) : null;
                return (
                  <TableRow key={r.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <UserRound className="h-4 w-4 text-blue-700" />
                        <span className="font-medium">{r.fullName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Mail className="h-3.5 w-3.5" />
                          {r.email}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Phone className="h-3.5 w-3.5" />
                          {r.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{apt?.number ?? "-"}</TableCell>
                    <TableCell>{building?.name ?? "-"}</TableCell>
                    <TableCell>{r.entryDate}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          type="button"
                          className="text-blue-700 hover:text-blue-800"
                          onClick={() => onEdit(r)}
                          aria-label={`Edit ${r.fullName}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => onDelete(r.id)}
                          aria-label={`Delete ${r.fullName}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

