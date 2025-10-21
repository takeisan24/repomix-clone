"use client"

import { Card } from "@/components/ui/card"
import { Link2, Share2, Sparkles, MessageSquare, Calendar, Zap } from "lucide-react"
import { useTranslations } from "next-intl"

export default function FeaturesGrid() {
  const t = useTranslations('HomePage');
  return (
    <section id="features" className="py-20 md:py-32">
      <div className="container mx-auto px-4 border border-white/30 bg-white/[.03] rounded-2xl p-8 md:p=16">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-balance">
          {t('featuresTitle')}
        </h2>
        <p className="text-xl text-muted-foreground text-pretty max-w-2xl mx-auto">
          {t('featureSubtitle')}
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6 bg-card border-border hover:border-primary/50 transition-colors">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
            <Link2 className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">{t('features.feature1.title')}</h3>
          <p className="text-muted-foreground leading-relaxed">
            {t('features.feature1.description')}
          </p>
        </Card>

        <Card className="p-6 bg-card border-border hover:border-primary/50 transition-colors">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
            <Share2 className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">{t('features.feature2.title')}</h3>
          <p className="text-muted-foreground leading-relaxed">
            {t('features.feature2.description')}
          </p>
        </Card>

        <Card className="p-6 bg-card border-border hover:border-primary/50 transition-colors">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">{t('features.feature3.title')}</h3>
          <p className="text-muted-foreground leading-relaxed">
            {t('features.feature3.description')}
          </p>
        </Card>

        <Card className="p-6 bg-card border-border hover:border-primary/50 transition-colors">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
            <MessageSquare className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">{t('features.feature4.title')}</h3>
          <p className="text-muted-foreground leading-relaxed">
            {t('features.feature4.description')}
          </p>
        </Card>

        <Card className="p-6 bg-card border-border hover:border-primary/50 transition-colors">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
            <Calendar className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">{t('features.feature5.title')}</h3>
          <p className="text-muted-foreground leading-relaxed">
            {t('features.feature5.description')}
          </p>
        </Card>

        <Card className="p-6 bg-card border-border hover:border-primary/50 transition-colors">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
            <Zap className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">{t('features.feature6.title')}</h3>
          <p className="text-muted-foreground leading-relaxed">
            {t('features.feature6.description')}
          </p>
        </Card>
      </div>
      </div>
    </section>
  )
}
