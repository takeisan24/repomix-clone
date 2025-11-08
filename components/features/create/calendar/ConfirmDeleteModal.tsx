"use client";

import { Button } from "@/components/ui/button";
import { useTranslations } from 'next-intl';

interface ConfirmDeleteModalProps {
  onClose: () => void;
  onConfirm: () => void;
}

export function ConfirmDeleteModal({ onClose, onConfirm }: ConfirmDeleteModalProps) {
    const t = useTranslations('CreatePage.calendarSection.deleteModal');
    
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
            <div className="bg-[#2A2A30] border border-white/10 rounded-lg shadow-lg w-[320px] p-7 text-center" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-xl text-white font-semibold mb-2">{t('title')}</h3>
              <p className="text-white/70 mb-8">{t('message')}</p>
              <div className="flex items-center justify-center gap-4">
                <Button variant="outline" className="flex-1" onClick={onClose}>{t('no')}</Button>
                <Button variant="destructive" className="flex-1" onClick={onConfirm}>{t('delete')}</Button>
              </div>
            </div>
        </div>
    );
}