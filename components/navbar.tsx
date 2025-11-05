"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { DemoRequestModal } from "@/components/demo-request-modal"

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white backdrop-blur-lg ${
          isScrolled ? "border-b border-white/50" : ""
        }`}
      >
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <div className="flex-shrink-0">
              <a href="/" className="flex items-center group">
                <div className="relative h-16 w-48 lg:h-20 lg:w-64 overflow-hidden">
                  <img 
                    src="/SutraLabs Logo.png" 
                    alt="SutraLabs Logo" 
                    className="h-[200%] w-[200%] object-contain -translate-x-[15%] -translate-y-[25%] transition-transform group-hover:scale-105"
                  />
                </div>
              </a>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#solutions" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Giải pháp
              </a>
              <a href="#case-studies" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Case Studies
              </a>
              <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Bảng giá
              </a>
              <a href="#blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Blog
              </a>
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center gap-3">
              <Button variant="ghost" className="hidden sm:inline-flex text-sm">
                Đăng nhập
              </Button>
              <Button 
                onClick={() => setIsModalOpen(true)} 
                className="text-sm bg-gradient-to-r from-[#e2baa2] to-[#75a58d] hover:scale-105 hover:shadow-2xl hover:shadow-[#75a58d]/50 text-white border-0 shadow-lg shadow-[#75a58d]/30 transition-all duration-300 hover:brightness-110 relative overflow-hidden group"
              >
                <span className="relative z-10">Yêu cầu Demo</span>
                <span className="absolute inset-0 bg-gradient-to-r from-[#75a58d] to-[#e2baa2] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <DemoRequestModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </>
  )
}
