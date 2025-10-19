import Header from "@/components/shared/header"
import HeroContent from "@/components/shared/hero-content"
import SocialProof from "@/components/shared/social-proof"
import FeaturesGrid from "@/components/shared/features-grid"
import UseCasesSection from "@/components/shared/use-cases-section"
import CTASection from "@/components/shared/cta-section"
import Footer from "@/components/shared/footer"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroContent />
      <SocialProof />
      <FeaturesGrid />
      <UseCasesSection />
      <CTASection />
      <Footer />
    </div>
  )
}
