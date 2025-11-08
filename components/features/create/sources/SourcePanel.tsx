"use client";

import { Button } from '@/components/ui/button';
import { FileTextIcon, NewspaperIcon, YoutubeIcon, MusicIcon, FileIcon, HeadphonesIcon, LinkIcon, X as CloseIcon, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';

// Import store để lấy dữ liệu sources và các action liên quan
import { useCreatePageStore } from '@/store/createPageStore';
import { useShallow } from 'zustand/react/shallow';

import { useTranslations } from 'next-intl';
import Tooltip from '@/components/shared/Tooltip';

const SourceIcon = ({ type, isSelected }: { type: string, isSelected: boolean }) => {
    const iconClass = `w-5 h-5 ${isSelected ? 'text-[#E33265]' : 'text-gray-400'}`;
    switch(type) {
        case 'text': return <FileTextIcon className={iconClass} />;
        case 'article': return <NewspaperIcon className={iconClass} />;
        case 'youtube': return <YoutubeIcon className={iconClass} />;
        case 'tiktok': return <MusicIcon className={iconClass} />;
        case 'pdf': return <FileIcon className={iconClass} />;
        case 'audio': return <HeadphonesIcon className={iconClass} />;
        default: return <LinkIcon className={iconClass} />;
    }
};


export default function SourcePanel() {

    const t = useTranslations('CreatePage.createSection.sourcePanel');
    const [isExpanded, setIsExpanded] = useState(true);
    const [hasSeenTour, setHasSeenTour] = useState(true); // Default true, will check localStorage

    const { savedSources, setIsSourceModalOpen, deleteSavedSource, openCreateFromSourceModal } = useCreatePageStore(
      useShallow(state => ({
        savedSources: state.savedSources,
        setIsSourceModalOpen: state.setIsSourceModalOpen,
        deleteSavedSource: state.deleteSavedSource,
        openCreateFromSourceModal: state.openCreateFromSourceModal,
    })));
    
    // Check if user has seen the onboarding tour
    useEffect(() => {
        const seen = localStorage.getItem('hasSeenOnboarding');
        setHasSeenTour(!!seen);
    }, []);
    
    // Auto-collapse when sources > 5
    useEffect(() => {
        if (savedSources.length > 5) {
            setIsExpanded(false);
        }
    }, [savedSources.length]);
    
    // Helper function to get translated source type
    const getSourceTypeLabel = (type: string) => {
        return t(`sourceTypes.${type}`, { defaultValue: type });
    };
    
    // Logic để mở modal tạo bài viết từ nguồn sẽ được xử lý sau, tạm thời để trống
    const handleSourceClick = (source: any) => {
        console.log("Opening create from source modal:", source);
        openCreateFromSourceModal({type: source.type, value:source.value});
    };
    return (
        <div className="w-full h-full border-r border-white/10 p-4 pt-[30px]" data-tour="source-list">
            {/* Add tour attribute */}
            <div className="flex items-center justify-between mb-2" data-tour="add-source">
                <Tooltip content={t('tooltips.addSource')} position="right">
                    <Button
                        size="sm"
                        className="text-sm bg-[#E33265] hover:bg-[#c52b57] text-white px-3 py-1.5 transition-all duration-200 border-0 relative"
                        onClick={() => setIsSourceModalOpen(true)}
                    >
                        {/* Pulse animation only when: haven't seen tour AND no sources yet */}
                        {!hasSeenTour && savedSources.length === 0 && (
                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E33265] opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#E33265]"></span>
                            </span>
                        )}
                        {t('addSource')} <span className="ml-2 text-base">+</span>
                    </Button>
                </Tooltip>
            </div>

            {/* Empty state với hướng dẫn */}
            {savedSources.length === 0 && (
                <div className="mt-4 p-4 rounded-lg bg-[#1E1E23] border border-dashed border-white/20">
                    <p className="text-xs text-gray-400 text-center mb-3">
                        {t('emptyState.description')}
                    </p>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#E33265]/20 text-[#E33265] font-semibold text-[10px]">1</span>
                            <span>{t('emptyState.step1')}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-700 text-gray-400 font-semibold text-[10px]">2</span>
                            <span>{t('emptyState.step2')}</span>
                        </div>
                    </div>
                </div>
            )}

        {/* Danh sách nguồn đã lưu */}
        {savedSources.length > 0 && (
          <div className="mt-4" data-tour="source-list">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-300">
                    {t('sourcesTitle')} ({savedSources.length})
                </h3>
                {savedSources.length > 3 && (
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-1"
                    >
                        {isExpanded ? (
                            <>
                                <ChevronUp className="w-3 h-3" />
                                {t('collapse')}
                            </>
                        ) : (
                            <>
                                <ChevronDown className="w-3 h-3" />
                                {t('expand')}
                            </>
                        )}
                    </button>
                )}
            </div>
            <div className={`space-y-2 transition-all duration-300 ${!isExpanded ? 'max-h-[200px] overflow-hidden' : ''}`}>
              {savedSources.map((source, index) => {
                // Show only first 3 when collapsed
                if (!isExpanded && index >= 3) return null;
                
                return (
                  <div
                    key={source.id}
                    className="group relative p-3 rounded-lg border cursor-pointer transition-all bg-[#1E1E23] border-white/10 hover:border-[#E33265]/50"
                    onClick={() => handleSourceClick(source)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 flex-1 min-w-0">
                        <div className="flex-shrink-0 mt-0.5">
                          <SourceIcon type={source.type} isSelected={false} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-gray-400 mb-1">{getSourceTypeLabel(source.type)}</div>
                          <div className="text-sm text-white line-clamp-2">{source.label}</div>
                        </div>
                      </div>
                      <button
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded transition-opacity flex-shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSavedSource(source.id);
                          toast.success(t('sourceDeleted'));
                        }}
                        aria-label={t('deleteSource')}
                      >
                        <CloseIcon className="w-3.5 h-3.5 text-red-400" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        </div>
    );
}