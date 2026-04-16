import { Link, isRouteErrorResponse, useRouteError } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function GlobalErrorPage() {
  const error = useRouteError();
  const message =
    isRouteErrorResponse(error) && error.status
      ? `Erreur ${error.status}`
      : "Une erreur inattendue est survenue.";

  return (
    <div className="min-h-screen grid place-items-center p-4">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle className="text-base">Oops</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{message}</p>
          <div className="flex gap-2">
            <Button asChild variant="secondary">
              <Link to="/dashboard">Retour</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/login">Login</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

