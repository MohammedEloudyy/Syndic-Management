import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Pagination({ 
  currentPage, 
  lastPage, 
  onPageChange,
  className 
}) {
  if (lastPage <= 1) return null;

  const pages = [];
  const maxVisible = 5;
  
  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let end = Math.min(lastPage, start + maxVisible - 1);
  
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return (
    <div className={cn("flex items-center justify-center gap-2 py-4", className)}>
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 rounded-lg"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {start > 1 && (
        <>
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 rounded-lg"
            onClick={() => onPageChange(1)}
          >
            1
          </Button>
          {start > 2 && <span className="text-muted-foreground">...</span>}
        </>
      )}

      {pages.map((p) => (
        <Button
          key={p}
          variant={p === currentPage ? "default" : "outline"}
          size="sm"
          className={cn(
            "h-8 w-8 rounded-lg font-medium",
            p === currentPage ? "bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20" : ""
          )}
          onClick={() => onPageChange(p)}
        >
          {p}
        </Button>
      ))}

      {end < lastPage && (
        <>
          {end < lastPage - 1 && <span className="text-muted-foreground">...</span>}
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 rounded-lg"
            onClick={() => onPageChange(lastPage)}
          >
            {lastPage}
          </Button>
        </>
      )}

      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 rounded-lg"
        disabled={currentPage >= lastPage}
        onClick={() => onPageChange(currentPage + 1)}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
