import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { Main } from "@/components/main";

type HomeProps = {
  searchParams: Promise<{
    q: string;
    timeRange?: string;
    grouping?: string;
  }>;
};

const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
const baseUrl = new URL(
  `${protocol}://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
);

export const generateMetadata = async ({ searchParams }: HomeProps) => {
  const { q, timeRange, grouping } = await searchParams;

  if (!q) {
    return {
      title: "npm.bet",
    };
  }

  const packages = q.split(",");

  // Build OG image URL with query params
  const ogUrl = new URL("/og", baseUrl);
  ogUrl.searchParams.set("q", q);
  if (timeRange) {
    ogUrl.searchParams.set("timeRange", timeRange);
  }
  if (grouping) {
    ogUrl.searchParams.set("grouping", grouping);
  }

  const metadata: Metadata = {
    title: `${packages.join(" vs ")} - npm.bet`,
    openGraph: {
      images: [
        {
          url: ogUrl.toString(),
          width: 1200,
          height: 630,
        },
      ],
    },
  };

  return metadata;
};

const Home = async () => (
  <div className="grid h-dvh grid-rows-[2rem_1fr_2rem] gap-4 overflow-hidden p-4">
    <Header />
    <Main />
    <Footer />
  </div>
);

export default Home;
