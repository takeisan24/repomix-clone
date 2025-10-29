// components/create/editor/PostEditor.tsx
"use client";

import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

import { useCreatePageStore } from '@/store/createPageStore';
import { useShallow } from 'zustand/react/shallow';

import TabsManager from './TabsManager';
import MediaPreview from './MediaPreview';
import ActionBar from './ActionBar';

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
                     // --- BỐ CỤC MỚI BẮT ĐẦU TỪ ĐÂY ---
                    <div className="flex-1 flex flex-col min-h-0"> {/* 1. Container chính */}
                        
                        {/* 2. Khu vực có thể cuộn */}
                        <div className="flex-1 overflow-y-auto">
                            <Textarea
                                placeholder={`Bạn muốn chia sẻ gì trên ${currentPost?.type || "bài viết"}?`}
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