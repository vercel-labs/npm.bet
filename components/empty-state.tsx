import { LineChartIcon } from "lucide-react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export const EmptyState = () => (
  <Empty className="size-full rounded-lg border border-solid bg-background">
    <EmptyHeader>
      <EmptyMedia variant="icon">
        <LineChartIcon />
      </EmptyMedia>
      <EmptyTitle>No packages selected</EmptyTitle>
      <EmptyDescription>
        You haven&apos;t selected any packages yet. Get started by selecting a
        package below.
      </EmptyDescription>
    </EmptyHeader>
  </Empty>
);
