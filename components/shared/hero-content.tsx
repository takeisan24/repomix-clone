"use client"

import { Button } from "@/components/ui/button"
import { Sparkles, ArrowRight, Play } from "lucide-react"
import Image from "next/image"
import {useTranslations} from 'next-intl'

export default function HeroContent() {
  const t = useTranslations('HomePage.hero');
  return (
    <section className="relative container mx-auto px-4 py-20 md:py-32 overflow-hidden">
      <Image 
        src = "/gradient-hero-bg.jpg"
        alt="Gradient background"
        layout="fill"
        className="object-cover opacity-50 blur-2xl"
      />
      <div className="relative max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm mb-6">
          <Sparkles className="h-4 w-4" />
          <span>{t('AI_powered')}</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-bold mb-6 text-balance leading-tight">
          {t('title')}
        </h1>
        <p className="text-xl text-muted-foreground mb-8 text-pretty max-w-2xl mx-auto leading-relaxed">
          {t('subtitle')}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" className="text-base px-8">
            <a href="/create">{t('ctaPrimary')}</a>
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button size="lg" variant="outline" className="text-base px-8 bg-transparent">
            <Play className="mr-2 h-4 w-4" />
            {t('ctaSecondary')}
          </Button>
        </div>
      </div>
    </section>
  )
}
