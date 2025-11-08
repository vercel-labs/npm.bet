"use client";

import { toPng } from "html-to-image";
import { DownloadIcon } from "lucide-react";
import { useRef, useState } from "react";
import type { PackageData } from "@/actions/package/get";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ChartAreaInteractive } from "./chart";
import { Logo } from "./logo";

type ScreenshotProps = {
  data?: PackageData[];
};

export function Screenshot({ data }: ScreenshotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);

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
          className="shadow-none"
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
          <div className="rounded-lg bg-chart-1 p-12 pb-8" ref={chartRef}>
            <ChartAreaInteractive data={data ?? []} />
            <div className="mt-8 flex items-center justify-center text-white">
              <Logo />
            </div>
          </div>
          <div className="flex justify-end">
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
      </DialogContent>
    </Dialog>
  );
}
