"use client";

import { useEffect } from "react";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { Main } from "@/components/main";
import { usePackages } from "@/providers/filters";

type PageProps = {
  params: Promise<{
    package: string;
  }>;
};

const Home = ({ params }: PageProps) => {
  const [packages, setPackages] = usePackages();

  useEffect(() => {
    params.then(({ package: packageName }) => {
      if (packageName && !packages.includes(packageName)) {
        setPackages([packageName]);
      }
    });
  }, [params, packages, setPackages]);

  return (
    <div className="grid h-screen grid-rows-[2rem_1fr_2rem] gap-4 overflow-hidden p-4">
      <Header />
      <Main />
      <Footer />
    </div>
  );
};

export default Home;
