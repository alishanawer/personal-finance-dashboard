import { PageTitle, PageSubtitle } from "@/components/typography";

export function PageHeader({
  title,
  subtitle,
  actions,
  className = ""
}) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-col gap-2">
          <PageTitle>{title}</PageTitle>
          {subtitle && <PageSubtitle>{subtitle}</PageSubtitle>}
        </div>
        {actions && <div className="flex gap-2 items-center">{actions}</div>}
      </div>
    </div>
  );
}
