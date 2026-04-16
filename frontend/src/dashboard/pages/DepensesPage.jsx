import { useMemo, useState } from "react";
import { Pencil, Trash2, Receipt } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { mockDepenses, mockImmeubles } from "@/dashboard/mockData";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
  title: z.string().min(2, "Titre requis"),
  buildingId: z.string().min(1, "Immeuble requis"),
  category: z.string().min(2, "Catégorie requise"),
  amount: z.coerce.number().min(0, "Montant requis"),
  date: z.string().min(3, "Date requise"),
  description: z.string().min(0).optional(),
});

let idSeq = 1;

function categoryVariant(category) {
  const v = category.toLowerCase();
  if (v.includes("maintenance")) return "success";
  if (v.includes("entretien") || v.includes("util")) return "info";
  if (v.includes("jardin")) return "warning";
  return "muted";
}

export function DepensesPage() {
  const [items, setItems] = useState(mockDepenses);
  const [showForm, setShowForm] = useState(false);
  const immeublesById = useMemo(() => new Map(mockImmeubles.map((i) => [i.id, i])), []);

  const total = useMemo(() => items.reduce((sum, d) => sum + d.amount, 0), [items]);
  const categories = ["Maintenance", "Entretien", "Utilités", "Jardinage", "Autres"];

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      buildingId: mockImmeubles[0]?.id ?? "",
      category: categories[0] ?? "Maintenance",
      amount: 0,
      date: "",
      description: "",
    },
  });

  const onSubmit = (values) => {
    const newItem = {
      id: `d_${idSeq++}`,
      title: values.title,
      buildingId: values.buildingId,
      category: values.category,
      amount: values.amount,
      date: values.date,
      description: values.description ?? "",
    };
    setItems((prev) => [newItem, ...prev]);
    setShowForm(false);
    form.reset();
  };

  const isSubmitting = form.formState.isSubmitting;

  return (
    <div className="pb-2">
      <div className="mb-5 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold">Gestion des dépenses</h1>
          <p className="text-sm text-muted-foreground">Suivez tous vos dépenses</p>
        </div>
        <Button type="button" onClick={() => setShowForm((v) => !v)}>
          + Ajouter
        </Button>
      </div>

      <Card className="mb-5">
        <CardContent className="p-6">
          <div className="text-sm font-semibold text-muted-foreground">
            Total des dépenses
          </div>
          <div className="mt-2 text-3xl font-semibold">{total} €</div>
          <div className="mt-1 text-sm text-muted-foreground">Ce mois-ci</div>
        </CardContent>
      </Card>

      {showForm ? (
        <Card className="mb-5">
          <CardContent className="p-6">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <div className="text-sm font-semibold text-muted-foreground">
                Nouvelle dépense
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Titre</label>
                  <Input
                    placeholder="Réparation..."
                    {...form.register("title")}
                    aria-invalid={!!form.formState.errors.title}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Immeuble</label>
                  <select
                    className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                    {...form.register("buildingId")}
                  >
                    {mockImmeubles.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Catégorie</label>
                  <select
                    className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                    {...form.register("category")}
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Montant (€)
                  </label>
                  <Input
                    type="number"
                    placeholder="500"
                    {...form.register("amount")}
                    aria-invalid={!!form.formState.errors.amount}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-foreground">Date</label>
                  <Input
                    placeholder="mm/dd/yyyy"
                    {...form.register("date")}
                    aria-invalid={!!form.formState.errors.date}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-foreground">Description</label>
                  <Textarea
                    placeholder="Détails de la dépense..."
                    className="min-h-28"
                    {...form.register("description")}
                  />
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
                  onClick={() => setShowForm(false)}
                >
                  Annuler
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>TITRE</TableHead>
                  <TableHead>IMMEUBLE</TableHead>
                  <TableHead>CATEGORIE</TableHead>
                  <TableHead className="text-right">MONTANT</TableHead>
                  <TableHead>DATE</TableHead>
                  <TableHead className="w-[120px] text-right">ACTIONS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((d) => {
                  const building = immeublesById.get(d.buildingId);
                  return (
                    <TableRow key={d.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Receipt className="h-4 w-4 text-blue-700" />
                          <div className="leading-tight">
                            <div className="font-medium">{d.title}</div>
                            <div className="text-xs text-muted-foreground">
                              {d.description}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{building?.name ?? "-"}</TableCell>
                      <TableCell>
                        <Badge
                          variant={categoryVariant(d.category)}
                          className="rounded-md"
                        >
                          {d.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{d.amount} €</TableCell>
                      <TableCell>{d.date}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            type="button"
                            className="text-blue-700 hover:text-blue-800"
                            aria-label={`Edit ${d.title}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            className="text-red-600 hover:text-red-700"
                            aria-label={`Delete ${d.title}`}
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
      )}
    </div>
  );
}

