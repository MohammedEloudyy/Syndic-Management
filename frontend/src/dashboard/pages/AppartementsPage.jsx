import { useMemo, useState } from "react";
import { Building2, Home, Pencil, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { mockAppartements, mockImmeubles } from "@/dashboard/mockData";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
  number: z.string().min(1, "Numéro requis"),
  buildingId: z.string().min(1, "Immeuble requis"),
  floor: z.coerce.number().min(0),
  surface: z.coerce.number().min(0),
  rooms: z.coerce.number().min(0),
  status: z.enum(["occupé", "vacant"]),
});

let idSeq = 1;

export function AppartementsPage() {
  const [items, setItems] = useState(mockAppartements);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(true);

  const buildingsById = useMemo(() => {
    const map = new Map(mockImmeubles.map((b) => [b.id, b]));
    return map;
  }, []);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      number: "",
      buildingId: "",
      floor: 0,
      surface: 0,
      rooms: 0,
      status: "occupé",
    },
  });

  const resetForm = (data) => {
    form.reset({
      number: data?.number ?? "",
      buildingId: data?.buildingId ?? (mockImmeubles[0]?.id ?? ""),
      floor: data?.floor ?? 0,
      surface: data?.surface ?? 0,
      rooms: data?.rooms ?? 0,
      status: data?.status ?? "occupé",
    });
  };

  const onEdit = (item) => {
    setEditingId(item.id);
    setShowForm(true);
    resetForm(item);
  };

  const onDelete = (id) => {
    const ok = window.confirm("Supprimer cet appartement ?");
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
                number: values.number,
                buildingId: values.buildingId,
                floor: values.floor,
                surface: values.surface,
                rooms: values.rooms,
                status: values.status,
              }
            : i,
        ),
      );
    } else {
      const newItem = {
        id: `ap_${idSeq++}`,
        number: values.number,
        buildingId: values.buildingId,
        floor: values.floor,
        surface: values.surface,
        rooms: values.rooms,
        status: values.status,
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
        title="Gestion des appartements"
        description="Gérez tous vos appartements"
        onAdd={() => setShowForm((v) => !v)}
      />

      {showForm ? (
        <Card className="mb-5">
          <CardContent className="p-6">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <div className="text-sm font-semibold text-muted-foreground">
                Nouvel appartement
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Numéro
                  </label>
                  <Input
                    placeholder="A101"
                    {...form.register("number")}
                    aria-invalid={!!form.formState.errors.number}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Immeuble
                  </label>
                  <select
                    className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
                    {...form.register("buildingId")}
                  >
                    {mockImmeubles.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Étage
                  </label>
                  <Input
                    type="number"
                    placeholder="1"
                    {...form.register("floor")}
                    aria-invalid={!!form.formState.errors.floor}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Surface (m²)
                  </label>
                  <Input
                    type="number"
                    placeholder="65"
                    {...form.register("surface")}
                    aria-invalid={!!form.formState.errors.surface}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Pièces
                  </label>
                  <Input
                    type="number"
                    placeholder="3"
                    {...form.register("rooms")}
                    aria-invalid={!!form.formState.errors.rooms}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Statut
                  </label>
                  <select
                    className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
                    {...form.register("status")}
                  >
                    <option value="occupé">occupé</option>
                    <option value="vacant">vacant</option>
                  </select>
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
                <TableHead>APPARTEMENT</TableHead>
                <TableHead>IMMEUBLE</TableHead>
                <TableHead>ÉTAGE</TableHead>
                <TableHead className="text-right">SURFACE</TableHead>
                <TableHead className="text-right">PIÈCES</TableHead>
                <TableHead>STATUT</TableHead>
                <TableHead className="w-[120px] text-right">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableRows.map((item) => {
                const building = buildingsById.get(item.buildingId);
                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Home className="h-4 w-4 text-blue-700" />
                        <span className="font-medium">{item.number}</span>
                      </div>
                    </TableCell>
                    <TableCell>{building?.name ?? "-"}</TableCell>
                    <TableCell>{item.floor}</TableCell>
                    <TableCell className="text-right">{item.surface} m²</TableCell>
                    <TableCell className="text-right">{item.rooms}</TableCell>
                    <TableCell>
                      <StatusBadge status={item.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          type="button"
                          className="text-blue-700 hover:text-blue-800"
                          onClick={() => onEdit(item)}
                          aria-label={`Edit ${item.number}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => onDelete(item.id)}
                          aria-label={`Delete ${item.number}`}
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

