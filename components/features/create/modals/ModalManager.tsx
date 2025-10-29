// components/create/modals/ModalManager.tsx
"use client";

import { useCreatePageStore } from "@/store/createPageStore";
import { useShallow } from 'zustand/react/shallow';

// Import tất cả các modal của bạn
import SourceModal from './SourceModal';
import CreatePostFromSourceModal from './CreatePostFromSourceModal';
import PublishModal from './PublishModal';
import ImageGenModal from './ImageGenModal';
import VideoGenModal from './VideoGenModal';
import LightboxModal from './LightboxModal';

export default function ModalManager() {
    // Chỉ lấy các state boolean để quyết định modal nào sẽ hiển thị
    const {
        isSourceModalOpen,
        isCreateFromSourceModalOpen,
        isPublishModalOpen,
        isImageGenModalOpen,
        isVideoGenModalOpen,
        lightboxUrl,
    } = useCreatePageStore(useShallow(state => ({
        isSourceModalOpen: state.isSourceModalOpen,
        isCreateFromSourceModalOpen: state.isCreateFromSourceModalOpen,
        isPublishModalOpen: state.isPublishModalOpen,
        isImageGenModalOpen: state.isImageGenModalOpen,
        isVideoGenModalOpen: state.isVideoGenModalOpen,
        lightboxUrl: state.lightboxMedia.url,
    })));

    // Logic render có điều kiện
    // Chỉ khi một state `isOpen` là true, modal tương ứng mới được render.
    // Điều này đảm bảo các modal không được render ẩn và gây ra các side effect.
    return (
        <>
            {isSourceModalOpen && <SourceModal />}
            {lightboxUrl && <LightboxModal />}
            {isCreateFromSourceModalOpen && <CreatePostFromSourceModal />}
            {isPublishModalOpen && <PublishModal />}
            {isImageGenModalOpen && <ImageGenModal />}
            {isVideoGenModalOpen && <VideoGenModal />}
        </>
    );
}