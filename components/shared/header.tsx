"use client"

import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"
import LanguageSwitcher from "./LanguageSwitcher"
import {useTranslations} from 'next-intl'

export default function Header() {
  const t = useTranslations('Header');
  return (
    <header className="flex items-center justify-between px-4 py-4 border-b border-gray-800 sticky top-0 bg-black z-10">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold">MarketAI</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            {t('nav.features')}
          </Link>
          <Link href="/#use-cases" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            {t('nav.useCases')}
          </Link>
          <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            {t('nav.pricing')}
          </Link>
          <Link href="/faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            {t('nav.faq')}
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <Link href="/signin" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            {t('buttons.signIn')}
          </Link>
          <Button size="sm" asChild>
            <Link href="/create">{t('buttons.getStarted')}</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
