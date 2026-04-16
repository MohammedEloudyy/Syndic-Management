import { Card, CardContent } from "@/components/ui/card";
import { StatsCard } from "@/dashboard/components/StatsCard";
import { mockPaiements, mockDepenses } from "@/dashboard/mockData";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle2, Clock3, XCircle } from "lucide-react";

function StatusBadge({ status }) {
  if (status === "payé") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-700">
        <CheckCircle2 className="h-3.5 w-3.5" />
        payé
      </span>
    );
  }
  if (status === "en attente") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/10 px-2.5 py-1 text-xs text-sky-700">
        <Clock3 className="h-3.5 w-3.5" />
        en attente
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2.5 py-1 text-xs text-red-700">
      <XCircle className="h-3.5 w-3.5" />
      en retard
    </span>
  );
}

export function DashboardPage() {
  return (
    <div>
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <StatsCard value="18" label="Immeubles" />
        <StatsCard value="401" label="Résidents" />
        <StatsCard value="92%" label="Paiements" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardContent className="p-0">
            <div className="flex items-center justify-between px-4 py-3">
              <div>
                <div className="text-sm font-semibold">Derniers paiements</div>
                <div className="text-xs text-muted-foreground">Suivi rapide</div>
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>RÉSIDENT</TableHead>
                  <TableHead>TYPE</TableHead>
                  <TableHead className="text-right">MONTANT</TableHead>
                  <TableHead>STATUT</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockPaiements.slice(0, 3).map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{p.residentId}</TableCell>
                    <TableCell>{p.type}</TableCell>
                    <TableCell className="text-right">{p.amount} €</TableCell>
                    <TableCell>
                      <StatusBadge status={p.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <div className="flex items-center justify-between px-4 py-3">
              <div>
                <div className="text-sm font-semibold">Dernières dépenses</div>
                <div className="text-xs text-muted-foreground">Budget & maintenance</div>
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>TITRE</TableHead>
                  <TableHead>CATÉGORIE</TableHead>
                  <TableHead className="text-right">MONTANT</TableHead>
                  <TableHead>DATE</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockDepenses.slice(0, 3).map((d) => (
                  <TableRow key={d.id}>
                    <TableCell>{d.title}</TableCell>
                    <TableCell>{d.category}</TableCell>
                    <TableCell className="text-right">{d.amount} €</TableCell>
                    <TableCell>{d.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

