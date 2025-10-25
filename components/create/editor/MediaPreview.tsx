"use client";


import { X as CloseIcon} from 'lucide-react';
import { useCreatePageStore } from '@/store/createPageStore';
import { useShallow } from 'zustand/react/shallow';

type MediaFile = { id: string; type: 'image' | 'video'; preview: string; file: File; };

export default function MediaPreview() {
  const { uploadedMedia, handleMediaRemove, openLightbox } = useCreatePageStore(useShallow(state => ({
        uploadedMedia: state.uploadedMedia,
        handleMediaRemove: state.handleMediaRemove,
        openLightbox: state.openLightbox,
    })));

  const handleMediaDownload = (media: MediaFile) => {
        const link = document.createElement('a');
        link.href = media.preview; // URL.createObjectURL() hoạt động tốt cho việc này
        link.download = media.file.name || `omnia-media-${Date.now()}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };


    // Nếu không có media, không render gì cả
    if (uploadedMedia.length === 0) {
        return null;
    }

return (
    <div className="mt-4 shrink-0 px-[10px] pb-[10px]"> {/* Thêm padding để cân đối với textarea */}
       <div className="flex gap-3 overflow-x-auto scrollbar-hide py-2">
        {uploadedMedia.map((media) => (
          <div
            key={media.id}
            className="relative w-40 h-32 flex-shrink-0 rounded-lg overflow-hidden border border-[#3A3A42] cursor-pointer" // <-- Thêm cursor-pointer
            onClick={() => openLightbox(media.preview, media.type)} // <-- Mở lightbox khi click vào media
          >
            {media.type === 'image' ? (
              <img
                src={media.preview}
                alt={`Uploaded media ${media.id}`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                onError={(e) => {
                  console.error("❌ Error loading image:", media.preview)
                  console.error("Image details:", media)
                }}
              />
            ) : (
              <video
                src={media.preview}
                className="w-full h-full object-cover"
                controls
                preload="metadata"
                onLoadedMetadata={(e) => {
                  console.log("✅ Video loaded:", {
                    src: media.preview,
                    duration: e.currentTarget.duration,
                    videoWidth: e.currentTarget.videoWidth,
                    videoHeight: e.currentTarget.videoHeight
                  })
                }}
                onError={(e) => {
                  console.error("❌ Error loading video:", media.preview)
                  console.error("Video details:", media)
                  console.error("Error event:", e)
                }}
              />
            )}

            {/* Lớp phủ tối khi hover */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300"></div>
            {/* Nút Download ở góc trên bên trái */}
            <button
              className="absolute top-1 left-1 bg-black/60 rounded-full p-1 text-white hover:bg-black/80 transition-colors z-10"
              onClick={(e) => {
                e.stopPropagation();
                handleMediaDownload(media);
              }}
              aria-label="Tải xuống media này"
              title="Tải xuống"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>

            {/* Icon "X" để xóa ảnh/video - đảm bảo nó không kích hoạt lightbox khi click */}
            <button
              className="absolute top-1 right-1 bg-black/60 rounded-full p-1 text-white hover:bg-black/80 transition-colors z-10" // <-- Thêm z-10
              onClick={(e) => {
                e.stopPropagation(); // <-- QUAN TRỌNG: Ngăn chặn sự kiện click lan ra div cha
                handleMediaRemove(media.id);
              }}
              aria-label="Xóa media này"
            >
              <CloseIcon className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>


    </div>
  )}

