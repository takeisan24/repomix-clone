"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import {useTranslations} from 'next-intl'
import { motion } from "framer-motion"

export default function CTASection() {
  const t = useTranslations('HomePage.ctaSection');
  
  return (
    <section className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        <motion.div 
          className="bg-primary/5 border border-white/30 border-white[.03] rounded-2xl p-8 md:p-16"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <div className="max-w-4xl mx-auto text-center">
            <motion.h2 
              className="text-4xl md:text-6xl font-bold mb-6 text-balance"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {t('title')}
            </motion.h2>
            <motion.p 
              className="text-xl text-muted-foreground mb-8 text-pretty max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {t('subtitle')}
            </motion.p>
            <motion.div 
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Button size="lg" className="text-base px-8">
                <a href="/create">{t('cta')}</a>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="text-base px-8 bg-transparent">
                <a href="/pricing">{t('pricing_view')}</a>
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
