"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DemoRequestModal } from "@/components/demo-request-modal"
import { Check } from "lucide-react"

export function CustomSolutions() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const solutions = [
    {
      name: "Tăng trưởng",
      subtitle: "Growth",
      target: "Dành cho đội ngũ marketing và các startup",
      features: [
        "Tự động hóa nội dung đa kênh",
        "Phân phối tự động đến 5+ nền tảng",
        "Báo cáo hiệu suất chi tiết",
        "Trợ lý AI để tinh chỉnh nội dung",
        "Hỗ trợ qua email",
      ],
      cta: "Trò chuyện với chuyên gia",
    },
    {
      name: "Doanh nghiệp",
      subtitle: "Business",
      target: "Dành cho các doanh nghiệp lớn và agency",
      features: [
        "Mọi thứ trong gói Tăng trưởng",
        "Tích hợp tùy chỉnh với hệ thống hiện có",
        "Nhiều tài khoản người dùng & phân quyền",
        "Hỗ trợ chuyên sâu 24/7",
        "Đào tạo và onboarding riêng",
        "API access cho tự động hóa nâng cao",
      ],
      cta: "Yêu cầu Demo Doanh nghiệp",
      featured: true,
    },
  ]

  return (
    <>
      <section id="pricing" className="py-20 lg:py-32 bg-card/30">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Tìm gói giải pháp được thiết kế riêng cho mục tiêu của bạn
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Mỗi doanh nghiệp là duy nhất. Chúng tôi cung cấp các gói dịch vụ linh hoạt để đáp ứng chính xác nhu cầu
              của bạn.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {solutions.map((solution, index) => (
              <div
                key={index}
                className={`relative rounded-3xl p-8 lg:p-10 border transition-all duration-500 hover:scale-105 hover:-translate-y-2 ${
                  solution.featured
                    ? "bg-gradient-to-br from-[#e2baa2]/10 via-[#75a58d]/5 to-[#e2baa2]/5 border-[#75a58d]/50 shadow-lg shadow-[#75a58d]/10 hover:shadow-2xl hover:shadow-[#75a58d]/30"
                    : "bg-card border-border hover:border-[#75a58d]/50 hover:shadow-xl hover:shadow-[#75a58d]/20"
                }`}
              >
                {solution.featured && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center px-4 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-[#e2baa2] to-[#75a58d] text-white shadow-lg shadow-[#75a58d]/30">
                      Phổ biến nhất
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-1">{solution.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{solution.subtitle}</p>
                  <p className="text-sm font-medium">{solution.target}</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {solution.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3 group/item">
                      <Check className="w-5 h-5 text-[#75a58d] flex-shrink-0 mt-0.5 transition-transform duration-300 group-hover/item:scale-110 group-hover/item:rotate-12" />
                      <span className="text-sm text-muted-foreground transition-colors duration-300 group-hover/item:text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => setIsModalOpen(true)}
                  className={`w-full group/btn ${
                    solution.featured
                      ? "bg-gradient-to-r from-[#e2baa2] to-[#75a58d] hover:scale-110 hover:shadow-xl hover:shadow-[#75a58d]/40 text-white border-0 transition-all duration-300 relative overflow-hidden"
                      : "hover:scale-105 transition-all duration-300"
                  }`}
                  variant={solution.featured ? "default" : "outline"}
                >
                  {solution.featured && (
                    <span className="absolute inset-0 bg-gradient-to-r from-[#75a58d] to-[#e2baa2] opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500"></span>
                  )}
                  <span className="relative z-10">{solution.cta}</span>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <DemoRequestModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </>
  )
}
