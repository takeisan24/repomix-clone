import { FileText, Wand2, Calendar } from "lucide-react"

export function HowItWorks() {
  const steps = [
    {
      icon: FileText,
      title: "Cung cấp Nguồn",
      description: "Bắt đầu với bất cứ thứ gì bạn có - một link YouTube, bài blog, file PDF, hoặc chỉ một ý tưởng.",
      image: "/content-input-interface-with-upload-options.png",
    },
    {
      icon: Wand2,
      title: "AI Sáng tạo & Tinh chỉnh",
      description:
        "Hệ thống AI tự động phân tích và tạo ra một bộ nội dung đa phương tiện hoàn chỉnh. Sử dụng trợ lý AI để tinh chỉnh đến khi hoàn hảo.",
      image: "/ai-workspace-with-content-drafts-and-editing-tools.png",
    },
    {
      icon: Calendar,
      title: "Lên lịch & Phân phối",
      description:
        "Lên lịch đăng bài hàng loạt chỉ với một cú nhấp chuột. Chúng tôi sẽ đảm bảo nội dung của bạn xuất hiện đúng nơi, đúng thời điểm.",
      image: "/content-calendar-scheduling-interface.png",
    },
  ]

  return (
    <section id="how-it-works" className="py-20 lg:py-32 bg-card/30">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">Cách hoạt động</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Quy trình đơn giản, mạnh mẽ và dễ sử dụng</p>
        </div>

        <div className="space-y-20">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`flex flex-col ${index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"} gap-12 items-center group`}
            >
              {/* Content */}
              <div className="flex-1 space-y-6">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#e2baa2]/30 to-[#75a58d]/70 border-2 border-[#75a58d]/30 group-hover:from-[#e2baa2]/40 group-hover:to-[#75a58d]/40 group-hover:border-[#e2baa2]/60 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-lg group-hover:shadow-[#e2baa2]/30">
                  <step.icon className="w-7 h-7 text-[#75a58d] group-hover:text-[#75a58d] group-hover:scale-110 transition-all duration-500" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground mb-2 group-hover:text-[#75a58d] group-hover:scale-110 inline-block transition-all duration-300">Bước {index + 1}</div>
                  <h3 className="text-2xl md:text-3xl font-bold mb-4 text-foreground group-hover:translate-x-2 transition-all duration-300">{step.title}</h3>
                  <p className="text-lg text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors duration-300">{step.description}</p>
                </div>
              </div>

              {/* Image */}
              <div className="flex-1">
                <div className="relative rounded-2xl overflow-hidden border-2 border-[#e2baa2]/20 group-hover:border-[#75a58d]/60 shadow-xl group-hover:shadow-2xl group-hover:shadow-[#75a58d]/20 transition-all duration-500 group-hover:-translate-y-1 group-hover:scale-[1.02]">
                  <img src={step.image || "/placeholder.svg"} alt={step.title} className="w-full h-auto transition-transform duration-500 group-hover:scale-105" />
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#e2baa2]/0 to-[#75a58d]/0 group-hover:from-[#e2baa2]/5 group-hover:to-[#75a58d]/5 transition-all duration-500"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
