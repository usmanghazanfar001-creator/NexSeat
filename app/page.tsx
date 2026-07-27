import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Hero } from "@/components/home/hero";
import { ToolsSection } from "@/components/home/tools-section";
import { Pricing } from "@/components/home/pricing";
import { Testimonials } from "@/components/home/testimonials";
import { Faq } from "@/components/home/faq";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <ToolsSection />
        <Pricing />
        <Testimonials />
        <Faq />
      </main>
      <Footer />
    </>
  );
}
