import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PageHeader({ title, description, onAdd, addLabel = "+ Ajouter" }) {
  return (
    <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
      <div>
        <h1 className="text-xl font-semibold">{title}</h1>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>

      {onAdd ? (
        <div className="flex items-center md:justify-end">
          <Button type="button" onClick={onAdd}>
            <Plus className="mr-1 h-4 w-4" />
            {addLabel.replace("+ ", "")}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

