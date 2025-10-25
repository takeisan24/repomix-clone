"use client"

//Import component UI
import AIChatbox from '../chat/AIChatbox';
import SourcePanel from '../sources/SourcePanel';
import PostEditor from '../editor/PostEditor';

// Import các Modal
import SourceModal from '../modals/SourceModal';
import CreatePostFromSourceModal from '../modals/CreatePostFromSourceModal';
import PublishModal from "../modals/PublishModal"
import LightboxModal from "../modals/LightboxModal"
import ImageGenModal from "../modals/ImageGenModal"
import VideoGenModal from "../modals/VideoGenModal"
import ModalManager from '../modals/ModalManager';
/**
 * Create section component with three-panel layout:
 * 1. Left panel (241px) - Sources management
 * 2. Main panel (flex-1) - Post creation editor
 * 3. Right panel (350px) - AI chatbox
 */
export default function CreateSection() {
  return (
    <>
      <div className="flex h-full w-full">
        {/* Các Panel chính */}
        <SourcePanel />
        <PostEditor />
        <AIChatbox />
      </div>
      
      {/* 
        Gọi ModalManager ở đây.
        Nó sẽ tự xử lý việc hiển thị modal nào cần thiết.
        Điều này tách biệt hoàn toàn logic render modal ra khỏi luồng render chính.
      */}
      <ModalManager />
    </>
  )
}   
