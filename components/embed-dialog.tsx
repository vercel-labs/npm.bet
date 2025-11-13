"use client";

import { CheckIcon, CodeIcon, CopyIcon } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useGrouping, usePackages, useTimeRange } from "@/providers/filters";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

type SnippetType = "markdown" | "html" | "url";

export const EmbedDialog = () => {
  const [tab, setTab] = useState<SnippetType>("markdown");
  const [copied, setCopied] = useState(false);

  const [packages] = usePackages();
  const [timeRange] = useTimeRange();
  const [grouping] = useGrouping();

  const handleTabChange = useCallback((value: string) => {
    setTab(value as SnippetType);
  }, []);

  const svgUrl = useMemo(() => {
    const baseUrl =
      typeof window !== "undefined" ? `${window.location.origin}/svg` : "/svg";

    const params = new URLSearchParams();

    if (packages.length > 0) {
      params.set("q", packages.join(","));
    }

    params.set("timeRange", timeRange);
    params.set("grouping", grouping);

    return `${baseUrl}?${params.toString()}`;
  }, [packages, timeRange, grouping]);

  const snippets = useMemo(
    () => ({
      markdown: `![npm downloads](${svgUrl})`,
      html: `<img src="${svgUrl}" alt="npm downloads" />`,
      url: svgUrl,
    }),
    [svgUrl]
  );

  const handleCopyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(snippets[tab]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }, [tab, snippets]);

  if (packages.length === 0) {
    return null;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="icon" variant="outline">
          <CodeIcon />
          <span className="sr-only">Embed</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Embed Chart</DialogTitle>
          <DialogDescription>
            Copy the code below to embed this chart in your documentation or
            website.
          </DialogDescription>
        </DialogHeader>

        <div className="relative overflow-auto">
          <Button
            className="absolute top-1 right-0"
            onClick={handleCopyToClipboard}
            size="icon-sm"
            variant="secondary"
          >
            {copied ? <CheckIcon /> : <CopyIcon />}
          </Button>

          <Tabs onValueChange={handleTabChange} value={tab}>
            <TabsList>
              <TabsTrigger value="markdown">Markdown</TabsTrigger>
              <TabsTrigger value="html">HTML</TabsTrigger>
              <TabsTrigger value="url">URL</TabsTrigger>
            </TabsList>

            {(Object.keys(snippets) as SnippetType[]).map((type) => (
              <TabsContent key={type} value={type}>
                <button
                  className="w-full cursor-copy text-left"
                  onClick={handleCopyToClipboard}
                  type="button"
                >
                  <pre className="overflow-x-auto rounded-lg border p-4 text-sm">
                    <code>{snippets[type]}</code>
                  </pre>
                </button>
              </TabsContent>
            ))}
          </Tabs>

          <div className="mt-4">
            {/* biome-ignore lint/performance/noImgElement: Dynamic SVG from API endpoint */}
            {/* biome-ignore lint/correctness/useImageSize: SVG scales responsively */}
            <img alt="Chart preview" className="h-auto w-full" src={svgUrl} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
