export function PageTitle({ children, className = "" }) {
  return (
    <h1 className={`text-3xl font-bold tracking-tight ${className}`}>
      {children}
    </h1>
  );
}

export function PageSubtitle({ children, className = "" }) {
  return (
    <p className={`text-lg text-muted-foreground ${className}`}>
      {children}
    </p>
  );
}

export function SectionTitle({ children, className = "" }) {
  return (
    <h2 className={`text-lg font-semibold tracking-tight ${className}`}>
      {children}
    </h2>
  );
}

export function SectionDescription({ children, className = "" }) {
  return (
    <p className={`text-sm text-muted-foreground ${className}`}>
      {children}
    </p>
  );
}

export function CardTitle({ children, className = "" }) {
  return (
    <h3 className={`font-semibold text-base leading-none tracking-tight ${className}`}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className = "" }) {
  return (
    <p className={`text-sm text-muted-foreground mt-1 ${className}`}>
      {children}
    </p>
  );
}

export function BodyText({ children, className = "" }) {
  return (
    <p className={`text-sm leading-relaxed text-foreground ${className}`}>
      {children}
    </p>
  );
}

export function SmallText({ children, className = "" }) {
  return (
    <p className={`text-xs text-muted-foreground ${className}`}>
      {children}
    </p>
  );
}
