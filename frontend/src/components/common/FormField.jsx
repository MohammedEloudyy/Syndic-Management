export default function FormField({ label, children }) {
  return (
    <div className="space-y-2">
      {label ? (
        <label className="text-sm font-medium text-foreground">{label}</label>
      ) : null}
      {children}
    </div>
  );
}

