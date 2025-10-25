// components/create/editor/PostEditor.tsx
"use client";

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { PlusIcon, X as CloseIcon, ImageIcon, SparklesIcon, ChevronDownIcon, SendIcon, ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon } from "lucide-react";

import { useCreatePageStore } from '@/store/createPageStore';
import { useShallow } from 'zustand/react/shallow';

import TabsManager from './TabsManager';
import MediaPreview from './MediaPreview';
import ActionBar from './ActionBar';

// Platform options để tạo bài mới
const platformOptions = [
    { name: "Twitter", icon: "/x.png" }, { name: "Instagram", icon: "/instagram.png" },
    { name: "LinkedIn", icon: "/link.svg" }, { name: "Facebook", icon: "/fb.svg" },
    { name: "Pinterest", icon: "/pinterest.svg" }, { name: "TikTok", icon: "/tiktok.png" },
    { name: "Threads", icon: "/threads.png" }, { name: "Bluesky", icon: "/bluesky.png" },
    { name: "YouTube", icon: "/ytube.png" }
];

export default function PostEditor() {
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
    
    // State cục bộ cho UI của editor
    const [showPostPicker, setShowPostPicker] = useState(false);

    const currentPost = posts.find(p => p.id === selectedPostId);

    return (
        <div className="flex-1 flex flex-col min-w-0 p-[15px] h-full">
            {/* Dòng quản lý Tabs */}
            <TabsManager />

            {/* Editor Card */}
            <Card className="bg-[#2A2A30] border-[#3A3A42] p-0 gap-0 rounded-[5px] flex-1 flex flex-col w-full overflow-hidden">
                {selectedPostId === 0 || posts.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center">
                        <p className="text-gray-400">Chọn hoặc tạo một bài viết để bắt đầu.</p>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col w-full">
                        <Textarea
                            placeholder={`Bạn muốn chia sẻ gì trên ${currentPost?.type || "bài viết"}?`}
                            value={postContents[selectedPostId] ?? ""}
                            onChange={(e) => handlePostContentChange(selectedPostId, e.target.value)}
                            className="w-full h-full bg-[#2A2A30] border-0 resize-none text-white placeholder:text-gray-400 focus:ring-0 p-[10px]"
                        />
                        
                        {/* Media Preview Area */}
                        <MediaPreview />

                        {/* Action bar */}
                        <ActionBar />
                    </div>
                )}
            </Card>
        </div>
    );
}