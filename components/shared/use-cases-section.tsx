"use client"

import { Card } from "@/components/ui/card"
import { Check } from "lucide-react"
import {useTranslations} from 'next-intl'

export default function UseCasesSection() {
  const t = useTranslations('HomePage');

  const useCases = t.raw('card') as Array<{ title: string; description: string[] }>; 
  return (
    <section id="use-cases" className="py-20 md:py-32">
      <div className="container mx-auto px-4 border border-white/30 bg-white/[.03] rounded-2xl p-8 md:p-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-balance">{t('useCasesTitle')}</h2>
          <p className="text-xl text-muted-foreground text-pretty max-w-2xl mx-auto">
            {t('useCasesSubtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {useCases.map((useCase, index) => (
            <Card key={index} className="p-8 bg-background border-border">
            <h3 className="text-2xl font-bold mb-4">{useCase.title}</h3>
            <ul className="space-y-3">
              {useCase.description.map((desc, descIndex) => (
                <li key={descIndex} className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{desc}</span>
                </li>
              ))}
            </ul>
          </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
