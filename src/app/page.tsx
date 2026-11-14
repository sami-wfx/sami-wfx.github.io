import { Hero } from "@/components/sections/Hero";
import { Approach } from "@/components/sections/Approach";
import { SelectedWork } from "@/components/sections/SelectedWork";
import { Showreel } from "@/components/sections/Showreel";
import { Services } from "@/components/sections/Services";
import { Software } from "@/components/sections/Software";
import { About } from "@/components/sections/About";
import { ContactCTA } from "@/components/sections/ContactCTA";

export default function Home() {
  return (
    <>
      <Hero />
      <Approach />
      <SelectedWork />
      <Showreel />
      <Services />
      <Software />
      <About />
      <ContactCTA />
    </>
  );
}
