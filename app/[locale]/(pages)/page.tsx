import Header from "@/components/shared/header";
import HeroContent from "@/components/shared/hero-content";
// SocialProof sẽ được tích hợp vào HeroContent, không cần gọi ở đây nữa
import HowItWorksSection from "@/components/shared/how-it-works-section"; // Section mới
import UseCasesSection from "@/components/shared/use-cases-section";
import TestimonialSection from "@/components/shared/testimonial-section"; // Section mới
import FeaturesGrid from "@/components/shared/features-grid";
import CTASection from "@/components/shared/cta-section";
import Footer from "@/components/shared/footer";
import SocialProof from "@/components/shared/social-proof";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroContent />
      <HowItWorksSection />
      <UseCasesSection />
      <TestimonialSection />
      <FeaturesGrid />
      <SocialProof />
      <CTASection />
      <Footer />
    </div>
  )
}
