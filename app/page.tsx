"use client";

import useSWR from "swr";
import { getPackageData, type PackageData } from "@/actions/package/get";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { Main } from "@/components/main";
import { usePackages, useTimeRange } from "@/providers/filters";

const Home = () => {
  const [packages] = usePackages();
  const [timeRange] = useTimeRange();

  const { data: packageData } = useSWR<PackageData[]>(
    packages.length > 0 ? [packages, timeRange] : null,
    async ([pkgs, range]: [string[], string]) =>
      Promise.all(pkgs.map((pkg) => getPackageData(pkg, range)))
  );

  return (
    <div className="grid h-dvh grid-rows-[2rem_1fr_2rem] gap-4 overflow-hidden p-4">
      <Header data={packageData} />
      <Main />
      <Footer />
    </div>
  );
};

export default Home;
