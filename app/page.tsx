"use client";

import { useEffect } from "react";
import useSWR from "swr";
import { getPackageData, type PackageData } from "@/actions/package/get";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { Main } from "@/components/main";
import { usePackages, useTimeRange } from "@/providers/filters";

type PageProps = {
  params: Promise<{
    package: string;
  }>;
};

const Home = ({ params }: PageProps) => {
  const [packages, setPackages] = usePackages();
  const [timeRange] = useTimeRange();

  useEffect(() => {
    params.then(({ package: packageName }) => {
      if (packageName && !packages.includes(packageName)) {
        setPackages([packageName]);
      }
    });
  }, [params, packages, setPackages]);

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
