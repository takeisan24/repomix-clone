import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export function FAQ() {
  const faqs = [
    {
      question: "Chi phí được tính như thế nào?",
      answer:
        "Chúng tôi cung cấp các gói dịch vụ linh hoạt dựa trên quy mô và nhu cầu của doanh nghiệp bạn. Liên hệ với chúng tôi để nhận báo giá chi tiết phù hợp với mục tiêu của bạn.",
    },
    {
      question: "Dữ liệu của tôi có an toàn không?",
      answer:
        "Tuyệt đối. Chúng tôi sử dụng mã hóa cấp ngân hàng và tuân thủ các tiêu chuẩn bảo mật quốc tế. Dữ liệu của bạn được lưu trữ an toàn và không bao giờ được chia sẻ với bên thứ ba.",
    },
    {
      question: "Mất bao lâu để triển khai?",
      answer:
        "Hầu hết khách hàng có thể bắt đầu tạo nội dung trong vòng 24-48 giờ sau khi đăng ký. Đối với các doanh nghiệp lớn cần tích hợp tùy chỉnh, quá trình có thể mất 1-2 tuần.",
    },
    {
      question: "Tôi có cần biết kỹ thuật không?",
      answer:
        "Không cần! Giao diện của chúng tôi được thiết kế để bất kỳ ai cũng có thể sử dụng. Nếu bạn biết cách sử dụng email, bạn có thể sử dụng SutraLabs. Chúng tôi cũng cung cấp đào tạo và hỗ trợ đầy đủ.",
    },
    {
      question: "Tôi có thể hủy bất cứ lúc nào không?",
      answer:
        "Có, không có cam kết dài hạn. Bạn có thể hủy dịch vụ bất cứ lúc nào. Chúng tôi tin rằng bạn sẽ ở lại vì giá trị mà chúng tôi mang lại, không phải vì hợp đồng ràng buộc.",
    },
  ]

  return (
    <section className="py-20 lg:py-32">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">Những câu hỏi bạn có thể đang thắc mắc</h2>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="!border !border-[#75a58d]/20 rounded-xl px-6 bg-card hover:!border-[#75a58d]/40 hover:shadow-lg hover:shadow-[#75a58d]/10 hover:scale-[1.02] transition-all duration-300"
              >
                <AccordionTrigger className="text-left hover:no-underline py-6 hover:text-[#75a58d] transition-colors duration-300">
                  <span className="font-semibold">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-6 leading-relaxed">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}
