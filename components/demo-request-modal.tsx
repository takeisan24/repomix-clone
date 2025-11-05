"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, CheckCircle2 } from "lucide-react"

interface DemoRequestModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DemoRequestModal({ open, onOpenChange }: DemoRequestModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    company: "",
    companySize: "",
    problem: "",
  })

  const publicEmailDomains = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "icloud.com"]

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return "Email không hợp lệ"
    }

    const domain = email.split("@")[1]
    if (publicEmailDomains.includes(domain)) {
      return "Vui lòng sử dụng email công ty"
    }

    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Client-side validation
    if (!formData.fullName || !formData.email || !formData.phone || !formData.company) {
      setError("Vui lòng điền đầy đủ các trường bắt buộc")
      return
    }

    const emailError = validateEmail(formData.email)
    if (emailError) {
      setError(emailError)
      return
    }

    setIsLoading(true)

    try {
      // Simulate API call to HubSpot CRM
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // In production, this would be:
      // const response = await fetch('/api/demo-request', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData),
      // })
      // if (!response.ok) throw new Error('Failed to submit')

      setIsSuccess(true)

      // Reset form after 3 seconds and close modal
      setTimeout(() => {
        setIsSuccess(false)
        setFormData({
          fullName: "",
          email: "",
          phone: "",
          company: "",
          companySize: "",
          problem: "",
        })
        onOpenChange(false)
      }, 3000)
    } catch (err) {
      setError("Đã có lỗi xảy ra, vui lòng thử lại")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        {isSuccess ? (
          <div className="py-8 text-center">
            <CheckCircle2 className="w-16 h-16 text-[#75a58d] mx-auto mb-4" />
            <DialogTitle className="text-2xl mb-2">Cảm ơn bạn!</DialogTitle>
            <DialogDescription className="text-base">Chúng tôi sẽ liên hệ lại trong vòng 24 giờ.</DialogDescription>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl">Yêu cầu Demo</DialogTitle>
              <DialogDescription>
                Điền thông tin bên dưới và chúng tôi sẽ liên hệ với bạn để sắp xếp buổi demo.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">
                  Họ và Tên <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Nguyễn Văn A"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  Email Công ty <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="nguyen@congty.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">
                  Số điện thoại <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="0912345678"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">
                  Tên Công ty <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="Công ty ABC"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="companySize">Quy mô Công ty</Label>
                <Select
                  value={formData.companySize}
                  onValueChange={(value) => setFormData({ ...formData, companySize: value })}
                >
                  <SelectTrigger id="companySize">
                    <SelectValue placeholder="Chọn quy mô" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-10">1-10 nhân viên</SelectItem>
                    <SelectItem value="11-50">11-50 nhân viên</SelectItem>
                    <SelectItem value="51-200">51-200 nhân viên</SelectItem>
                    <SelectItem value="200+">200+ nhân viên</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="problem">Vấn đề bạn quan tâm nhất?</Label>
                <Textarea
                  id="problem"
                  value={formData.problem}
                  onChange={(e) => setFormData({ ...formData, problem: e.target.value })}
                  placeholder="Chia sẻ thêm về nhu cầu của bạn..."
                  rows={3}
                />
              </div>

              {error && <div className="text-sm text-destructive bg-destructive/10 px-4 py-2 rounded-lg">{error}</div>}

              <Button type="submit" className="w-full bg-gradient-to-r from-[#e2baa2] to-[#75a58d] hover:scale-105 hover:shadow-xl hover:shadow-[#75a58d]/40 text-white border-0 transition-all duration-300" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang gửi...
                  </>
                ) : (
                  "Gửi yêu cầu"
                )}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
