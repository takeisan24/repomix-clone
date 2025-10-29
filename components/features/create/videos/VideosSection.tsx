"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SearchIcon } from "lucide-react";
import { useCreatePageStore } from "@/store/createPageStore";
import { useShallow } from 'zustand/react/shallow';
import { toast } from "sonner";

import { VideoUploadModal } from "./VideoUploadModal";
import { VideoProjectList } from "./VideoProjectList";

export default function VideosSection() {
  const { videoProjects, handleVideoUpload, handleVideoEdit, handleVideoDelete } = useCreatePageStore(
        useShallow((state) => ({
            videoProjects: state.videoProjects,
            handleVideoUpload: state.handleVideoUpload,
            handleVideoEdit: state.handleVideoEdit,
            handleVideoDelete: state.handleVideoDelete, // Lấy thêm hàm xóa
        }))
    );
  
  const [searchTerm, setSearchTerm] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);


  return (
    <>
      <div className="w-full max-w-none mx-4 mt-4">
        <h2 className="text-lg font-semibold mb-3">Bắt đầu nhanh</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <Card 
                        className="bg-[#180F2E] border-[#E33265]/80 p-6 flex flex-col items-center justify-center text-center gap-3 hover:bg-[#EA638A]/20 hover:border-[#EA638A] hover:scale-[1.03] transition-all duration-200 cursor-pointer group" 
                        onClick={() => setShowUploadModal(true)}
                    >
                        <div className="w-12 h-12 rounded-lg bg-orange-500/10 text-orange-300 flex items-center justify-center text-xl transition-colors group-hover:bg-orange-500/20 group-hover:text-orange-200">cc</div>
                        <div className="transition-colors group-hover:text-white">
                            <div className="text-lg font-semibold text-white">Tạo phụ đề</div>
                            <div className="text-sm text-white/70 mt-1 group-hover:text-white/90">Thêm phụ đề và b-rolls</div>
                        </div>
                    </Card>

                    <Card 
                        className="bg-[#180F2E] border-[#E33265]/80 p-6 flex flex-col items-center justify-center text-center gap-3 hover:bg-[#EA638A]/20 hover:border-[#EA638A] hover:scale-[1.03] transition-all duration-200 cursor-pointer group" 
                        onClick={() => setShowUploadModal(true)}
                    >
                        <div className="w-12 h-12 rounded-lg bg-blue-500/10 text-blue-300 flex items-center justify-center text-2xl transition-colors group-hover:bg-blue-500/20 group-hover:text-blue-200">✂️</div>
                        <div className="transition-colors group-hover:text-white">
                            <div className="text-lg font-semibold text-white">Cắt ghép video</div>
                            <div className="text-sm text-white/70 mt-1 group-hover:text-white/90">Kết hợp nhiều clip</div>
                        </div>
                    </Card>

                    <Card 
                        className="bg-[#180F2E] border-[#E33265]/80 p-6 flex flex-col items-center justify-center text-center gap-3 hover:bg-[#EA638A]/20 hover:border-[#EA638A] hover:scale-[1.03] transition-all duration-200 cursor-pointer group" 
                        onClick={() => setShowUploadModal(true)}
                    >
                        <div className="w-12 h-12 rounded-lg bg-green-500/10 text-green-300 flex items-center justify-center text-2xl transition-colors group-hover:bg-green-500/20 group-hover:text-green-200">🎞️</div>
                        <div className="transition-colors group-hover:text-white">
                            <div className="text-lg font-semibold text-white">Trích clip</div>
                            <div className="text-sm text-white/70 mt-1 group-hover:text-white/90">Trích clip từ video dài</div>
                        </div>
                    </Card>
                </div>

                <div className="flex justify-center mb-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
                        <Card 
                            className="bg-[#180F2E] border-[#E33265]/80 p-4 flex items-center justify-center gap-3 hover:bg-[#EA638A]/20 hover:border-[#EA638A] hover:scale-[1.02] transition-all duration-200 cursor-pointer group"
                            onClick={() => setShowUploadModal(true)}
                        >
                            <div className="w-8 h-8 rounded-md bg-purple-500/10 text-purple-300 flex items-center justify-center text-lg transition-colors group-hover:bg-purple-500/20 group-hover:text-purple-200">◎</div>
                            <div className="text-base font-medium text-white/90 group-hover:text-white">Tạo B-rolls</div>
                        </Card>
                        
                        <Card 
                            className="bg-[#180F2E] border-[#E33265]/80 p-4 flex items-center justify-center gap-3 hover:bg-[#EA638A]/20 hover:border-[#EA638A] hover:scale-[1.02] transition-all duration-200 cursor-pointer group"
                            onClick={() => setShowUploadModal(true)}
                        >
                            <div className="w-8 h-8 rounded-md bg-sky-500/10 text-sky-300 flex items-center justify-center text-lg transition-colors group-hover:bg-sky-500/20 group-hover:text-sky-200">译</div>
                            <div className="text-base font-medium text-white/90 group-hover:text-white">Dịch phụ đề</div>
                        </Card>
                    </div>
                </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Dự án của bạn</h2>
          <div className="relative w-full max-w-xs">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="Tìm kiếm dự án..." 
              className="pl-9 bg-gray-900/50 border-white/20 h-9 text-sm focus:border-[#E33265]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <VideoProjectList
          projects={videoProjects}
          searchTerm={searchTerm}
          onEdit={handleVideoEdit}
          onAddNew={() => setShowUploadModal(true)}
          onDelete={handleVideoDelete}
        />
      </div>

      <VideoUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleVideoUpload}
      />
    </>
  );
}