import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { SocialProof } from "@/components/social-proof"
import { Benefits } from "@/components/benefits"
import { HowItWorks } from "@/components/how-it-works"
import { CaseStudy } from "@/components/case-study"
import { CustomSolutions } from "@/components/custom-solutions"
import { FAQ } from "@/components/faq"
import { FinalCTA } from "@/components/final-cta"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <SocialProof />
      <Benefits />
      <HowItWorks />
      <CaseStudy />
      <CustomSolutions />
      <FAQ />
      <FinalCTA />
      <Footer />
    </main>
  )
}
