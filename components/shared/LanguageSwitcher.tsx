// components/shared/LanguageSwitcher.tsx
"use client";

import {useTransition} from 'react'

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';

export default function LanguageSwitcher() {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const pathname = usePathname();
    const locale = useLocale();

  const switchLocale = (nextLocale: string) => {
    if (locale === nextLocale || isPending) return;

    startTransition(() => {
        // const newPath = pathname.replace(`/${locale}`, `/${nextLocale}`);
        // router.push(newPath);
        router.push(pathname, { locale: nextLocale });
    });
  };

  return (
    <div className="flex items-center space-x-1 border border-gray-600 rounded-lg p-1">
      <Button 
        size="sm"
        variant={locale === 'vi' ? 'secondary' : 'ghost'}
        className={`px-3 transition-opacity ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
        // Vô hiệu hóa nút khi đang chuyển đổi
        disabled={isPending} 
        onClick={() => switchLocale('vi')}
      >
        VI
      </Button>
      <Button 
        size="sm"
        variant={locale === 'en' ? 'secondary' : 'ghost'}
        className={`px-3 transition-opacity ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
        // Vô hiệu hóa nút khi đang chuyển đổi
        disabled={isPending}
        onClick={() => switchLocale('en')}
      >
        EN
      </Button>
    </div>
  );
}