import { Loader2 } from "lucide-react";
import { SmallText } from "@/components/typography";

export function LoadingState({ message = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <Loader2 className="size-8 text-muted-foreground animate-spin" />
      <SmallText>{message}</SmallText>
    </div>
  );
}
