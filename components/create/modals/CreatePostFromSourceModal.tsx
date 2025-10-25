// components/create/modals/CreatePostFromSourceModal.tsx
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X as CloseIcon } from 'lucide-react';
import { useCreatePageStore } from '@/store/createPageStore';
import { useShallow } from 'zustand/react/shallow';



const platformOptions = [
    { name: "Twitter", icon: "/x.png" }, { name: "Instagram", icon: "/instagram.png" },
    { name: "LinkedIn", icon: "/link.svg" }, { name: "Facebook", icon: "/fb.svg" },
    { name: "Pinterest", icon: "/pinterest.svg" }, { name: "TikTok", icon: "/tiktok.png" },
    { name: "Threads", icon: "/threads.png" }, { name: "Bluesky", icon: "/bluesky.png" },
    { name: "YouTube", icon: "/ytube.png" }
];

export default function CreatePostFromSourceModal() {
    const {
        isOpen, source, closeModal, generatePostsFromSource,
    } = useCreatePageStore(useShallow(state => ({
        isOpen: state.isCreateFromSourceModalOpen,
        source: state.sourceToGenerate,
        closeModal: state.closeCreateFromSourceModal,
        generatePostsFromSource: state.generatePostsFromSource,
    })));

    const [selectedPlatforms, setSelectedPlatforms] = useState<{ platform: string; count: number }[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);

    if (!isOpen || !source) return null;

    const handlePlatformToggle = (platformName: string) => {
        setSelectedPlatforms((prev) => {
      const existing = prev.find((p) => p.platform === platformName);
      if (existing) {
        return prev.filter((p) => p.platform !== platformName);
      } else {
        return [...prev, { platform: platformName, count: 1 }];
      }
    });
    };
    const handleCountChange = (platformName: string, delta: number) => {
        setSelectedPlatforms((prev) =>
      prev.map((p) =>
        p.platform === platformName
          ? { ...p, count: Math.max(1, p.count + delta) }
          : p
      )
    );
    };

    const handleGenerate = async () => {
        if (selectedPlatforms.length === 0) return;
        setIsGenerating(true);
        await generatePostsFromSource(selectedPlatforms);
        setIsGenerating(false);
        // Modal sẽ tự đóng bên trong action của store
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={closeModal}>
            <div className="bg-[#2A2A30] border border-[#3A3A42] rounded-2xl w-[600px] max-w-[95vw]" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                    <h2 className="text-lg font-semibold text-white">Tạo bài đăng mới từ nguồn</h2>
                    <button onClick={closeModal}><CloseIcon className="w-5 h-5" /></button>
                </div>
                {/* Modal Body */}
        <div className="px-6 py-4 overflow-auto" style={{ maxHeight: "60vh" }}>
          <p className="text-gray-300 mb-4">
            Nguồn: <span className="font-medium text-white">{source.type === 'text' ? 'Văn bản' : source.type === 'article' ? 'Bài viết' : source.type === 'youtube' ? 'YouTube' : source.type}</span> - <span className="text-gray-400 text-sm italic">{source.value.length > 50 ? source.value.substring(0, 50) + '...' : source.value}</span>
          </p>

          <p className="text-white mb-3">Chọn nền tảng và số lượng bài đăng cần tạo:</p>
          <div className="space-y-3">
            {platformOptions.map((option) => {
              const platformEntry = selectedPlatforms.find(p => p.platform === option.name);
              const isSelected = !!platformEntry;

              return (
                <div key={option.name} className="flex items-center justify-between py-2 px-3 bg-[#1E1E23] rounded-lg border border-[#3A3A42]">
                  <label className="flex items-center gap-3 cursor-pointer flex-grow">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handlePlatformToggle(option.name)}
                      className="accent-[#E33265] w-4 h-4"
                    />
                    <img
                      src={option.icon}
                      alt={option.name}
                      className={`w-6 h-6 ${
                        ["Twitter", "Threads"].includes(option.name)
                          ? "filter brightness-0 invert"
                          : ""
                      }`}
                    />
                    <span className="text-white">{option.name}</span>
                  </label>

                  {isSelected && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCountChange(option.name, -1)}
                        className="text-white hover:bg-white/10 px-2 py-1"
                        disabled={platformEntry?.count === 1}
                      >
                        -
                      </Button>
                      <span className="text-white font-medium w-6 text-center">{platformEntry?.count}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCountChange(option.name, 1)}
                        className="text-white hover:bg-white/10 px-2 py-1"
                      >
                        +
                      </Button>
                      <span className="text-gray-400 ml-1 text-sm">bài</span>
                    </div>
                  )}
                </div>
              );
            })}
            </div>
        </div>
        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-white/10 flex justify-end">
          <Button
            className="bg-[#E33265] hover:bg-[#c52b57] text-white py-2 px-5 rounded-md"
            onClick={handleGenerate}
            disabled={isGenerating || selectedPlatforms.length === 0}
          >
            {isGenerating ? "Đang tạo..." : "Tạo bài đăng"}
          </Button>
        </div>
            </div>
        </div>
    );
}