"use client";


import { X as CloseIcon } from 'lucide-react';
import { useCreatePageStore } from '@/store/createPageStore';
import { useShallow } from 'zustand/react/shallow';


export default function LightboxModal() {
// Lấy state và action từ store
    const { lightboxMedia, closeLightbox } = useCreatePageStore(useShallow(state => ({
        lightboxMedia: state.lightboxMedia,
        closeLightbox: state.closeLightbox,
    })));

    const { url, type } = lightboxMedia;

    // Nếu không có url, không render gì cả
    if (!url) {
        return null;
    }

return (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={closeLightbox}
        >
          <div
            className="relative max-w-full max-h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()} // Ngăn chặn đóng modal khi click vào ảnh
          >
            <button
              className="absolute top-4 right-4 bg-black/60 rounded-full p-2 text-white hover:bg-black/80 transition-colors"
              onClick={closeLightbox}
              aria-label="Đóng ảnh"
            >
              <CloseIcon className="w-6 h-6" />
            </button>

            {type === 'image' ? (
              <img
                src={url}
                alt="Ảnh phóng to"
                className="max-w-full max-h-[90vh] object-contain rounded-lg" // Điều chỉnh kích thước và giữ tỷ lệ
              />
            ) : (
              <video
                src={url}
                controls // Hiển thị controls cho video phóng to
                autoPlay
                loop
                className="max-w-full max-h-[90vh] object-contain rounded-lg"
              />
            )}
          </div>
        </div>
      )
}