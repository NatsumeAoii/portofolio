"use client"

import { Header } from "@/components/layout/Header";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Experience } from "@/components/sections/Experience";
import { Projects } from "@/components/sections/Projects";
import { Contact } from "@/components/sections/Contact";
import { ScrollTop } from "@/components/ui/ScrollTop";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";

export default function Home() {
  useIntersectionObserver();

  return (
    <div id="page-home">
      <Header />
      <main id="app-root">
        <Hero />
        <About />
        <Experience />
        <Projects />
        <Contact />
      </main>
      <ScrollTop />
    </div>
  );
}
