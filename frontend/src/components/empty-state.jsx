import { BarChart3, InboxIcon, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SmallText } from "@/components/typography";

export function EmptyState({
  icon: Icon = InboxIcon,
  title,
  description,
  action,
  actionLabel = "Create Item",
  actionHref
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
      <div className="rounded-lg bg-muted p-4">
        <Icon className="size-8 text-muted-foreground" />
      </div>
      <div className="space-y-2">
        <h3 className="font-semibold text-foreground">{title}</h3>
        {description && (
          <SmallText>{description}</SmallText>
        )}
      </div>
      {action && (
        <Button
          onClick={action}
          variant="default"
          size="sm"
          className="gap-2"
        >
          <PlusCircle className="size-4" />
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
