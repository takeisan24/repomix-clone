import { Clock, Globe, Sparkles, TrendingUp } from "lucide-react"

export function Benefits() {
  const benefits = [
    {
      icon: Clock,
      title: "Tiết kiệm nguồn lực tối đa",
      description:
        "Giải phóng hàng chục giờ làm việc mỗi tuần cho đội ngũ của bạn. Hệ thống AI đảm nhận toàn bộ quy trình từ ý tưởng đến phân phối, giúp bạn tập trung vào chiến lược.",
    },
    {
      icon: Globe,
      title: "Phủ sóng thương hiệu đa kênh",
      description:
        "Từ một nguồn duy nhất, tạo ra video, hình ảnh, carousel và tự động phân phối tới YouTube, TikTok, Instagram, Facebook. Không bỏ lỡ bất kỳ khách hàng nào.",
    },
    {
      icon: Sparkles,
      title: "Nội dung chất lượng & nhất quán",
      description:
        "Đảm bảo 100% nội dung tuân thủ nhận diện thương hiệu. Mọi bài đăng đều chuyên nghiệp và đồng bộ, như có một studio sản xuất nội bộ.",
    },
    {
      icon: TrendingUp,
      title: "Tối ưu hóa dựa trên dữ liệu",
      description:
        "Hệ thống tự động học hỏi từ hiệu suất bài đăng để liên tục cải thiện chiến lược nội dung, đảm bảo hiệu quả ngày càng gia tăng.",
    },
  ]

  return (
    <section className="py-20 lg:py-32">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="group p-8 rounded-2xl bg-card border-2 border-[#e2baa2]/20 hover:border-[#75a58d]/60 transition-all duration-500 hover:shadow-2xl hover:shadow-[#75a58d]/20 hover:-translate-y-2 hover:scale-[1.02] relative overflow-hidden"
            >
              {/* Gradient overlay effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#e2baa2]/5 to-[#75a58d]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
              
              {/* Content */}
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#e2baa2]/20 to-[#75a58d]/20 flex items-center justify-center mb-6 group-hover:from-[#e2baa2]/40 group-hover:to-[#75a58d]/40 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-lg group-hover:shadow-[#75a58d]/30">
                  <benefit.icon className="w-6 h-6 text-[#75a58d] group-hover:text-[#75a58d] transition-all duration-500 group-hover:scale-110" />
                </div>
                <h3 className="text-xl font-semibold mb-3 group-hover:text-[#75a58d] transition-colors duration-300">{benefit.title}</h3>
                <p className="text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors duration-300">{benefit.description}</p>
              </div>
              
              {/* Subtle accent line */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#e2baa2] to-[#75a58d] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left rounded-b-2xl"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
