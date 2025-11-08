"use client"

import { useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Header from "@/components/shared/header"
import Footer from "@/components/shared/footer"

export default function CheckoutClient() {
  const params = useSearchParams()
  const plan = params.get("plan") || "individual"
  const period = params.get("period") || "monthly"

  const price = useMemo(() => {
    if (plan === "individual") return period === "annual" ? 288 : 30
    if (plan === "agency") return period === "annual" ? 960 : 100
    return 0
  }, [plan, period])

  const [method, setMethod] = useState<"card" | "paypal">("card")

  return (
    <>
      <Header />
      
      <div className="container mx-auto px-4 py-20 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-2">Complete Your Subscription</h1>
          <p className="text-muted-foreground">
            You're subscribing to the <span className="font-semibold capitalize">{plan}</span> plan
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left: Billing summary */}
          <Card className="p-8 bg-card border-border h-fit">
            <h2 className="text-2xl font-semibold mb-6">Billing Summary</h2>
            
            <div className="mb-6">
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-5xl font-bold">${price.toFixed(0)}</span>
                <span className="text-muted-foreground">
                  /{period === 'annual' ? 'year' : 'month'}
                </span>
              </div>
              <div className="text-sm text-muted-foreground capitalize">
                {plan} Plan • {period === 'annual' ? 'Billed Annually' : 'Billed Monthly'}
              </div>
            </div>

            <div className="border-t border-border pt-6 mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">${price.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-muted-foreground">Tax</span>
                <span className="font-medium">$0.00</span>
              </div>
              <button className="text-sm text-primary hover:underline">
                Add promotion code
              </button>
            </div>

            <div className="border-t border-border pt-6">
              <div className="flex items-center justify-between text-lg">
                <span className="font-semibold">Total due today</span>
                <span className="font-bold">${price.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-8 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span>🛡️</span>
                <span className="font-medium text-sm">30-day money-back guarantee</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Not satisfied? Get a full refund within 30 days, no questions asked.
              </p>
            </div>
          </Card>

          {/* Right: Payment details */}
          <Card className="p-8 bg-card border-border">
            <h2 className="text-2xl font-semibold mb-6">Payment Details</h2>
            
            {/* Payment Method Selection */}
            <div className="flex gap-3 mb-6">
              <Button
                variant={method === "card" ? "default" : "outline"}
                onClick={() => setMethod("card")}
                className="flex-1"
              >
                💳 Card
              </Button>
              <Button
                variant={method === "paypal" ? "default" : "outline"}
                onClick={() => setMethod("paypal")}
                className="flex-1"
              >
                PayPal
              </Button>
            </div>

            <div className="space-y-4">
              {method === "card" && (
                <>
                  <div>
                    <Label htmlFor="cardName">Tên trên thẻ</Label>
                    <Input 
                      id="cardName"
                      placeholder="Nguyễn Văn A" 
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="cardNumber">Số thẻ</Label>
                    <Input 
                      id="cardNumber"
                      placeholder="4135 3456 6578 3345" 
                      className="mt-1"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiry">Ngày hết hạn</Label>
                      <Input 
                        id="expiry"
                        placeholder="MM/YY" 
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cvv">CVV</Label>
                      <Input 
                        id="cvv"
                        placeholder="123" 
                        type="password"
                        maxLength={3}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </>
              )}

              {method === "paypal" && (
                <div className="py-8 text-center">
                  <div className="text-4xl mb-4">💳</div>
                  <p className="text-muted-foreground">
                    Bạn sẽ được chuyển hướng đến PayPal để hoàn tất thanh toán.
                  </p>
                </div>
              )}

              {method === "card" && (
                <>
                  <div className="border-t border-border pt-6 mt-6">
                    <h3 className="font-semibold mb-4">Billing Address</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="country">Quốc gia</Label>
                        <select 
                          id="country"
                          className="w-full mt-1 px-3 py-2 bg-background border border-input rounded-md"
                          defaultValue="VN"
                        >
                          <option value="VN">Việt Nam</option>
                          <option value="US">United States</option>
                        </select>
                      </div>

                      <div>
                        <Label htmlFor="address">Địa chỉ (Số nhà, tên đường)</Label>
                        <Input 
                          id="address"
                          placeholder="Số 10, Đường Lê Lợi" 
                          className="mt-1"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <Label htmlFor="city">Tỉnh/TP</Label>
                          <Input 
                            id="city"
                            placeholder="TP. HCM" 
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="district">Quận/Huyện</Label>
                          <Input 
                            id="district"
                            placeholder="Quận 1" 
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="postal">Mã BĐ</Label>
                          <Input 
                            id="postal"
                            placeholder="700000" 
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-border pt-6 mt-6">
                    <p className="text-xs text-muted-foreground mb-4">
                      Bằng cách nhấn đăng ký, bạn đồng ý với{" "}
                      <a href="#" className="text-primary hover:underline">Điều khoản sử dụng</a>
                      {" "}và{" "}
                      <a href="#" className="text-primary hover:underline">Chính sách bảo mật</a>.
                      Gói sẽ tự động gia hạn theo chu kỳ {period === 'annual' ? 'năm' : 'tháng'}.
                    </p>
                    <Button className="w-full" size="lg">
                      Đăng ký ngay • ${price.toFixed(2)}
                    </Button>
                  </div>
                </>
              )}

              {method === "paypal" && (
                <Button className="w-full" size="lg">
                  Tiếp tục với PayPal
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>

      <Footer />
    </>
  )
}