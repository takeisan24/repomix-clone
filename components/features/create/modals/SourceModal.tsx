// components/create/modals/SourceModal.tsx
"use client";

import { useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { UploadCloud as UploadCloudIcon, X as CloseIcon} from 'lucide-react';
import { toast } from 'sonner';

import { useCreatePageStore } from '@/store/createPageStore';
import { useShallow } from 'zustand/react/shallow';

import { useTranslations } from 'next-intl';

export default function SourceModal() {
    const t = useTranslations('CreatePage.createSection.sourceModal');
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

    const [statusMessage, setStatusMessage] = useState('');

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
        setIsUploading(true); // Bật loading
        setStatusMessage(''); // Reset thông báo

    try {
        let sourceType = selectedSourceType;
        let sourceValue: string;
        let sourceLabel: string;
        
        // --- Logic xác định giá trị nguồn (đã tốt, giữ nguyên) ---
        if (['article', 'youtube', 'tiktok'].includes(sourceType)) {
            sourceValue = sourceUrlInput.trim();
            if (!sourceValue) throw new Error(t('errors.pleaseEnterUrl'));
            sourceLabel = sourceValue;
        } 
        else if (sourceType === 'text') {
            sourceValue = sourceTextInput.trim();
            if (!sourceValue) throw new Error(t('errors.pleaseEnterText'));
            sourceLabel = `${sourceValue.substring(0, 80)}...`;
        }
        else if (sourceType === 'pdf' && selectedFile) {
            setStatusMessage(t('errors.uploadingFile', { fileName: selectedFile.name }));
            const formData = new FormData();
            formData.append('file', selectedFile);
            const response = await fetch('/api/pdf/upload', { method: 'POST', body: formData });
            const result = await response.json();
            if (!response.ok) throw new Error(result.details || result.error || t('errors.uploadPdfFailed'));
            
            sourceValue = result.fileUri;
            sourceLabel = result.fileName;
        } 
        else {
            throw new Error(t('errors.pleaseProvideData'));
        }

        // Tạo đối tượng source
        const source = { type: sourceType, value: sourceValue, label: sourceLabel };

        // --- THAY ĐỔI LOGIC CHÍNH Ở ĐÂY ---
        
        // 1. Chỉ lưu nguồn nếu người dùng chọn
        if (shouldSaveSource) {
            addSavedSource(source);
        }
        
        // 2. Đóng modal hiện tại
        setIsSourceModalOpen(false);
        
        // 3. Hiển thị thông báo thành công thay vì mở modal mới
        toast.success(t('sourceAddSuccess', { type: sourceType }));
        
        // 4. XÓA BỎ LỆNH GỌI openCreateFromSourceModal(...)

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : t('errors.errorOccurred');
        console.error("Lỗi khi thêm nguồn:", error);
        // Thay vì setStatusMessage, chúng ta dùng toast.error
        toast.error(t('sourceAddError', { error: errorMessage }));
        // Không tắt loading ở đây để người dùng có thể thử lại
        setIsUploading(false);
    } 
    // Không cần finally nữa vì toast đã xử lý việc thông báo
};

    const isFileUpload = selectedSourceType === 'pdf' || selectedSourceType === 'audio';

    const sourceTypeOptions = [
    { key: "text", label: t('sourceTypeLabel.fromText') },
    { key: "article", label: t('sourceTypeLabel.fromArticle') },
    { key: "youtube", label: t('sourceTypeLabel.fromYoutube') },
    { key: "tiktok", label: t('sourceTypeLabel.fromTiktok') },
    { key: "pdf", label: t('sourceTypeLabel.fromPDF') },
    { key: "audio", label: t('sourceTypeLabel.fromAudio') },
  ]

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-[#2A2A30] border border-[#3A3A42] rounded-2xl w-[1000px] max-w-[95vw]">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                    <h2 className="text-lg font-semibold text-white">{t('title')}</h2>
                    <button onClick={() => setIsSourceModalOpen(false)}>
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>
                {/* Tabs */}
            <div className="px-6 pt-4">
              <div className="grid grid-cols-6 gap-3">
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
                                {t('modalLabel')}
                            </div>
                            {selectedSourceType === 'text' ? (
                                <Textarea 
                                placeholder={t('sourceInputPlaceholder.fromText')} 
                                className="bg-gray-900/50 border-white/10 h-40" 
                                value={sourceTextInput} onChange={(e) => setSourceTextInput(e.target.value)} />
                            ) : (
                                <Input 
                                placeholder={
                                selectedSourceType === 'article' ? t('sourceInputPlaceholder.fromArticle') :
                                selectedSourceType === 'youtube' ? t('sourceInputPlaceholder.fromYoutube') :
                                selectedSourceType === 'tiktok' ? t('sourceInputPlaceholder.fromTiktok')
                                : t('sourceInputPlaceholder.fromSource')
                              }
                              className="bg-gray-900/50 border-white/10"
                                value={sourceUrlInput} 
                                onChange={(e) => setSourceUrlInput(e.target.value)} />
                            )}
                        </>
                    ) : (
                        <>
                            <div className="text-white">{t('fileLabel')}</div>
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
                                    <p className="mt-2 text-sm text-gray-400">{t('sourceInputPlaceholder.fromFile')} {selectedSourceType.toUpperCase()}</p>
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
                            <span>{t('sourceSavedCheckbox')}</span>
                          </label>
                          <details className="text-white/90">
                            <summary className="cursor-pointer select-none">{t('advancedOptions')}</summary>
                            <div className="mt-2 text-sm text-gray-300">{t('mockOptionsText')}</div>
            
                          </details>
                          <label htmlFor="advanced-instructions" className="block text-white mb-2">
                        {t('chatRequestLabel')}
                      </label>
                      <Textarea
                        id="advanced-instructions"
                        placeholder={t('chatPlaceholder')}
                        className="bg-gray-900/50 border-white/10 h-32 mb-4 placeholder:text-gray-500"
                        value={advancedInstructions}
                        onChange={(e) => setAdvancedInstructions(e.target.value)}
                      />
                        </div>
                <div className="px-6 pb-6">
                    {statusMessage && (
  <p className={`text-center text-sm mb-2 ${statusMessage.startsWith('Lỗi') ? 'text-red-400' : 'text-gray-300'}`}>
    {statusMessage}
  </p>
)}
                    <button 
                    onClick={handleAdd} 
                    className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white py-3 rounded-md disabled:opacity-50"
                    disabled={isUploading || (!sourceTextInput.trim() && !sourceUrlInput.trim() && !selectedFile)}>
                        {t('addButton')}
                    </button>
                </div>
            </div>
        </div>
    );
}