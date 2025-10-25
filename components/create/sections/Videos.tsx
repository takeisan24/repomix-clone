"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { SearchIcon, PlayIcon, ScissorsIcon, FilmIcon } from "lucide-react"

import { useCreatePageStore } from "@/store/createPageStore"
import { useShallow } from 'zustand/react/shallow'

/**
 * Videos section component for managing video projects
 * Displays video creation tools and project management interface
 */
export default function VideosSection() {
  // Zustand store for video projects and actions
  const { videoProjects, onVideoUpload, onVideoEdit } = useCreatePageStore(
    useShallow((state) => ({
      videoProjects: state.videoProjects,
      onVideoUpload: state.handleVideoUpload,
      onVideoEdit: state.handleVideoEdit,
      onVideoDelete: state.handleVideoDelete,
    }))
  )
  const [searchTerm, setSearchTerm] = useState("")
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [videoPreview, setVideoPreview] = useState<string | null>(null)
  const [selectedLanguage, setSelectedLanguage] = useState("Vietnamese")
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false)
  const [multiSpeaker, setMultiSpeaker] = useState(false)
  const [translateCaptions, setTranslateCaptions] = useState(false)

  // Filter projects based on search term
  const filteredProjects = videoProjects.filter(project =>
    project.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith('video/')) {
      setSelectedFile(file)
      // Create video preview URL
      const videoUrl = URL.createObjectURL(file)
      setVideoPreview(videoUrl)
    } else {
      alert('Vui lòng chọn file video hợp lệ')
    }
  }

  // Handle upload
  const handleUpload = () => {
    if (selectedFile) {
      onVideoUpload()
      setShowUploadModal(false)
      setSelectedFile(null)
    }
  }

  // Handle box click
  const handleBoxClick = () => {
    setShowUploadModal(true)
  }

  // Handle file deletion
  const handleDeleteFile = () => {
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview)
    }
    setSelectedFile(null)
    setVideoPreview(null)
  }

  // Close dropdown when clicking outside
  const handleClickOutside = (event: React.MouseEvent) => {
    if (showLanguageDropdown) {
      setShowLanguageDropdown(false)
    }
  }

  return (
    <div className="w-full max-w-none mx-4 mt-4">
      {/* Quick start section */}
      <h2 className="text-lg font-semibold mb-3">Bắt đầu nhanh</h2>

      {/* Feature tiles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-4">
        <Card 
          className="bg-[#180F2E] border-[#E33265]/80 p-4 flex items-center gap-3 hover:bg-[#EA638A] hover:border-[#E33265] transition-all duration-200 cursor-pointer"
          onClick={handleBoxClick}
        >
          <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-300 flex items-center justify-center text-sm">
            cc
          </div>
          <div>
            <div className="text-m font-medium text-white">Tạo phụ đề</div>
            <div className="text-sm text-white mt-[10px]">Thêm phụ đề và b-rolls</div>
          </div>
        </Card>
        
        <Card 
          className="bg-[#180F2E] border-[#E33265]/80 p-4 flex items-center gap-3 hover:bg-[#EA638A] hover:border-[#E33265] transition-all duration-200 cursor-pointer"
          onClick={handleBoxClick}
        >
          <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-300 flex items-center justify-center text-sm">
            ✂
          </div>
          <div>
            <div className="text-m font-medium text-white">Cắt ghép video</div>
            <div className="text-sm text-white mt-[10px]">Kết hợp nhiều clip</div>
          </div>
        </Card>
        
        <Card 
          className="bg-[#180F2E] border-[#E33265]/80 p-4 flex items-center gap-3 hover:bg-[#EA638A] hover:border-[#E33265] transition-all duration-200 cursor-pointer"
          onClick={handleBoxClick}
        >
          <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-300 flex items-center justify-center text-sm">
            🎞
          </div>
          <div>
            <div className="text-m font-medium text-white">Extract Video Clips</div>
            <div className="text-sm text-white mt-[10px]">Trích clip từ video dài</div>
          </div>
        </Card>
      </div>

      {/* Action chips row */}
      <div className="flex justify-center mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-2xl">
          <Card 
            className="bg-[#180F2E] border-[#E33265]/80 p-3 flex items-center gap-2 hover:bg-[#EA638A] hover:border-[#E33265] transition-all duration-200 cursor-pointer"
            onClick={handleBoxClick}
          >
            <div className="w-6 h-6 rounded-md bg-orange-500/10 text-orange-300 flex items-center justify-center text-xs">
              ◎
            </div>
            <div className="text-sm text-white">Tạo B-rolls</div>
          </Card>
          
          <Card 
            className="bg-[#180F2E] border-[#E33265]/80 p-3 flex items-center gap-2 hover:bg-[#EA638A] hover:border-[#E33265] transition-all duration-200 cursor-pointer"
            onClick={handleBoxClick}
          >
            <div className="w-6 h-6 rounded-md bg-orange-500/10 text-orange-300 flex items-center justify-center text-xs">
              译
            </div>
            <div className="text-sm text-white">Dịch phụ đề</div>
          </Card>
        </div>
      </div>

      {/* Projects header with search */}
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm">{videoProjects.length} Dự án</div>
        <div className="relative w-60">
          <SearchIcon className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <Input 
            placeholder="Tìm kiếm..." 
            className="pl-9 bg-gray-900/50 border-[#E33265]/80 h-9 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Project list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredProjects.map((project) => (
          <Card 
            key={project.id}
            className="bg-[#180F2E] border-[#E33265]/80 p-0 overflow-hidden hover:bg-[#EA638A] hover:border-[#E33265] transition-all duration-200 cursor-pointer"
            onClick={() => onVideoEdit(project.id)}
          >
            <div className="relative w-full h-32 bg-gray-800">
              {project.thumbnail ? (
                <img 
                  src={project.thumbnail} 
                  alt={project.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <PlayIcon className="w-8 h-8 text-gray-400" />
                </div>
              )}
              
              {/* Status indicator */}
              <div className="absolute top-2 right-2">
                <div className={`w-2 h-2 rounded-full ${
                  project.status === 'completed' ? 'bg-green-500' :
                  project.status === 'processing' ? 'bg-yellow-500' :
                  'bg-red-500'
                }`} />
              </div>
              
              {/* Duration */}
              <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                {project.duration}
              </div>
            </div>
            
            <div className="p-3">
              <h3 className="text-sm font-medium text-white truncate mb-1">
                {project.title}
              </h3>
              <p className="text-xs text-gray-400">
                {new Date(project.createdAt).toLocaleDateString('vi-VN')}
              </p>
            </div>
          </Card>
        ))}
        
        {/* Upload new video card */}
        <Card 
          className="bg-[#180F2E] border-[#E33265]/80 p-0 overflow-hidden hover:bg-[#EA638A] hover:border-[#E33265] transition-all duration-200 cursor-pointer border-dashed"
          onClick={handleBoxClick}
        >
          <div className="w-full h-32 bg-gray-800/50 flex items-center justify-center">
            <div className="text-center">
              <FilmIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Tải video lên</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setShowUploadModal(false)}>
          <div className="bg-[#2A2A30] border border-[#E33265]/80 rounded-lg p-8 w-[700px] max-w-[90vw] shadow-xl relative" onClick={(e) => e.stopPropagation()}>
            {/* Close button */}
            <button
              onClick={() => setShowUploadModal(false)}
              className="absolute top-4 right-4 text-white/60 hover:text-white w-[18px] h-[18px] flex items-center justify-center"
            >
              <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Title and Back Button */}
            <div className="flex items-center justify-between mb-6">
              {selectedFile ? (
                <button
                  onClick={handleDeleteFile}
                  className="text-white/60 hover:text-white text-2xl"
                >
                  ←
                </button>
              ) : (
                <div className="w-8"></div>
              )}
              <h3 className="text-xl font-semibold text-white">Generate captions with AI</h3>
              <div className="w-8"></div> {/* Spacer for centering */}
            </div>
            
            {/* Presets button - only show when file is uploaded */}
            {selectedFile && (
              <div className="flex justify-end mb-6">
                <button className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-lg text-sm">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z"/>
                  </svg>
                  Presets
                </button>
              </div>
            )}

            {!selectedFile ? (
              // Upload interface
              <>
                {/* Google Drive Import Button */}
                <div className="flex justify-center mb-6">
                  <button className="w-1/2 flex items-center justify-center gap-2 p-3 border border-[#E33265]/80 rounded-lg text-white hover:opacity-80 transition-opacity text-sm">
                    <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-green-500 rounded flex items-center justify-center text-white text-xs font-bold">
                      G
                    </div>
                    Import from Google Drive
                  </button>
                </div>

                {/* Main upload area */}
                <div className="border-2 border-dashed border-[#E33265]/80 rounded-lg p-12 text-center mb-6 relative">
                  {/* Upload icon */}
                  <div className="w-16 h-16 bg-orange-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  
                  {/* Upload text */}
                  <p className="text-white text-lg mb-2">
                    Drop or <span className="text-[#E33265] cursor-pointer underline">browse your video</span>
                  </p>
                  
                  {/* File format info */}
                  <p className="text-gray-400 text-sm">
                    MP4 or MOV, Max duration: 5.00 min Max size: 2GB
                  </p>

                  {/* Hidden file input */}
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleFileSelect}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>

                {/* Sample video section */}
                <div className="flex items-center gap-4">
                  <p className="text-white text-sm">Or try this sample video</p>
                  <span className="text-lg">👉</span>
                  
                  {/* Sample video card */}
                  <div className="flex items-center gap-3 bg-[#1A0F30] border border-[#E33265]/80 rounded-lg p-3 flex-1">
                    <div className="w-16 h-12 bg-gray-700 rounded flex items-center justify-center">
                      <div className="w-6 h-6 bg-white/20 rounded flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </div>
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">Welcome to XXX</p>
                      <p className="text-gray-400 text-xs">32s</p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              // Video preview and caption generation interface
              <>
                {/* Video preview */}
                <div className="relative mb-6">
                  <div className="relative w-full h-64 bg-black rounded-lg overflow-hidden">
                    <video
                      src={videoPreview || undefined}
                      className="w-full h-full object-cover"
                      controls
                    />
                    {/* Play button overlay */}
                    <div className="absolute bottom-4 left-4">
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                      <div className="h-full bg-white w-1/3"></div>
                    </div>
                    {/* Three dots menu */}
                    <div className="absolute bottom-4 right-4">
                      <div className="w-6 h-6 bg-white/20 rounded flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                  <p className="text-center text-white text-sm mt-2">No Preset</p>
                </div>

                {/* Caption generation options */}
                <div className="space-y-4 mb-6">
                  {/* Language selection */}
                  <div className="flex items-center justify-between relative">
                    <span className="text-white text-sm">Language</span>
                    <div className="relative">
                      <button 
                        onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                      >
                        <span className="text-white text-sm">{selectedLanguage}</span>
                        <div className="w-6 h-4 bg-red-600 rounded flex items-center justify-center">
                          <span className="text-white text-xs">{selectedLanguage === "Vietnamese" ? "VN" : "US"}</span>
                        </div>
                        <svg className={`w-4 h-4 text-white transition-transform ${showLanguageDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      
                      {/* Dropdown menu */}
                      {showLanguageDropdown && (
                        <div className="absolute right-0 top-full mt-2 w-32 bg-[#2A2A30] border border-white/10 rounded-lg shadow-lg z-10">
                          <button
                            onClick={() => {
                              setSelectedLanguage("Vietnamese")
                              setShowLanguageDropdown(false)
                            }}
                            className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                              selectedLanguage === "Vietnamese" ? "bg-white/5" : ""
                            }`}
                          >
                            <div className="w-6 h-4 bg-red-600 rounded flex items-center justify-center">
                              <span className="text-white text-xs">VN</span>
                            </div>
                            <span className="text-white">Vietnamese</span>
                          </button>
                          <button
                            onClick={() => {
                              setSelectedLanguage("English")
                              setShowLanguageDropdown(false)
                            }}
                            className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                              selectedLanguage === "English" ? "bg-white/5" : ""
                            }`}
                          >
                            <div className="w-6 h-4 bg-blue-600 rounded flex items-center justify-center">
                              <span className="text-white text-xs">US</span>
                            </div>
                            <span className="text-white">English</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Multi-Speaker theme */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-white text-sm">Multi-Speaker theme</span>
                      <div className="w-4 h-4 bg-gray-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">i</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setMultiSpeaker(!multiSpeaker)}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        multiSpeaker ? 'bg-[#E33265]' : 'bg-gray-600'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                        multiSpeaker ? 'translate-x-6' : 'translate-x-0.5'
                      }`}></div>
                    </button>
                  </div>

                  {/* Translate Captions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-white text-sm">Translate Captions</span>
                      <div className="w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
                        <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                        </svg>
                      </div>
                    </div>
                    <button
                      onClick={() => setTranslateCaptions(!translateCaptions)}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        translateCaptions ? 'bg-[#E33265]' : 'bg-gray-600'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                        translateCaptions ? 'translate-x-6' : 'translate-x-0.5'
                      }`}></div>
                    </button>
                  </div>
                </div>

                {/* Generate captions button */}
                <button
                  onClick={handleUpload}
                  className="w-full bg-[#E33265] text-white py-3 px-4 rounded-lg hover:bg-[#E33265]/80 transition-colors font-medium"
                >
                  Generate captions
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
