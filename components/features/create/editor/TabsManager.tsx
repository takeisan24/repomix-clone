// components/create/editor/TabsManager.tsx
"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PlusIcon, X as CloseIcon, ChevronDown, ChevronUp } from 'lucide-react';
import { useCreatePageStore } from '@/store/createPageStore';
import { useShallow } from 'zustand/react/shallow';
import { useTranslations } from 'next-intl';
import Tooltip from '@/components/shared/Tooltip';

// Dữ liệu này có thể chuyển ra file constants để dùng chung
const platformOptions = [
    { name: "Twitter", icon: "/x.png" }, { name: "Instagram", icon: "/instagram.png" },
    { name: "LinkedIn", icon: "/link.svg" }, { name: "Facebook", icon: "/fb.svg" },
    { name: "Pinterest", icon: "/pinterest.svg" }, { name: "TikTok", icon: "/tiktok.png" },
    { name: "Threads", icon: "/threads.png" }, { name: "Bluesky", icon: "/bluesky.png" },
    { name: "YouTube", icon: "/ytube.png" }
];

// Helper to get platform icon
const getPlatformIcon = (platformName: string) => {
    const platform = platformOptions.find(p => p.name === platformName);
    return platform?.icon || "/default.png";
};

export default function TabsManager() {
    const t = useTranslations('CreatePage.createSection.postPanel');
    // Component này chỉ cần các state và action liên quan đến việc quản lý tab
    const {
        posts,
        selectedPostId,
        handlePostSelect,
        handlePostCreate,
        handlePostDelete,
    } = useCreatePageStore(useShallow(state => ({
        posts: state.openPosts,
        selectedPostId: state.selectedPostId,
        handlePostSelect: state.handlePostSelect,
        handlePostCreate: state.handlePostCreate,
        handlePostDelete: state.handlePostDelete,
    })));

    // State cục bộ cho dropdown "Thêm bài"
    const [showPostPicker, setShowPostPicker] = useState(false);
    const [hasSeenTour, setHasSeenTour] = useState(true);
    const [isTabsCollapsed, setIsTabsCollapsed] = useState(false);
    const postPickerRef = useRef<HTMLDivElement>(null);

    // Check if user has seen the onboarding tour
    useEffect(() => {
        const seen = localStorage.getItem('hasSeenOnboarding');
        setHasSeenTour(!!seen);
    }, []);

    // Auto-collapse tabs when > 5 posts
    useEffect(() => {
        if (posts.length >= 5) {
            setIsTabsCollapsed(true);
        } else {
            setIsTabsCollapsed(false);
        }
    }, [posts.length]);

    // Hàm để đóng dropdown khi click ra ngoài
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (postPickerRef.current && !postPickerRef.current.contains(event.target as Node)) {
                setShowPostPicker(false);
            }
        }
        // Thêm event listener khi component mount
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            // Dọn dẹp event listener khi component unmount
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [postPickerRef]);
    // --- KẾT THÚC LOGIC MỚI ---

    return (
        <div className="flex items-center gap-3 mb-4">
            {/* Vòng lặp render các tab */}
            <div className="flex items-center gap-3 min-w-0 flex-1 overflow-x-auto scrollbar-hide">
                {/* Show all tabs when <= 5, or show first 3 when > 5 and collapsed */}
                {posts.map((post, index) => {
                    // When collapsed, only show first 3 tabs
                    if (isTabsCollapsed && index >= 3) return null;
                    
                    const platformIcon = getPlatformIcon(post.type);
                    
                    return (
                        <Tooltip key={post.id} content={`${post.type} post`} position="top">
                            <div
                                className={`flex items-center gap-2 px-3 py-1.5 cursor-pointer rounded-t-lg transition-all ${
                                    selectedPostId === post.id
                                        ? "border-b-2 border-[#E33265] text-white bg-[#2A2A30]"
                                        : "border-b border-transparent text-gray-400 hover:text-white hover:bg-[#2A2A30]/50"
                                }`}
                                onClick={() => handlePostSelect(post.id)}
                            >
                                {/* Platform Icon */}
                                <img 
                                    src={platformIcon} 
                                    alt={post.type}
                                    className={`w-4 h-4 ${["Twitter", "Threads"].includes(post.type) ? "filter brightness-0 invert" : ""}`}
                                />
                                {/* Platform Name - hidden completely when collapsed */}
                                {!isTabsCollapsed && (
                                    <span className="text-sm">
                                        {post.type}
                                    </span>
                                )}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handlePostDelete(post.id);
                                    }}
                                    className="p-0.5 rounded-full hover:bg-red-500/20 -mr-1 transition-colors"
                                >
                                    <CloseIcon className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </Tooltip>
                    );
                })}
                
                {/* Show expand/collapse toggle when > 5 posts */}
                {posts.length >= 5 && (
                    <button
                        onClick={() => setIsTabsCollapsed(!isTabsCollapsed)}
                        className="flex-shrink-0 px-2 py-1 text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-1 rounded-lg hover:bg-[#2A2A30]/50"
                    >
                        {isTabsCollapsed ? (
                            <>
                                <span>+{posts.length - 3}</span>
                                <ChevronDown className="w-3 h-3" />
                            </>
                        ) : (
                            <>
                                <ChevronUp className="w-3 h-3" />
                            </>
                        )}
                    </button>
                )}
            </div>

            {/* Nút "Thêm bài" và dropdown */}
            <div>
            <div
                className="relative flex-shrink-0"
                ref={postPickerRef}
            >
                <Tooltip content={t('tooltips.addPost')} position="top">
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className="bg-[#E33265] text-white hover:bg-[#c52b57] relative"
                        onClick={() => setShowPostPicker(prev => !prev)}
                    >
                        {/* Pulse animation when: haven't seen tour AND no posts yet */}
                        {!hasSeenTour && posts.length === 0 && (
                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E33265] opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#E33265]"></span>
                            </span>
                        )}
                        <PlusIcon className="w-4 h-4 mr-1.5" /> {t('addPost')}
                    </Button>
                </Tooltip>
                {showPostPicker && (
                    <div className="absolute right-0 top-full z-20 mt-2 w-[13.75rem] bg-[#2A2A30] border border-[#3A3A42] rounded-lg shadow-lg p-3">
                        <div className="space-y-1">
                            {platformOptions.map((option) => (
                                <button
                                    key={option.name}
                                    onClick={() => {
                                        handlePostCreate(option.name);
                                        setShowPostPicker(false);
                                    }}
                                    className="w-full text-left px-4 py-3 rounded-md hover:bg-white/5 text-base text-gray-200 flex items-center gap-4"
                                >
                                    <img src={option.icon} alt={option.name} className={`w-7 h-7 ${["Twitter", "Threads"].includes(option.name) ? "filter brightness-0 invert" : ""}`} />
                                    <span>{option.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            </div>
        </div>
    );
}