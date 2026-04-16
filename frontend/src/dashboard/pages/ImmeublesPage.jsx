import { useMemo, useState } from "react";
import { Pencil, Trash2, MapPin, Building2 } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { mockImmeubles } from "@/dashboard/mockData";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
  name: z.string().min(2, "Nom requis"),
  address: z.string().min(2, "Adresse requise"),
  city: z.string().min(2, "Ville requise"),
  apartmentCount: z.coerce.number().min(0),
});

let idSeq = 1;

export function ImmeublesPage() {
  const [items, setItems] = useState(mockImmeubles);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(true);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      address: "",
      city: "",
      apartmentCount: 0,
    },
  });

  const resetForm = (data) => {
    form.reset({
      name: data?.name ?? "",
      address: data?.address ?? "",
      city: data?.city ?? "",
      apartmentCount: data?.apartmentCount ?? 0,
    });
  };

  const onEdit = (item) => {
    setEditingId(item.id);
    setShowForm(true);
    resetForm(item);
  };

  const onDelete = (id) => {
    const ok = window.confirm("Supprimer cet immeuble ?");
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
                name: values.name,
                address: values.address,
                city: values.city,
                apartmentCount: values.apartmentCount,
              }
            : i,
        ),
      );
    } else {
      const newItem = {
        id: `im_${idSeq++}`,
        name: values.name,
        address: values.address,
        city: values.city,
        apartmentCount: values.apartmentCount,
      };
      setItems((prev) => [newItem, ...prev]);
    }
    setEditingId(null);
    setShowForm(true);
    resetForm(null);
  };

  const isSubmitting = form.formState.isSubmitting;

  const tableRows = useMemo(() => items, [items]);

  return (
    <div className="pb-2">
      <PageHeader
        title="Gestion des immeubles"
        description="Gérez tous vos immeubles"
        onAdd={() => setShowForm((v) => !v)}
      />

      {showForm ? (
        <Card className="mb-5">
          <CardContent className="p-6">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <div className="text-sm font-semibold text-muted-foreground">
                Nouvel immeuble
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Nom de l&apos;immeuble
                  </label>
                  <Input
                    placeholder="Résidence..."
                    {...form.register("name")}
                    aria-invalid={!!form.formState.errors.name}
                  />
                  {form.formState.errors.name ? (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.name.message}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Ville
                  </label>
                  <Input
                    placeholder="Paris"
                    {...form.register("city")}
                    aria-invalid={!!form.formState.errors.city}
                  />
                  {form.formState.errors.city ? (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.city.message}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-2 md:col-span-1">
                  <label className="text-sm font-medium text-foreground">
                    Adresse
                  </label>
                  <div className="relative">
                    <MapPin className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="15 Rue..."
                      className="pl-9"
                      {...form.register("address")}
                      aria-invalid={!!form.formState.errors.address}
                    />
                  </div>
                  {form.formState.errors.address ? (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.address.message}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-2 md:col-span-1">
                  <label className="text-sm font-medium text-foreground">
                    Nombre d&apos;appartements
                  </label>
                  <Input
                    type="number"
                    placeholder="0"
                    {...form.register("apartmentCount")}
                    aria-invalid={!!form.formState.errors.apartmentCount}
                  />
                  {form.formState.errors.apartmentCount ? (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.apartmentCount.message}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button type="submit" disabled={isSubmitting}>
                  Enregistrer
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setEditingId(null);
                    resetForm(null);
                  }}
                  disabled={isSubmitting}
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
                <TableHead>NOM</TableHead>
                <TableHead>ADRESSE</TableHead>
                <TableHead>VILLE</TableHead>
                <TableHead className="text-right">APPARTEMENTS</TableHead>
                <TableHead className="w-[120px] text-right">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableRows.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-blue-700" />
                      <span className="font-medium text-foreground">
                        {item.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{item.address}</TableCell>
                  <TableCell>{item.city}</TableCell>
                  <TableCell className="text-right">{item.apartmentCount}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        type="button"
                        className="text-blue-700 hover:text-blue-800"
                        onClick={() => onEdit(item)}
                        aria-label={`Edit ${item.name}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => onDelete(item.id)}
                        aria-label={`Delete ${item.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

