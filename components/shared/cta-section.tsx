"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import {useTranslations} from 'next-intl'

export default function CTASection() {
  const t = useTranslations('HomePage.ctaSection');
  return (
    <section className="container mx-auto px-4 py-20 md:py-32">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl md:text-6xl font-bold mb-6 text-balance">{t('title')}</h2>
        <p className="text-xl text-muted-foreground mb-8 text-pretty max-w-2xl mx-auto leading-relaxed">
          {t('subtitle')}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" className="text-base px-8">
            <a href="/create">{t('cta')}</a>
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button size="lg" variant="outline" className="text-base px-8 bg-transparent">
            <a href="/pricing">{t('pricing_view')}</a>
          </Button>
        </div>
      </div>
    </section>
  )
}
