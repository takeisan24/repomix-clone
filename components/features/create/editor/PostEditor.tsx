// components/create/editor/PostEditor.tsx
"use client";

import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

import { useCreatePageStore } from '@/store/createPageStore';
import { useShallow } from 'zustand/react/shallow';
import { useTranslations } from 'next-intl';
import { PlusCircle, MessageSquare, Sparkles } from 'lucide-react';

import TabsManager from './TabsManager';
import MediaPreview from './MediaPreview';
import ActionBar from './ActionBar';

export default function PostEditor() {
    const t = useTranslations('CreatePage.createSection.postPanel');
    // State và actions cho phần nội dung
    const {
        posts,
        selectedPostId,
        postContents,
        handlePostContentChange,
    } = useCreatePageStore(useShallow(state => ({
        posts: state.openPosts,
        selectedPostId: state.selectedPostId,
        postContents: state.postContents,
        handlePostContentChange: state.handlePostContentChange,
    })));

    const currentPost = posts.find(p => p.id === selectedPostId);

    return (
        <div className="flex-1 flex flex-col min-w-0 p-[15px] h-full" data-tour="create-post">
            {/* Dòng quản lý Tabs */}
            <TabsManager />

            {/* Editor Card */}
            <Card className="bg-[#2A2A30] border-[#3A3A42] p-0 gap-0 rounded-[5px] flex-1 flex flex-col w-full">
                {selectedPostId === 0 || posts.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center p-8">
                        <div className="max-w-md text-center space-y-6">
                            {/* Icon */}
                            <div className="flex justify-center">
                                <div className="relative">
                                    <div className="w-20 h-20 bg-[#E33265]/10 rounded-full flex items-center justify-center">
                                        <Sparkles className="w-10 h-10 text-[#E33265]" />
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#E33265] rounded-full flex items-center justify-center">
                                        <PlusCircle className="w-5 h-5 text-white" />
                                    </div>
                                </div>
                            </div>

                            {/* Title */}
                            <div className="space-y-2">
                                <h3 className="text-xl font-semibold text-white">
                                    {t('emptyState.title')}
                                </h3>
                                <p className="text-sm text-gray-400 leading-relaxed">
                                    {t('emptyState.description')}
                                </p>
                            </div>

                            {/* Steps */}
                            <div className="space-y-3 text-left">
                                <div className="flex items-start gap-3 p-3 rounded-lg bg-[#1E1E23] border border-white/5 hover:border-[#E33265]/30 transition-colors">
                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#E33265]/20 text-[#E33265] font-bold text-sm flex-shrink-0 mt-0.5">
                                        1
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-white mb-1">
                                            {t('emptyState.step1.title')}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {t('emptyState.step1.description')}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-3 rounded-lg bg-[#1E1E23] border border-white/5 hover:border-[#E33265]/30 transition-colors">
                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#E33265]/20 text-[#E33265] font-bold text-sm flex-shrink-0 mt-0.5">
                                        2
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-white mb-1">
                                            {t('emptyState.step2.title')}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {t('emptyState.step2.description')}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-3 rounded-lg bg-[#1E1E23] border border-white/5 hover:border-[#E33265]/30 transition-colors">
                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#E33265]/20 text-[#E33265] font-bold text-sm flex-shrink-0 mt-0.5">
                                        3
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-white mb-1">
                                            {t('emptyState.step3.title')}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {t('emptyState.step3.description')}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Tip */}
                            <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                <MessageSquare className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-blue-300 text-left">
                                    <strong className="font-semibold">{t('emptyState.tip.title')}</strong> {t('emptyState.tip.description')}
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                     // --- BỐ CỤC MỚI BẮT ĐẦU TỪ ĐÂY ---
                    <div className="flex-1 flex flex-col min-h-0"> {/* 1. Container chính */}
                        
                        {/* 2. Khu vực có thể cuộn */}
                        <div className="flex-1 overflow-y-auto">
                            <Textarea
                                placeholder={`${t('postContentPlaceholder')} ${currentPost?.type || "post"}?`}
                                value={postContents[selectedPostId] ?? ""}
                                onChange={(e) => handlePostContentChange(selectedPostId, e.target.value)}
                                // 3. Bỏ h-full, để nó tự co giãn theo nội dung
                                className="w-full bg-[#2A2A30] border-0 resize-none text-white placeholder:text-gray-400 focus:ring-0 p-[10px] min-h-[200px]" // Thêm min-h để có không gian ban đầu
                            />
                            
                            {/* MediaPreview giờ sẽ nằm trong cùng khu vực cuộn */}
                            <MediaPreview />
                        </div>

                        {/* 3. ActionBar nằm ngoài khu vực cuộn */}
                        <ActionBar />
                    </div>
                )}
            </Card>
        </div>
    );
}