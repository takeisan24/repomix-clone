import { ArrowUpRight, DollarSign, Clock } from "lucide-react"

export function CaseStudy() {
  const metrics = [
    {
      icon: ArrowUpRight,
      value: "+150%",
      label: "Lượt tiếp cận hàng tháng",
    },
    {
      icon: DollarSign,
      value: "-40%",
      label: "Chi phí vận hành",
    },
    {
      icon: Clock,
      value: "20+",
      label: "Giờ làm việc được tiết kiệm mỗi tuần",
    },
  ]

  return (
    <section id="case-studies" className="py-20 lg:py-32">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">Câu chuyện Thành công</h2>
          </div>

          <div className="bg-gradient-to-br from-[#e2baa2]/10 via-[#75a58d]/5 to-[#e2baa2]/5 rounded-3xl p-8 lg:p-12 border border-[#75a58d]/20">
            {/* Client Logo */}
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#e2baa2] to-[#75a58d] flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-[#75a58d]/30">
                BC
              </div>
              <div>
                <div className="font-semibold text-lg">BrandCorp</div>
                <div className="text-sm text-muted-foreground">Marketing Agency</div>
              </div>
            </div>

            {/* Testimonial */}
            <blockquote className="text-xl md:text-2xl font-medium mb-8 leading-relaxed">
              "Nhờ SutraLabs, chúng tôi đã giảm 40% chi phí sản xuất nội dung và tăng 150% lượt tiếp cận trên các nền
              tảng social. Đây là công cụ thay đổi cuộc chơi cho agency của chúng tôi."
            </blockquote>

            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-10">
              <span className="font-semibold text-foreground">Nguyễn Văn A</span>
              <span>•</span>
              <span>Giám đốc Marketing, BrandCorp</span>
            </div>

            {/* Key Metrics */}
            <div className="grid sm:grid-cols-3 gap-6">
              {metrics.map((metric, index) => (
                <div key={index} className="bg-background/50 backdrop-blur rounded-xl p-6 border border-[#75a58d]/20 hover:border-[#75a58d]/40 transition-all duration-300 hover:shadow-lg hover:shadow-[#75a58d]/10">
                  <metric.icon className="w-5 h-5 text-[#e2baa2] mb-3" />
                  <div className="text-3xl font-bold mb-1 text-[#75a58d]">{metric.value}</div>
                  <div className="text-sm text-muted-foreground">{metric.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
