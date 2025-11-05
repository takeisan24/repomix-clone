"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DemoRequestModal } from "@/components/demo-request-modal"
import { ArrowRight, Play } from "lucide-react"

export function HeroSection() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const scrollToHowItWorks = () => {
    document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <>
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
        {/* Background gradient effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />

        <div className="container mx-auto px-4 lg:px-8 relative">
          <div className="max-w-5xl mx-auto text-center">
            {/* Main Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight mb-6 text-balance">
              Tự động hóa toàn bộ <span className="gradient-text">cỗ máy sáng tạo</span> nội dung của bạn
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-3xl mx-auto text-pretty leading-relaxed">
              Chúng tôi biến một ý tưởng duy nhất thành chiến dịch nội dung đa kênh hoàn chỉnh. Giải phóng thời gian cho
              đội ngũ của bạn, phủ sóng thương hiệu và thúc đẩy tăng trưởng.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Button
                size="lg"
                onClick={() => setIsModalOpen(true)}
                className="text-base px-8 bg-gradient-to-r from-[#75a58d] to-[#e2baa2] hover:scale-105 hover:shadow-2xl hover:shadow-[#75a58d]/50 text-white border-0 shadow-lg shadow-[#75a58d]/30 transition-all duration-300 hover:brightness-110 relative overflow-hidden group"
              >
                <span className="relative z-10">Yêu cầu Demo</span>
                <span className="absolute inset-0 bg-gradient-to-r from-[#e2baa2] to-[#75a58d] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform relative z-10" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={scrollToHowItWorks}
                className="text-base px-8 group bg-transparent"
              >
                <Play className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                Xem cách hoạt động
              </Button>
            </div>

            {/* Video Demo Placeholder */}
            <div className="relative max-w-4xl mx-auto rounded-2xl overflow-hidden border border-border shadow-2xl">
              <div className="aspect-video bg-gradient-to-br from-primary/20 via-accent/20 to-primary/20 flex items-center justify-center">
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                  poster="/ai-content-automation-dashboard-interface.png"
                >
                  <source src="/demo-video.mp4" type="video/mp4" />
                </video>
              </div>
            </div>
          </div>
        </div>
      </section>

      <DemoRequestModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </>
  )
}
