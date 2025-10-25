// components/create/modals/SourceModal.tsx
"use client";

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { UploadCloud as UploadCloudIcon } from 'lucide-react';
import { X as CloseIcon } from 'lucide-react';

import { useCreatePageStore } from '@/store/createPageStore';
import { useShallow } from 'zustand/react/shallow';

export default function SourceModal() {
    const { 
        isSourceModalOpen, 
        setIsSourceModalOpen,
        addSavedSource,
        openCreateFromSourceModal
    } = useCreatePageStore(useShallow(state => ({
        isSourceModalOpen: state.isSourceModalOpen,
        setIsSourceModalOpen: state.setIsSourceModalOpen,
        addSavedSource: state.addSavedSource,
        openCreateFromSourceModal: state.openCreateFromSourceModal,
    })));

    // State cục bộ cho form bên trong modal
    const [selectedSourceType, setSelectedSourceType] = useState('text');
    const [sourceTextInput, setSourceTextInput] = useState('');
    const [sourceUrlInput, setSourceUrlInput] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null); // <-- State mới để lưu file
    const [isUploading, setIsUploading] = useState(false); // <-- State mới cho trạng thái upload
    const [shouldSaveSource, setShouldSaveSource] = useState(true);
    const [advancedInstructions, setAdvancedInstructions] = useState('');

    const fileInputRef = useRef<HTMLInputElement>(null); // Ref cho input file ẩn

    if (!isSourceModalOpen) return null;

    // Hàm xử lý khi người dùng chọn file
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
        }
    };

   // Hàm xử lý chính khi nhấn nút "Thêm"
    const handleAdd = async () => {
        // Xử lý cho các loại nguồn URL và text như cũ
        if (selectedSourceType === 'text' || selectedSourceType === 'article' || selectedSourceType === 'youtube' || selectedSourceType === 'tiktok') {
            const value = selectedSourceType === 'text' ? sourceTextInput : sourceUrlInput;
            if (!value.trim()) return;
            const source = { type: selectedSourceType, value, label: value.substring(0, 50) + '...' };
            if (shouldSaveSource) addSavedSource(source);
            setIsSourceModalOpen(false);
            openCreateFromSourceModal(source);
        } 
        // *** XỬ LÝ MỚI CHO VIỆC UPLOAD FILE ***
        else if ((selectedSourceType === 'pdf' || selectedSourceType === 'audio') && selectedFile) {
            setIsUploading(true);
            try {
                const formData = new FormData();
                formData.append('file', selectedFile);

                // Gọi API route để upload file PDF
                // (Sau này có thể tạo route riêng cho audio)
                const response = await fetch('/api/pdf/upload', {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Upload file thất bại.');
                }

                const result = await response.json();
                
                // Sau khi upload thành công, chúng ta có file URI từ Gemini
                const source = {
                    type: selectedSourceType,
                    value: result.fileUri, // Quan trọng: value giờ là file URI
                    label: result.fileName,
                };

                if (shouldSaveSource) addSavedSource(source);
                setIsSourceModalOpen(false);
                openCreateFromSourceModal(source);

            } catch (error) {
                console.error("Lỗi upload file:", error);
                alert(error instanceof Error ? error.message : "Đã có lỗi xảy ra.");
            } finally {
                setIsUploading(false);
            }
        }
    };

    const isFileUpload = selectedSourceType === 'pdf' || selectedSourceType === 'audio';

    const sourceTypeOptions = [
    { key: "text", label: "Văn bản" },
    { key: "article", label: "Bài viết" },
    { key: "youtube", label: "YouTube" },
    { key: "tiktok", label: "TikTok" },
    { key: "perplexity", label: "Perplexity" },
    { key: "pdf", label: "PDF" },
    { key: "audio", label: "Âm thanh" },
  ]

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-[#2A2A30] border border-[#3A3A42] rounded-2xl w-[1000px] max-w-[95vw]">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                    <h2 className="text-lg font-semibold text-white">Chỉnh sửa nguồn</h2>
                    <button onClick={() => setIsSourceModalOpen(false)}>
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>
                {/* Tabs */}
            <div className="px-6 pt-4">
              <div className="grid grid-cols-7 gap-3">
                {sourceTypeOptions.map((option) => (
                  <button
                    key={option.key}
                    className={`px-4 py-3 rounded-md text-sm ${
                      selectedSourceType === (option.key as any) 
                        ? 'bg-white/10 text-white' 
                        : 'bg-transparent text-gray-300 hover:text-white hover:bg-white/5'
                    }`}
                    onClick={() => setSelectedSourceType(option.key as any)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            {/* Body */}
                        <div className="px-6 py-4 space-y-3 overflow-auto" style={{ maxHeight: "60vh" }}>
                          {/* *** THAY ĐỔI GIAO DIỆN Ở ĐÂY *** */}
                    {!isFileUpload ? (
                        <>
                            <div className="text-white">
                                {selectedSourceType === 'text' ? 'Văn bản' : 'URL'}
                            </div>
                            {selectedSourceType === 'text' ? (
                                <Textarea 
                                placeholder="Dán văn bản vào đây" 
                                className="bg-gray-900/50 border-white/10 h-40" 
                                value={sourceTextInput} onChange={(e) => setSourceTextInput(e.target.value)} />
                            ) : (
                                <Input 
                                placeholder={
                                selectedSourceType === 'article' ? 'Dán URL bài viết...' :
                                selectedSourceType === 'youtube' ? 'Dán URL YouTube...' :
                                selectedSourceType === 'tiktok' ? 'Dán URL TikTok...'
                                : 'Dán URL nguồn...'
                              }
                              className="bg-gray-900/50 border-white/10"
                                value={sourceUrlInput} 
                                onChange={(e) => setSourceUrlInput(e.target.value)} />
                            )}
                        </>
                    ) : (
                        <>
                            <div className="text-white">Tải lên tệp tin</div>
                            <div 
                                className="border-2 border-dashed border-gray-500 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    onChange={handleFileChange}
                                    accept={selectedSourceType === 'pdf' ? '.pdf' : 'audio/*'}
                                />
                                <UploadCloudIcon className="mx-auto h-12 w-12 text-gray-400" />
                                {selectedFile ? (
                                    <p className="mt-2 text-sm text-green-400">{selectedFile.name}</p>
                                ) : (
                                    <p className="mt-2 text-sm text-gray-400">Nhấn để chọn file {selectedSourceType.toUpperCase()}</p>
                                )}
                            </div>
                        </>
                    )}  
                          <label className="flex items-center gap-3 text-white pt-2">
                            <input 
                              type="checkbox" 
                              className="accent-[#E33265]"
                              checked={shouldSaveSource}
                              onChange={(e) => setShouldSaveSource(e.target.checked)}
                            />
                            <span>Lưu nguồn?</span>
                          </label>
                          <details className="text-white/90">
                            <summary className="cursor-pointer select-none">Cài đặt nâng cao</summary>
                            <div className="mt-2 text-sm text-gray-300">Chưa có cài đặt bổ sung.</div>
            
                          </details>
                          <label htmlFor="advanced-instructions" className="block text-white mb-2">
                        Chi tiết yêu cầu cho AI:
                      </label>
                      <Textarea
                        id="advanced-instructions"
                        placeholder="Ví dụ: 'Tạo bài đăng với giọng văn vui vẻ, tập trung vào lợi ích X, và kêu gọi hành động 'Tìm hiểu thêm'...' hoặc 'Phân tích điểm mạnh, điểm yếu của nguồn.'..."
                        className="bg-gray-900/50 border-white/10 h-32 mb-4 placeholder:text-gray-500"
                        value={advancedInstructions}
                        onChange={(e) => setAdvancedInstructions(e.target.value)}
                      />
                        </div>
                <div className="px-6 pb-6">
                    <button 
                    onClick={handleAdd} 
                    className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white py-3 rounded-md disabled:opacity-50"
                    disabled={isUploading || (!sourceTextInput.trim() && !sourceUrlInput.trim() && !selectedFile)}>
                        Thêm
                    </button>
                </div>
            </div>
        </div>
    );
}