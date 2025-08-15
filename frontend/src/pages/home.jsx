import { Features } from "@/components/features";
import { Footer } from "@/components/footer";
import { Hero } from "@/components/hero";
import React from "react";

export default function Home() {
  return (
    <>
      <Hero />
      <div className="flex justify-center">
        <Features />
      </div>
      <Footer />
    </>
  );
}
