"use client";

import { toPng } from "html-to-image";
import { CheckIcon, CopyIcon as CopyIconRaw, DownloadIcon } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import type { PackageData } from "@/actions/package/get";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { ChartAreaInteractive } from "./chart";
import { Logo } from "./logo";

type ScreenshotProps = {
  data?: PackageData[];
  className?: string;
};

const colors = [
  "var(--color-secondary)",
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

export function Screenshot({ data, className }: ScreenshotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);
  const [backgroundColor, setBackgroundColor] = useState(colors[0]);
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    if (!chartRef.current) {
      return;
    }

    try {
      const dataUrl = await toPng(chartRef.current, {
        cacheBust: true,
        pixelRatio: 2,
      });
      const blob = await fetch(dataUrl).then((res) => res.blob());
      const clipboardItem = new ClipboardItem({
        "image/png": blob,
      });

      await navigator.clipboard.write([clipboardItem]);

      setIsCopied(true);

      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to copy to clipboard";
      setIsCopied(false);
      toast.error(message);
    }
  };

  const CopyIcon = isCopied ? CheckIcon : CopyIconRaw;

  const handleDownload = async () => {
    if (!chartRef.current) {
      return;
    }

    try {
      setIsDownloading(true);

      const dataUrl = await toPng(chartRef.current, {
        cacheBust: true,
        pixelRatio: 2,
      });

      const link = document.createElement("a");
      link.download = `npm-bet-chart-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Failed to generate screenshot:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Dialog onOpenChange={setIsOpen} open={isOpen}>
      <DialogTrigger asChild>
        <Button
          className={cn("shadow-none", className)}
          disabled={!data || data.length === 0}
          size="icon"
          variant="outline"
        >
          <DownloadIcon />
          <span className="sr-only">Download chart screenshot</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Download Chart</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div
            className="rounded-lg p-12 pb-8"
            ref={chartRef}
            style={{ backgroundColor }}
          >
            <ChartAreaInteractive data={data ?? []} />
            <div
              className={cn(
                "mt-8 flex items-center justify-center",
                backgroundColor === "var(--color-secondary)"
                  ? "text-foreground"
                  : "text-white"
              )}
            >
              <Logo />
            </div>
          </div>
          <div className="flex justify-between">
            <div className="flex items-center gap-2">
              {colors.map((color) => (
                <Button
                  className={cn(
                    "size-6 overflow-hidden rounded-full p-0 shadow-none",
                    color === backgroundColor && "ring-2 ring-ring"
                  )}
                  key={color}
                  onClick={() => setBackgroundColor(color)}
                  size="icon-sm"
                  variant="outline"
                >
                  <div
                    className="size-full"
                    style={{ backgroundColor: color }}
                  />
                </Button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Button
                disabled={isCopied}
                onClick={handleCopy}
                variant="outline"
              >
                <CopyIcon />
                {isCopied ? "Copied!" : "Copy to clipboard"}
              </Button>
              <Button
                disabled={isDownloading}
                onClick={handleDownload}
                variant="default"
              >
                <DownloadIcon />
                {isDownloading ? "Downloading..." : "Download PNG"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
