"use client"

export function SocialProof() {
  const clients = [
    { name: "TechCorp", logo: "TC" },
    { name: "MediaHub", logo: "MH" },
    { name: "GrowthLabs", logo: "GL" },
    { name: "BrandStudio", logo: "BS" },
    { name: "ContentPro", logo: "CP" },
    { name: "MarketForce", logo: "MF" },
  ]

  return (
    <section className="py-16 border-y border-border overflow-hidden">
      <div className="container mx-auto px-4 lg:px-8">
        <p className="text-center text-sm text-muted-foreground mb-10">
          Được tin cậy bởi các doanh nghiệp tăng trưởng và những agency hàng đầu
        </p>

        <div className="relative w-full overflow-hidden">
          <div className="flex animate-scroll-left">
            {[...clients, ...clients].map((client, index) => (
              <div 
                key={`${client.name}-${index}`} 
                className="flex items-center justify-center group cursor-pointer flex-shrink-0 mx-8"
              >
                <div className="text-3xl font-bold text-muted-foreground/40 group-hover:text-foreground/60 transition-colors min-w-[100px] text-center">
                  {client.logo}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
