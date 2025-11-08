"use client";

import { Card } from "@/components/ui/card";
import { PlayIcon, FilmIcon } from "lucide-react";
import { useMemo } from "react";
import { useTranslations } from "next-intl";

import type { VideoProject } from "@/store/createPageStore";

interface VideoProjectListProps {
  projects: VideoProject[];
  searchTerm: string; 
  onEdit: (projectId: string) => void;
  onAddNew: () => void;
  onDelete: (projectId: string) => void;
}

export function VideoProjectList({ projects, searchTerm, onEdit, onAddNew, onDelete }: VideoProjectListProps) {
  const t = useTranslations('CreatePage.videosSection');
  
  const filteredProjects = useMemo(() => 
    projects.filter(project =>
      project.title.toLowerCase().includes(searchTerm.toLowerCase())
    ), [projects, searchTerm]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {filteredProjects.map((project) => (
        <Card 
          key={project.id}
          className="bg-[#180F2E] border-[#E33265]/80 p-0 overflow-hidden hover:bg-[#EA638A]/20 hover:border-[#EA638A] hover:scale-[1.03] transition-all duration-200 cursor-pointer group"
          onClick={() => onEdit(project.id)}
        >
          <div className="relative w-full aspect-video bg-gray-800/50 overflow-hidden">
            {project.thumbnail ? (
              <img src={project.thumbnail} alt={project.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <PlayIcon className="w-8 h-8 text-gray-400 transition-transform group-hover:scale-110" />
              </div>
            )}
            <div className={`absolute top-2 right-2 w-2.5 h-2.5 rounded-full border border-black/20 ${
              project.status === 'completed' ? 'bg-green-500' : project.status === 'processing' ? 'bg-yellow-500' : 'bg-red-500'
            }`} title={`Status: ${project.status}`} />
            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded">
              {project.duration}
            </div>
          </div>
          <div className="p-3">
            <h3 className="text-sm font-medium text-white truncate mb-1 group-hover:text-white">{project.title}</h3>
            <p className="ext-xs text-gray-400 group-hover:text-gray-300 transition-colors">{new Date(project.createdAt).toLocaleDateString('vi-VN')}</p>
          </div>
          <button
                            onClick={(e) => {
                                e.stopPropagation(); // Ngăn sự kiện click lan ra ngoài
                                onDelete(project.id);
                            }}
                            className="absolute top-2 left-2 z-10 w-7 h-7 bg-black/50 rounded-full flex items-center justify-center text-white/70 opacity-0 group-hover:opacity-100 hover:bg-red-500/80 hover:text-white transition-all"
                            title={t('deleteProject')}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
        </Card>
      ))}
      <Card 
        className="bg-[#180F2E] border-2 border-dashed border-[#E33265]/80 p-0 overflow-hidden hover:bg-[#EA638A]/20 hover:border-[#EA638A] hover:scale-[1.03] transition-all duration-200 cursor-pointer flex items-center justify-center aspect-video group"
        onClick={onAddNew}
      >
        <div className="text-center text-gray-400 group-hover:text-white transition-colors">
          <FilmIcon className="w-8 h-8 mx-auto mb-2" />
          <p className="text-sm font-medium">{t('uploadVideo')}</p>
        </div>
      </Card>
    </div>
  );
}