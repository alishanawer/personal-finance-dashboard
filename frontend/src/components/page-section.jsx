import { SectionTitle, SectionDescription } from "@/components/typography";
import { Separator } from "@/components/ui/separator";

export function PageSection({
  title,
  description,
  children,
  divider = true,
  className = ""
}) {
  return (
    <div className={`space-y-4 ${className}`}>
      {(title || description) && (
        <div className="space-y-1">
          {title && <SectionTitle>{title}</SectionTitle>}
          {description && <SectionDescription>{description}</SectionDescription>}
        </div>
      )}
      <div className="space-y-4">
        {children}
      </div>
      {divider && <Separator className="mt-6" />}
    </div>
  );
}
