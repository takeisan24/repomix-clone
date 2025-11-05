"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DemoRequestModal } from "@/components/demo-request-modal"
import { Sparkles } from "lucide-react"

export function FinalCTA() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="relative rounded-3xl bg-gradient-to-br from-[#e2baa2]/20 via-[#75a58d]/10 to-[#e2baa2]/20 p-12 lg:p-16 text-center border border-[#75a58d]/30 overflow-hidden shadow-xl shadow-[#75a58d]/10 hover:shadow-2xl hover:shadow-[#75a58d]/20 transition-all duration-500 hover:scale-[1.02]">
              {/* Background decoration */}
              <div className="absolute inset-0 bg-grid-white/5" />
              
              {/* Animated gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#e2baa2]/10 via-[#75a58d]/10 to-[#e2baa2]/10 animate-pulse" />

              <div className="relative">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#e2baa2]/30 to-[#75a58d]/30 mb-6 animate-bounce">
                  <Sparkles className="w-8 h-8 text-[#75a58d] animate-pulse" />
                </div>

                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 animate-fade-in">
                  Sẵn sàng cách mạng hóa quy trình sáng tạo nội dung của bạn?
                </h2>

                <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in animation-delay-200">
                  Hãy để chúng tôi cho bạn thấy cách tự động hóa có thể giúp doanh nghiệp của bạn tăng trưởng.
                </p>

                <Button
                  size="lg"
                  onClick={() => setIsModalOpen(true)}
                  className="text-base px-10 bg-gradient-to-r from-[#e2baa2] to-[#75a58d] hover:scale-110 hover:shadow-2xl hover:shadow-[#75a58d]/50 text-white border-0 transition-all duration-300 hover:brightness-110 relative overflow-hidden group animate-fade-in animation-delay-400"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-[#75a58d] to-[#e2baa2] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
                  <span className="relative z-10">Yêu cầu Demo Miễn phí</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <DemoRequestModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </>
  )
}
