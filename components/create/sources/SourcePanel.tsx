"use client";

import { Button } from '@/components/ui/button';
import { FileTextIcon, NewspaperIcon, YoutubeIcon, MusicIcon, FileIcon, HeadphonesIcon, LinkIcon, X as CloseIcon } from 'lucide-react';

// Import store để lấy dữ liệu sources và các action liên quan
import { useCreatePageStore } from '@/store/createPageStore';
import { useShallow } from 'zustand/react/shallow';

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

    const { savedSources, setIsSourceModalOpen, deleteSavedSource, openCreateFromSourceModal } = useCreatePageStore(
      useShallow(state => ({
        savedSources: state.savedSources,
        setIsSourceModalOpen: state.setIsSourceModalOpen,
        deleteSavedSource: state.deleteSavedSource,
        openCreateFromSourceModal: state.openCreateFromSourceModal,
    })));
    // Logic để mở modal tạo bài viết từ nguồn sẽ được xử lý sau, tạm thời để trống
    const handleSourceClick = (source: any) => {
        console.log("Mở modal tạo bài viết từ nguồn:", source);
        // TODO: Mở modal CreatePostFromSourceModal
        openCreateFromSourceModal({type: source.type, value:source.value});
    };
    return (
        <div className="w-[241px] border-r border-white/10 p-4 pt-[30px] flex-shrink-0">
            <div className="flex items-center justify-between mb-2">
                <Button
                    size="sm"
                    className="text-sm bg-[#E33265] hover:bg-[#c52b57] text-white px-3 py-1.5 transition-all duration-200 border-0"
                    onClick={() => setIsSourceModalOpen(true)} // Logic này sẽ được chuyển vào đây
                >
                    Thêm nguồn <span className="ml-2 text-base">+</span>
                </Button>
            </div>
        {/* Danh sách nguồn đã lưu */}
        {savedSources.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-gray-300 mb-2">Nguồn đã lưu</h3>
            <div className="space-y-2">
              {savedSources.map((source) => {
                // const sourceTypeLabel = sourceTypeOptions.find(opt => opt.key === source.type)?.label || source.type;
                // const isSelected = selectedSavedSource === source.id;
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
                          <div className="text-xs text-gray-400 mb-1">{source.type}</div>
                          <div className="text-sm text-white line-clamp-2">{source.label}</div>
                        </div>
                      </div>
                      <button
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded transition-opacity flex-shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSavedSource(source.id);
                        }}
                        aria-label="Xóa nguồn"
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