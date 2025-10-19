"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, X } from "lucide-react"
import Header from "@/components/shared/header"
import Footer from "@/components/shared/footer"
import Link from "next/link"
import { useTranslations, useMessages } from 'next-intl'


const FeatureValue = ({value } : {value: any}) => {
    if (typeof value === 'boolean') {
        return value ? <Check className="w-6 h-6 text-green-500 mx-auto" /> : <X className="w-6 h-6 text-red-500 mx-auto" />;
    }
}
export default function PricingPage() {

  const t = useTranslations('PricingPage');
  const messages = useMessages();
  const pricingPageMessages = messages.PricingPage as any;
// Dữ liệu cho các gói giá
  const planKeys = ['free', 'creator', 'creatorPro', 'agency'];
  const featureOrder = t.raw('featureOrder') as string[] || [];
  {/*pricingPageMessages.featureOrder*/};

  const topUpPacksData = [
      { key: "test", credits: "50 Credits", price: "$10" },
      { key: "creative", credits: "150 Credits", price: "$25" },
      { key: "professional", credits: "350 Credits", price: "$50" },
  ];

// Dữ liệu giải thích hệ thống tín dụng
  const creditSystemData = t.raw('creditSystem') as Array<{ action: string; cost: string; note: string; }>;

// Dữ liệu gói mua thêm tín dụng

// Dữ liệu FAQ
  const faqsData = t.raw('faqs') as Array<{ question: string; answer: string; }>;

  
  const FeatureValue = ({ value }: { value: any }) => {
    if (value === true) return <Check className="w-5 h-5 text-green-500" />;
    if (value === false) return <X className="w-5 h-5 text-red-500" />;
    if (value === null || value === undefined) return <span className="text-gray-500">-</span>;
    return <span className="font-semibold text-white">{value}</span>;
  };
  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <Header />
      <main className="flex-grow">
        <section className="text-center py-20 px-4">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">{t('headerTitle')}</h1>
          <p className="max-w-3xl mx-auto text-lg text-gray-400 mb-12">{t('headerSubtitle')}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto items-start">
            {planKeys.map((planKey) => {
              const isFeatured = planKey === 'creator';
              const planData = pricingPageMessages.plans[planKey];
              return(
              <Card key={planKey} className={`flex flex-col p-6 rounded-2xl border-2 h-full ${isFeatured ? "border-purple-500 bg-gray-900/50" : "border-gray-700 bg-gray-900"}`}>
                <div className="text-center mb-6">
                    {isFeatured && (
                    <span className="inline-block bg-purple-500 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4">
                        {planData.subtitle}
                    </span>
                    )}
                    <h3 className="text-2xl font-bold">{planData.name}</h3>
                    <p className="text-4xl font-bold mt-2">{planData.price}<span className="text-lg font-normal text-gray-400">{t('perMonth')}</span></p>
                </div>

                <div className="flex-grow mb-6">
                  <ul className="space-y-1 divide-y divide-gray-800">
                    {featureOrder.map((featureKey: string) => (
                      <li
                        key={featureKey}
                        className="flex justify-between items-center py-2"
                      >
                        <span>{t(`features.${featureKey}`)}</span>
                        <FeatureValue 
                          value={planData.featureValues[featureKey]}
                        />
                      </li>
                    ))}
                  </ul>
                </div>
                
                <Link href={`/checkout/${planKey}`} className="w-full mt-auto">
                    <Button className={`w-full py-3 text-lg font-semibold rounded-lg transition-colors ${isFeatured ? "bg-purple-600 hover:bg-purple-700" : "bg-white text-black hover:bg-gray-200"}`}>
                      {planData.cta}
                    </Button>
                </Link>
              </Card>
            )})}
          </div>
        </section>

        <section className="py-20 px-4">
            <h2 className="text-4xl font-bold text-center mb-4">{t('creditSystemTitle')}</h2>
            <p className="text-lg text-gray-400 text-center mb-12 max-w-3xl mx-auto">{t('creditSystemSubtitle')}</p>
            <Card className="max-w-4xl mx-auto bg-gray-900 border border-gray-700 p-8 rounded-lg">
                <div className="space-y-6">
                    {creditSystemData.map((item, index) => (
                        <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center pb-4 border-b border-gray-800 last:border-b-0">
                            <p className="font-semibold text-white md:col-span-1">{item.action}</p>
                            <p className="font-bold text-primary md:col-span-1 md:text-center">{item.cost}</p>
                            <p className="text-gray-400 md:col-span-1">{item.note}</p>
                        </div>
                    ))}
                </div>
            </Card>
        </section>

        <section className="py-20 px-4 bg-gray-950">
            <h2 className="text-4xl font-bold text-center mb-4">{t('topUpTitle')}</h2>
            <p className="text-lg text-gray-400 text-center mb-12 max-w-3xl mx-auto">{t('topUpSubtitle')}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                {topUpPacksData.map((pack) => (
                    <Card key={`${pack.key}`} className="flex flex-col items-center justify-center p-8 rounded-lg bg-gray-900 border border-gray-700">
                      <p className="text-2xl font-bold mb-2">{t(`topUpPacks.${pack.key}`)}</p>
                        <p className="text-2xl font-bold text-primary mb-4">{pack.credits}</p>
                        <Button className="w-full bg-white text-black hover:bg-gray-200 font-semibold py-2">
                            {t('buyButton', { price: pack.price })}
                        </Button>
                    </Card>
                ))}
            </div>
        </section>

        <section className="py-20 px-4">
          <h2 className="text-4xl font-bold text-center mb-12">{t('faqTitle')}</h2>
          <div className="max-w-3xl mx-auto space-y-6">
            {faqsData.map((faq, index) => (
              <div key={index} className="bg-gray-900 p-6 rounded-lg border border-gray-700">
                <h3 className="text-xl font-semibold mb-3">{faq.question}</h3>
                <p className="text-gray-400">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}



