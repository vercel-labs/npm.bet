import type { Metadata } from "next";
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
  const { package: packageName } = await params;
  const { timeRange, grouping } = await searchParams;

  const ogUrl = new URL("/og", baseUrl);
  ogUrl.searchParams.set("q", packageName);
  if (timeRange) {
    ogUrl.searchParams.set("timeRange", timeRange);
  }
  if (grouping) {
    ogUrl.searchParams.set("grouping", grouping);
  }

  return {
    title: `${packageName} - npm.bet`,
    description: `Download statistics for ${packageName} on npm`,
    openGraph: {
      title: `${packageName} - npm.bet`,
      description: `Download statistics for ${packageName} on npm`,
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
  const { package: packageName } = await params;
  const decodedPackage = decodeURIComponent(packageName);

  return (
    <div className="grid h-dvh grid-rows-[2rem_1fr_2rem] gap-4 overflow-hidden p-4">
      <PackageHeader packageName={decodedPackage} />
      <Content packageName={decodedPackage} />
      <PackageFooter packageName={decodedPackage} />
    </div>
  );
};

export default PackagePage;
