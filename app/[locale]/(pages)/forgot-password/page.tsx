"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Sparkles, ArrowLeft } from "lucide-react"
import Header from "@/components/shared/header"
import Footer from "@/components/shared/footer"
import Link from "next/link"

import { useTranslations } from "next-intl"

export default function ForgotPasswordPage() {
  const t = useTranslations('ForgotPasswordPage');
  const tCommon = useTranslations('Common.auth');
  const [email, setEmail] = useState("")

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <div className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
            <p className="text-muted-foreground">{t('subtitle')}</p>
          </div>

          <Card className="p-8 bg-card border-border">
            <form className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">{tCommon('email')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={tCommon('emailPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11"
                />
              </div>

              <Button type="submit" className="w-full h-11 text-base" size="lg">
                {t('form.submitButton')}
              </Button>
              
              <div className="text-center pt-4">
                <Link 
                  href="/signin" 
                  className="text-sm text-primary hover:underline font-medium flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {t('backToSignIn')}
                </Link>
              </div>
            </form>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  )
}