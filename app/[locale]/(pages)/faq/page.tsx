"use client"

import React, { useState } from "react"
import { ChevronDown } from "lucide-react"
import Header from "@/components/shared/header"
import Footer from "@/components/shared/footer"

export default function FAQPage() {
  const faqs: Array<{ q: string; a: React.ReactNode }> = [
    {
      q: "What exactly does your service do?",
      a: (
        <div>
          <p className="mb-2">We help content creators streamline their social media presence by scheduling, scripting, and generating content across TikTok, YouTube, and Instagram. Our platform can:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Write scripts for your videos.</li>
            <li>Generate captions and hashtags tailored for engagement.</li>
            <li>Create short-form video drafts (ready for you to edit or post).</li>
            <li>Schedule everything so you can stay consistent without burning out.</li>
          </ul>
        </div>
      ),
    },
    {
      q: "How does it work?",
      a: (
        <div>
          <ol className="list-decimal list-inside space-y-1">
            <li>You tell us your niche, target audience, and preferred platforms.</li>
            <li>Our AI and creative team generate scripts, captions, and/or video drafts for you.</li>
            <li>You review, approve, or request edits.</li>
            <li>We help you schedule your content so it goes live at the best times for engagement.</li>
          </ol>
          <p className="mt-2">Think of it as having a content studio on autopilot.</p>
        </div>
      ),
    },
    { q: "Who owns the content you create for me?", a: <p>You do. 100%. Everything we generate—scripts, captions, videos—belongs to you once delivered.</p> },
    { q: "Can I make edits to the scripts or videos?", a: <p>Absolutely. You can edit scripts, captions, and video drafts directly in our platform before posting. We encourage customization so your unique voice shines through.</p> },
    { q: "How much does it cost?", a: <ul className="list-disc list-inside space-y-1"><li>Monthly ($30/month Individual, $100/month Agency)</li><li>Annual ($288/year Individual, $960/year Agency)</li></ul> },
    { q: "Do you offer a free trial?", a: <p>Yes! We offer a 7-day free trial so you can test the workflow before committing.</p> },
    { q: "What platforms do you support?", a: <p>Currently: TikTok, YouTube Shorts, and Instagram Reels. We’re working on expanding to LinkedIn and X (Twitter).</p> },
    { q: "How do you ensure the scripts and captions match my style?", a: <p>During onboarding, we’ll ask about your tone, niche, and audience preferences. Our system then learns your style and generates drafts tailored to your voice. You can always provide feedback to fine-tune results.</p> },
    { q: "Do you guarantee growth?", a: <div><p className="mb-2">We can’t guarantee a specific number of followers or views—social media algorithms are unpredictable. What we do guarantee is:</p><ul className="list-disc list-inside space-y-1"><li>Consistent content output.</li><li>High-quality scripts and captions tailored for engagement.</li><li>A streamlined workflow that saves you time.</li></ul><p className="mt-2">Consistency + quality = the foundation for growth.</p></div> },
    { q: "Can I cancel anytime?", a: <p>Yes, all subscriptions are month-to-month. Cancel anytime with no hidden fees.</p> },
    { q: "Do you offer refunds?", a: <p>We provide refunds within the first 14 days of your first paid plan if you’re not satisfied.</p> },
    { q: "What if I need human help?", a: <p>We have a support team (real humans!) available via chat and email. For Pro and Agency plans, we also offer one-on-one onboarding calls.</p> },
  ]

  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-20 md:py-32 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-muted-foreground">
            Everything you need to know about MarketAI
          </p>
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          {faqs.map((item, idx) => {
            const isOpen = openIndex === idx
            return (
              <div 
                key={idx} 
                className="border border-border rounded-lg bg-card overflow-hidden transition-all hover:border-primary/50"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full text-left p-6 flex items-center justify-between gap-4 hover:bg-muted/50 transition-colors"
                  aria-expanded={isOpen}
                >
                  <span className="text-lg font-semibold pr-8">
                    {item.q}
                  </span>
                  <ChevronDown 
                    className={`h-5 w-5 flex-shrink-0 text-muted-foreground transition-transform ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                
                {isOpen && (
                  <div className="px-6 pb-6 text-muted-foreground leading-relaxed">
                    {item.a}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center p-8 bg-primary/5 border border-primary/20 rounded-lg">
          <h2 className="text-2xl font-bold mb-2">Still have questions?</h2>
          <p className="text-muted-foreground mb-6">
            Can't find the answer you're looking for? Our support team is here to help.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a 
              href="mailto:support@marketai.com" 
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Contact Support
            </a>
            <a 
              href="/pricing" 
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-border hover:bg-muted transition-colors"
            >
              View Pricing
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}


