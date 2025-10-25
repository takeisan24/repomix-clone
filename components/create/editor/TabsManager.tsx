// components/create/editor/TabsManager.tsx
"use client";

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { PlusIcon, X as CloseIcon } from 'lucide-react';
import { useCreatePageStore } from '@/store/createPageStore';
import { useShallow } from 'zustand/react/shallow';

// Dữ liệu này có thể chuyển ra file constants để dùng chung
const platformOptions = [
    { name: "Twitter", icon: "/x.png" }, { name: "Instagram", icon: "/instagram.png" },
    { name: "LinkedIn", icon: "/link.svg" }, { name: "Facebook", icon: "/fb.svg" },
    { name: "Pinterest", icon: "/pinterest.svg" }, { name: "TikTok", icon: "/tiktok.png" },
    { name: "Threads", icon: "/threads.png" }, { name: "Bluesky", icon: "/bluesky.png" },
    { name: "YouTube", icon: "/ytube.png" }
];

export default function TabsManager() {
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

    return (
        <div className="flex items-center gap-3 mb-4">
            {/* Vòng lặp render các tab */}
            <div className="flex items-center gap-3 min-w-0 flex-1 overflow-x-auto scrollbar-hide">
                {posts.map((post) => (
                    <div
                        key={post.id}
                        className={`flex items-center gap-2 px-3 py-1 cursor-pointer ${
                            selectedPostId === post.id
                                ? "border-b-2 border-[#E33265] text-white"
                                : "border-b border-transparent text-gray-400 hover:text-white"
                        }`}
                        onClick={() => handlePostSelect(post.id)}
                    >
                        <span className="text-sm">{post.type}</span>
                        <button
                            onClick={(e) => {
                                e.stopPropagation(); // Ngăn sự kiện click vào tab
                                handlePostDelete(post.id);
                            }}
                            className="p-1 rounded-full hover:bg-white/10 -mr-1"
                        >
                            <CloseIcon className="w-3.5 h-3.5" />
                        </button>
                    </div>
                ))}
            </div>

            {/* Nút "Thêm bài" và dropdown */}
            <div>
            <div
                className="relative flex-shrink-0"
                onMouseEnter={() => setShowPostPicker(true)}
                onMouseLeave={() => setShowPostPicker(false)}
            >
                <Button variant="ghost" size="sm" className="bg-[#E33265] text-white hover:bg-[#c52b57]">
                    <PlusIcon className="w-4 h-4 mr-1.5" /> Thêm bài
                </Button>
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