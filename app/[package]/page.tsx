import type { Metadata } from "next";
import { parseZeroMode } from "@/lib/download-data";
import { Content } from "./components/content";
import { PackageFooter } from "./components/footer";
import { PackageHeader } from "./components/header";

interface PackagePageProps {
  params: Promise<{
    package: string;
  }>;
  searchParams: Promise<{
    timeRange?: string;
    grouping?: string;
    metric?: string;
    zeroMode?: string;
  }>;
}

const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
const baseUrl = new URL(
  `${protocol}://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
);

export const generateMetadata = async ({
  params,
  searchParams,
}: PackagePageProps): Promise<Metadata> => {
  const { package: packageParam } = await params;
  const { timeRange, grouping, metric, zeroMode } = await searchParams;
  const packages = decodeURIComponent(packageParam).split(",");
  const title = packages.length > 1 ? packages.join(" vs ") : packages[0];

  const ogUrl = new URL("/og", baseUrl);
  ogUrl.searchParams.set("q", packages.join(","));
  ogUrl.searchParams.set("zeroMode", parseZeroMode(zeroMode));
  if (timeRange) {
    ogUrl.searchParams.set("timeRange", timeRange);
  }
  if (grouping) {
    ogUrl.searchParams.set("grouping", grouping);
  }
  if (metric) {
    ogUrl.searchParams.set("metric", metric);
  }

  return {
    title: `${title} - npm.bet`,
    description: `Download statistics for ${title} on npm`,
    openGraph: {
      title: `${title} - npm.bet`,
      description: `Download statistics for ${title} on npm`,
      images: [
        {
          url: ogUrl.toString(),
          width: 1200,
          height: 630,
        },
      ],
    },
  };
};

const PackagePage = async ({ params }: PackagePageProps) => {
  const { package: packageParam } = await params;
  const packages = decodeURIComponent(packageParam).split(",");

  return (
    <div className="grid h-dvh grid-rows-[2rem_1fr_2rem] gap-4 overflow-hidden p-4">
      <PackageHeader packages={packages} />
      <Content packages={packages} />
      <PackageFooter packages={packages} />
    </div>
  );
};

export default PackagePage;
