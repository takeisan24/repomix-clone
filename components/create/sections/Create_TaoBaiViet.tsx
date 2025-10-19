"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import {
  PlusIcon,
  X as CloseIcon,
  ImageIcon,
  VideoIcon,
  SparklesIcon,
  ChevronDownIcon,
  SendIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  CheckCircle as CheckCircleIcon,
  FileText as FileTextIcon,
  Newspaper as NewspaperIcon,
  Youtube as YoutubeIcon,
  Music as MusicIcon,
  FileIcon,
  Headphones as HeadphonesIcon,
  Link as LinkIcon
} from "lucide-react"
import { getDaysInMonth, vietnameseWeekdays } from "@/lib"

// Thêm import cho Gemini
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai"
import { GoogleGenAI } from "@google/genai"

interface Post {
  id: number
  type: string
  content?: string
}

interface MediaFile {
  id: string
  type: 'image' | 'video'
  preview: string
  file: File
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface CreateSectionProps {
  posts: Post[]
  selectedPostId: number
  postContents: Record<number, string>
  onPostSelect: (id: number) => void
  onPostCreate: (type: string) => number
  onPostDelete: (id: number) => void
  onPostContentChange: (id: number, content: string) => void
  onClonePost: (postId: number) => void
  onSaveDraft: (postId: number) => void
  onMediaUpload: (files: File[]) => void
  onMediaRemove: (mediaId: string) => void
  onPublish: (postId: number) => void
}

/**
 * Create section component with three-panel layout:
 * 1. Left panel (241px) - Sources management
 * 2. Main panel (flex-1) - Post creation editor
 * 3. Right panel (350px) - AI chatbox
 */

// --- Start CreatePostFromSourceModal Component ---
interface CreatePostFromSourceModalProps {
  source: { type: string; value: string };
  platformOptions: { name: string; icon: string }[];
  onClose: () => void;
  onGeneratePosts: (selectedPlatforms: { platform: string; count: number }[]) => Promise<void>;
}


const CreatePostFromSourceModal: React.FC<CreatePostFromSourceModalProps> = ({
  source,
  platformOptions,
  onClose,
  onGeneratePosts,
}) => {
  const [selectedPlatforms, setSelectedPlatforms] = useState<{ platform: string; count: number }[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

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
    if (selectedPlatforms.length === 0) {
      alert("Vui lòng chọn ít nhất một nền tảng.");
      return;
    }
    setIsGenerating(true);
    await onGeneratePosts(selectedPlatforms);
    setIsGenerating(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="bg-[#2A2A30] border border-[#3A3A42] rounded-2xl w-[600px] max-w-[95vw] max-h-[90vh] overflow-hidden shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">Tạo bài đăng mới từ nguồn</h2>
          <button className="text-gray-400 hover:text-white" onClick={onClose}>
            <CloseIcon className="w-5 h-5" />
          </button>
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
};
// --- End CreatePostFromSourceModal Component ---




export default function CreateSection({
  posts,
  selectedPostId,
  postContents,
  onPostSelect,
  onPostCreate,
  onPostDelete,
  onPostContentChange,
  onClonePost,
  onSaveDraft,
  onMediaUpload,
  onMediaRemove,
  onPublish
}: CreateSectionProps) {
  // Post management state
  const [showPostPicker, setShowPostPicker] = useState(false)
  const [isPostPickerVisible, setIsPostPickerVisible] = useState(false)
  const [isAddPostActive, setIsAddPostActive] = useState(false)
  const [uploadedMedia, setUploadedMedia] = useState<Record<number, MediaFile[]>>({})
  const [currentMediaIndex, setCurrentMediaIndex] = useState<Record<number, number>>({})
  const postPickerRef = useRef<HTMLDivElement>(null)

  const [showLightbox, setShowLightbox] = useState(false);
  const [lightboxMediaUrl, setLightboxMediaUrl] = useState<string | null>(null);
  const [lightboxMediaType, setLightboxMediaType] = useState<'image' | 'video' | null>(null);

  // Sources state
  const [isAddingSource, setIsAddingSource] = useState(false)
  const [isSourcePickerVisible, setIsSourcePickerVisible] = useState(false)
  const [selectedSourceType, setSelectedSourceType] = useState<'text' | 'article' | 'youtube' | 'tiktok' | 'pdf' | 'audio'>('text')
  const [showSourceModal, setShowSourceModal] = useState(false)


  // New states for the "Create Post from Source" modal
  const [showCreatePostFromSourceModal, setShowCreatePostFromSourceModal] = useState(false);
  const [sourceToGeneratePost, setSourceToGeneratePost] = useState<{ type: string; value: string } | null>(null);

  // Thêm vào state của CreateSection
  const [sourceTextInput, setSourceTextInput] = useState('');
  const [sourceUrlInput, setSourceUrlInput] = useState('');
  const [advancedInstructions, setAdvancedInstructions] = useState('');
  const [shouldSaveSource, setShouldSaveSource] = useState(false); // Checkbox lưu nguồn
  const [savedSources, setSavedSources] = useState<Array<{ id: string; type: string; value: string; label: string }>>([]);
  const [selectedSavedSource, setSelectedSavedSource] = useState<string | null>(null); // ID của nguồn đang được chọn


  // AI Chat state
  const [selectedChatModel, setSelectedChatModel] = useState<string>("Gemini Pro") // Đổi tên hiển thị cho rõ ràng
  const [showModelMenu, setShowModelMenu] = useState<boolean>(false)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const modelMenuRef = useRef<HTMLDivElement>(null)
  const chatScrollRef = useRef<HTMLDivElement>(null)
  // AI Media Generation state
  const [showGenerateMenu, setShowGenerateMenu] = useState(false)
  const [showImageGenModal, setShowImageGenModal] = useState(false)
  const [showVideoGenModal, setShowVideoGenModal] = useState(false)
  const [imagePrompt, setImagePrompt] = useState("")
  const [videoPrompt, setVideoPrompt] = useState("")
  const [videoNegativePrompt, setVideoNegativePrompt] = useState("")
  const [imageCount, setImageCount] = useState(1)
  const [imageSize, setImageSize] = useState<"1K" | "2K">("1K")
  const [imageAspectRatio, setImageAspectRatio] = useState<"1:1" | "4:3" | "3:4" | "16:9" | "9:16">("1:1")
  const [imagePersonGeneration, setImagePersonGeneration] = useState<"dont_allow" | "allow_adult" | "allow_all">("allow_adult")
  const [videoAspectRatio, setVideoAspectRatio] = useState<"16:9" | "9:16" | "1:1" | "4:5" | "4:3">("16:9")
  const [videoResolution, setVideoResolution] = useState<"720p" | "1080p" | "4K">("1080p")
  const [videoPersonGeneration, setVideoPersonGeneration] = useState<"dont_allow" | "allow_adult" | "allow_all">("allow_adult")
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false)
  const generateMenuRef = useRef<HTMLDivElement>(null)

  // Publish confirmation modal state
  const [showPublishModal, setShowPublishModal] = useState(false)
  // Publish modal selections
  const [selectedPlatform, setSelectedPlatform] = useState<string>("")
  const [selectedAccount, setSelectedAccount] = useState<string>("")
  const [selectedAccountPic, setSelectedAccountPic] = useState<string>("/shego.jpg")
  const [showAccountDropdown, setShowAccountDropdown] = useState<boolean>(false)
  const [publishTime, setPublishTime] = useState<string>("now|Bây giờ")
  const [showCalendar, setShowCalendar] = useState<boolean>(false)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedTime, setSelectedTime] = useState<string>(new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }))
  const [timeHour, setTimeHour] = useState<string>("")
  const [timeMinute, setTimeMinute] = useState<string>("")
  const [timeAmPm, setTimeAmPm] = useState<'AM'|'PM'>('AM')
  const [isScheduleFocused, setIsScheduleFocused] = useState<boolean>(false)

  const publishModalRef = useRef<HTMLDivElement>(null)
  const accountDropdownRef = useRef<HTMLDivElement>(null)
  const calendarRef = useRef<HTMLDivElement>(null)
  const calendarAnchorRef = useRef<HTMLDivElement>(null)

  // Initialize Gemini & Veo
  // const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY
  // const GEMINI_API_KEY = "AIzaSyA5moM7IeKgn89ruKC0X43ACULEBjFOOUk"
  const GEMINI_API_KEY = "AIzaSyAabLiVktsUT5PvfuUm6n6yBYnAVj-PYi0"
  const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null
  const model = genAI?.getGenerativeModel({ model: "gemini-2.5-pro" }) // Sử dụng gemini-pro cho văn bản
  
  // Initialize GoogleGenAI for Veo 3
  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY || "" })

  // System Instruction (hoặc System Prompt) cho Gemini
  // Đây là nơi bạn định hình hành vi và định dạng phản hồi của AI
  const geminiSystemInstruction = `
    Bạn là một trợ lý viết bài cho mạng xã hội chuyên nghiệp. 
    Nhiệm vụ của bạn là giúp người dùng tạo nội dung hấp dẫn cho các nền tảng như Facebook, Twitter, Instagram, LinkedIn, TikTok, Threads, Bluesky, YouTube, Pinterest.

    Khi người dùng yêu cầu tạo bài đăng, hãy trả lời theo định dạng JSON sau:
    \`\`\`json
    {
      "action": "create_post",
      "platform": "Tên nền tảng (ví dụ: Facebook, Twitter)",
      "content": "Nội dung bài đăng bạn đã tạo.",
      "summary_for_chat": "Tóm tắt ngắn gọn bài đăng đã tạo để hiển thị trong khung chat (tối đa 2 câu)."
    }
    \`\`\`
    Các "Tên nền tảng" hợp lệ là: Facebook, Twitter, Instagram, LinkedIn, TikTok, Threads, Bluesky, YouTube, Pinterest.
    Đảm bảo nội dung bài đăng (trường "content") phù hợp với giới hạn và phong cách của nền tảng đó.

    Nếu người dùng chỉ hỏi chung chung hoặc cần trợ giúp khác, hãy trả lời bằng văn bản thuần túy, thân thiện và hữu ích.
    Tuyệt đối không sử dụng định dạng JSON nếu không phải là yêu cầu tạo bài đăng.
    Luôn trả lời bằng tiếng Việt.
  `

const handleMediaRemove = (idToRemove: string) => {
  if (!selectedPostId) return;
  setUploadedMedia(prev => ({
    ...prev,
    [selectedPostId]: (prev[selectedPostId] || []).filter(media => media.id !== idToRemove)
  }));
  // Optionally, call onMediaRemove prop if the parent component also needs to know
  // onMediaRemove(idToRemove);
};

  // Handle media download
  const handleMediaDownload = (media: MediaFile) => {
    const link = document.createElement('a');
    link.href = media.preview;
    link.download = media.file.name || `media-${Date.now()}.${media.type === 'image' ? 'png' : 'mp4'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Load saved sources from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('savedSources');
      if (saved) {
        setSavedSources(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading saved sources:', error);
    }
  }, []);

  // Save sources to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('savedSources', JSON.stringify(savedSources));
    } catch (error) {
      console.error('Error saving sources:', error);
    }
  }, [savedSources]);




  // Generate month grid for the selectedDate
  const getMonthGrid = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const daysInMonth = getDaysInMonth(year, month)
    const firstDay = new Date(year, month, 1).getDay() // 0=Sun
    // Convert to Monday-first index (Mon=0 ... Sun=6) matching our header
    const firstIdx = (firstDay + 6) % 7
    const cells: Array<{ day: number | null }>[] = []
    let row: Array<{ day: number | null }> = []
    for (let i = 0; i < firstIdx; i++) row.push({ day: null })
    for (let d = 1; d <= daysInMonth; d++) {
      row.push({ day: d })
      if (row.length === 7) { cells.push(row); row = [] }
    }
    if (row.length) {
      while (row.length < 7) row.push({ day: null })
      cells.push(row)
    }
    return cells
  }

  // When opening the calendar via "Chọn thời gian", default to user's current local time
  useEffect(() => {
    if (!showCalendar || publishTime !== 'pick a time') return
    const now = new Date()
    const hours24 = now.getHours()
    const minutes = now.getMinutes()
    const ampm: 'AM' | 'PM' = hours24 >= 12 ? 'PM' : 'AM'
    const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12
    const hh = String(hours12).padStart(2, '0')
    const mm = String(minutes).padStart(2, '0')
    setTimeHour(hh)
    setTimeMinute(mm)
    setTimeAmPm(ampm)
    setSelectedTime(`${hh}:${mm} ${ampm}`)
  }, [showCalendar, publishTime])

  function handleConfirmPickTime() {
    const hh = String(Math.min(12, Math.max(0, parseInt(timeHour || '0', 10))).toString().padStart(2, '0'))
    const mm = String(Math.min(59, Math.max(0, parseInt(timeMinute || '0', 10))).toString().padStart(2, '0'))
    setSelectedTime(`${hh}:${mm} ${timeAmPm}`)
    setShowCalendar(false)
  }

  // Close calendar when clicking outside the calendar popover
  useEffect(() => {
    if (!showCalendar) return
    const onDocClick = (e: MouseEvent) => {
      const node = calendarRef.current
      if (node && !node.contains(e.target as Node)) {
        setShowCalendar(false)
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [showCalendar])

  // Platform options for post creation
  const platformOptions = [
    { name: "Twitter", icon: "/x.png" },
    { name: "Instagram", icon: "/instagram.png" },
    { name: "LinkedIn", icon: "/link.svg" },
    { name: "Facebook", icon: "/fb.svg" },
    { name: "Pinterest", icon: "/pinterest.svg" },
    { name: "TikTok", icon: "/tiktok.png" },
    { name: "Threads", icon: "/threads.png" },
    { name: "Bluesky", icon: "/bluesky.png" },
    { name: "YouTube", icon: "/ytube.png" }
  ]

  // Mock connected accounts per platform (can be wired to real data later)
  const getAccountsForPlatform = (platform: string): Array<{ username: string; profilePic: string }> => {
    const common = [{ username: '@whatevername', profilePic: '/shego.jpg' }]
    return common
  }

  const handleOpenPublish = () => {
    const active = posts.find((p) => p.id === selectedPostId)
    const activePlatform = active?.type || ''
    setSelectedPlatform(activePlatform)
    const list = getAccountsForPlatform(activePlatform)
    if (list.length > 0) {
      setSelectedAccount(list[0].username)
      setSelectedAccountPic(list[0].profilePic)
    }
    setPublishTime('now|Bây giờ')
    setShowCalendar(false)
    setSelectedDate(new Date())
    setSelectedTime(new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }))
    setShowPublishModal(true)
  }

  // Source type options
  const sourceTypeOptions = [
    { key: "text", label: "Văn bản" },
    { key: "article", label: "Bài Viết" },
    { key: "youtube", label: "YouTube" },
    { key: "tiktok", label: "TikTok" },
    { key: "perplexity", label: "Perplexity" },
    { key: "pdf", label: "PDF" },
    { key: "audio", label: "Âm thanh" },
  ]

  // AI model options (đã cập nhật để bao gồm Gemini)
  const modelOptions = [
    "Gemini Pro", // Mặc định là Gemini Pro
    "ChatGPT",
    "Claude Sonnet 4",
    "gpt-4.1",
    "o4-mini",
    "o3",
    "gpt-4o"
  ]

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedPostId) return;
    const files = Array.from(event.target.files || [])
    if (files.length > 0) {
      const mediaFiles: MediaFile[] = files.map(file => ({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        type: file.type.startsWith('image/') ? 'image' : 'video',
        preview: URL.createObjectURL(file),
        file
      }))
      setUploadedMedia(prev => ({
        ...prev,
        [selectedPostId]: [...(prev[selectedPostId] || []), ...mediaFiles]
      }))
      console.log("Uploaded Media State:", mediaFiles)
      onMediaUpload(files)
    }
  }

  // Handle post picker visibility
  const handlePostPickerMouseEnter = () => {
    setShowPostPicker(true)
    setIsPostPickerVisible(true)
    setIsAddPostActive(true)
  }

  const handlePostPickerMouseLeave = () => {
    setIsAddPostActive(false)
    setTimeout(() => {
      setShowPostPicker(false)
      setIsPostPickerVisible(false)
    }, 1500)
  }

  // Handle source picker visibility
  const handleSourcePickerMouseEnter = () => {
    setIsSourcePickerVisible(true)
  }

  const startSourcePickerHideTimer = () => {
    setTimeout(() => {
      setIsSourcePickerVisible(false)
      setIsAddingSource(false)
    }, 150)
  }

  // CÁC HÀM HELPER CŨ KHÔNG CẦN DÙNG TRỰC TIẾP CHO LOGIC PHÂN TÍCH PHẢN HỒI NỮA
  // Nhưng có thể hữu ích để kiểm tra tính hợp lệ của nền tảng
  const platformList = ['facebook','twitter','instagram','linkedin','tiktok','threads','bluesky','youtube','pinterest']
  const titleCase = (s: string) => s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : s

  // Handle chat submission using Gemini API
  const submitChat = async () => {
    const text = chatInput.trim()
    if (!text || isTyping) return

    // Thêm tin nhắn của người dùng vào chat
    setChatMessages(prev => [...prev, { role: 'user', content: text }])
    setChatInput("")
    setIsTyping(true)

    if (!genAI || !model) {
      setChatMessages(prev => [...prev, { role: 'assistant', content: "Lỗi: Không thể kết nối với API Gemini. Vui lòng kiểm tra API Key và đảm bảo bạn đã chọn model Gemini." }])
      setIsTyping(false)
      return
    }

    try {
      // Xây dựng lịch sử trò chuyện cho Gemini
      // Lưu ý: role 'assistant' trong ứng dụng của bạn tương ứng với 'model' trong Gemini API
      const historyForGemini = chatMessages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }))

      // Bắt đầu cuộc trò chuyện với system instruction
      const chat = model.startChat({
        history: [{
            role: 'user',
            parts: [{ text: geminiSystemInstruction }] // Gửi system instruction như tin nhắn đầu tiên của user
          }, {
            role: 'model',
            parts: [{ text: "Đã hiểu! Tôi sẵn sàng giúp bạn tạo bài đăng hoặc trả lời câu hỏi." }] // Phản hồi của model cho system instruction
          },
          ...historyForGemini // Thêm lịch sử trò chuyện thực tế sau đó
        ],
        generationConfig: {
          temperature: 0.7, // Điều chỉnh để có phản hồi sáng tạo hơn
          maxOutputTokens: 10000, // Tăng giới hạn để đảm bảo đủ chỗ cho JSON và nội dung bài viết
        },
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
        ],
      })

      const result = await chat.sendMessage(text)
      let geminiResponseText = result.response.text()

      let aiResponseForChat: string = geminiResponseText; // Mặc định hiển thị toàn bộ phản hồi
      let shouldCreatePost = false;
      let platformName = "";
      let postContent = "";

      // Cố gắng phân tích phản hồi JSON
      try {
        // Loại bỏ phần markdown code block nếu có
        const jsonMatch = geminiResponseText.match(/```json\n([\s\S]*?)\n```/);
        if (jsonMatch && jsonMatch[1]) {
          const parsedResponse = JSON.parse(jsonMatch[1]);
          if (parsedResponse.action === "create_post") {
            shouldCreatePost = true;
            platformName = parsedResponse.platform;
            postContent = parsedResponse.content;
            aiResponseForChat = parsedResponse.summary_for_chat || `Đã tạo bài đăng trên ${platformName}.`;
          }
        }
      } catch (jsonError) {
        console.warn("Không thể phân tích phản hồi Gemini thành JSON, xử lý như văn bản thuần túy.", jsonError);
        // Nếu không phải JSON hợp lệ, giữ nguyên aiResponseForChat là toàn bộ phản hồi
        shouldCreatePost = false;
      }

      // Thêm phản hồi của AI vào chat
      setChatMessages(prev => [...prev, { role: 'assistant', content: aiResponseForChat }])

      // Nếu AI báo hiệu tạo bài đăng, hãy thực hiện
      if (shouldCreatePost && platformName && postContent) {
        // Đảm bảo platformName hợp lệ
        const formattedPlatform = platformOptions.find(p => p.name.toLowerCase() === platformName.toLowerCase())?.name || 'Facebook';
        const newPostId = onPostCreate(formattedPlatform) // Tạo và tự động chọn tab
        
        if (typeof newPostId === 'number' && newPostId > 0) {
          // Cập nhật nội dung bài đăng (tab đã được chọn tự động)
          onPostContentChange(newPostId, postContent)
          console.log(`Đã tạo và cập nhật bài đăng ID ${newPostId} cho ${formattedPlatform}`)
        } else {
          console.warn(`Không thể tạo bài đăng cho ${formattedPlatform}`)
        }
      }

    } catch (error) {
      console.log("Lỗi khi gọi API Gemini:", error)
      console.error("Lỗi khi gọi API Gemini:", error)
      setChatMessages(prev => [...prev, { role: 'assistant', content: "Đã xảy ra lỗi khi tạo phản hồi từ Gemini. Vui lòng thử lại." }])
    } finally {
      setIsTyping(false)
    }
  }

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight
    }
  }, [chatMessages, isTyping])


  // Listen for calendar-open-post to create a new active post
  useEffect(() => {
    const handler = (e: any) => {
      const platformRaw = (e.detail?.platform || 'Facebook') as string
      const platform = platformRaw.charAt(0).toUpperCase() + platformRaw.slice(1)
      onPostCreate(platform) // Tự động tạo và chọn tab mới
    }
    window.addEventListener('calendar-open-post', handler as any)
    return () => window.removeEventListener('calendar-open-post', handler as any)
  }, [onPostCreate])

  // Close generate menu when clicking outside
  useEffect(() => {
    if (!showGenerateMenu) return
    const onDocClick = (e: MouseEvent) => {
      const node = generateMenuRef.current
      if (node && !node.contains(e.target as Node)) {
        setShowGenerateMenu(false)
      }
    }
    document.addEventListener('click', onDocClick)
    return () => document.removeEventListener('click', onDocClick)
  }, [showGenerateMenu])

  // Close model menu when clicking outside (giữ nguyên)
  useEffect(() => {
    if (!showModelMenu) return
    const onDocClick = (e: MouseEvent) => {
      const node = modelMenuRef.current
      if (node && !node.contains(e.target as Node)) {
        setShowModelMenu(false)
      }
    }
    document.addEventListener('click', onDocClick)
    return () => document.removeEventListener('click', onDocClick)
  }, [showModelMenu])

  // Get current post
  const currentPost = posts.find(p => p.id === selectedPostId)

  // Handle image generation modal open
  const handleOpenImageGen = () => {
    const content = postContents[selectedPostId] || ""
    setImagePrompt(content)
    setShowImageGenModal(true)
    setShowGenerateMenu(false)
  }

  // Handle video generation modal open
  const handleOpenVideoGen = () => {
    const content = postContents[selectedPostId] || ""
    setVideoPrompt(content)
    setShowVideoGenModal(true)
    setShowGenerateMenu(false)
  }

  // Handle image generation with Gemini Imagen
  const handleGenerateImage = async () => {
    if (!imagePrompt.trim() || !selectedPostId) return
    
    setIsGeneratingImage(true)
    
    try {
      // Check if Gemini API is available
      if (!genAI) {
        throw new Error("Gemini API chưa được cấu hình. Vui lòng kiểm tra API Key.")
      }

      try {
        // Initialize NanoBanana model
        const imageModel = genAI.getGenerativeModel({ 
          model: "gemini-2.5-flash-image" 
        })

        // We send the prompt directly
        const result = await imageModel.generateContent(imagePrompt)

        // Process the generated images
        const candidates = result.response.candidates || []
        
        if (candidates.length === 0) {
          throw new Error("Không thể tạo ảnh. API không trả về kết quả.")
        }

        const firstCandidate = candidates[0]
        const parts = firstCandidate.content?.parts || []
        
        // Convert generated images to MediaFile format
        const newMediaFiles: MediaFile[] = []
        
        // Gemini Flash Image returns: [text description, image1, image2, ...]
        for (let i = 0; i < parts.length; i++) {
          const part = parts[i]
          
          // Check if this part has image data
          const imageData = part.inlineData?.data
          const mimeType = part.inlineData?.mimeType
          
          if (imageData && mimeType && mimeType.startsWith('image/')) {
            // Create a blob from base64 data
            const byteCharacters = atob(imageData)
            const byteNumbers = new Array(byteCharacters.length)
            for (let j = 0; j < byteCharacters.length; j++) {
              byteNumbers[j] = byteCharacters.charCodeAt(j)
            }
            const byteArray = new Uint8Array(byteNumbers)
            const blob = new Blob([byteArray], { type: mimeType })
            
            // Create File object
            const file = new File([blob], `gemini-image-${Date.now()}-${i}.png`, { type: mimeType })
            const preview = URL.createObjectURL(blob)
            
            newMediaFiles.push({
              id: `gemini-img-${Date.now()}-${i}`,
              type: 'image',
              preview: preview,
              file: file
            })
          }
        }

        // Add generated images to uploadedMedia state
        if (newMediaFiles.length > 0) {
          setUploadedMedia(prev => ({
            ...prev,
            [selectedPostId]: [...(prev[selectedPostId] || []), ...newMediaFiles]
          }))
          
          
          setShowImageGenModal(false)
        } else {
          throw new Error("Không thể trích xuất dữ liệu ảnh từ phản hồi API. API có thể chỉ trả về text description.")
        }
        
      } catch (apiError: any) {
        // API error - log detailed error
        const errorMsg = apiError?.message || ""
        if (errorMsg.includes("404") || errorMsg.includes("not found") || errorMsg.includes("MODEL_NOT_FOUND")) {
          throw new Error("⚠️ Model Imagen 3 không khả dụng.\n\nVui lòng kiểm tra lại API Key hoặc thử model khác.")
        } else if (errorMsg.includes("403") || errorMsg.includes("permission") || errorMsg.includes("PERMISSION_DENIED")) {
          throw new Error("⚠️ Không có quyền truy cập Imagen 3.\n\nVui lòng:\n1. Kiểm tra API Key có quyền sử dụng\n2. Đảm bảo billing đã được thiết lập")
        } else if (errorMsg.includes("quota") || errorMsg.includes("RESOURCE_EXHAUSTED")) {
          throw new Error("⚠️ Đã vượt quá quota API.\n\nVui lòng:\n1. Kiểm tra quota trong Google Cloud Console\n2. Đợi quota reset\n3. Nâng cấp gói API nếu cần")
        } else if (errorMsg.includes("Invalid JSON payload") || errorMsg.includes("generationConfig")) {
          throw new Error("⚠️ Imagen 3 API format đã thay đổi.\n\nModel hiện tại chỉ chấp nhận prompt thuần túy.\nCác tham số phức tạp không được hỗ trợ trong SDK này.\n\nĐang sử dụng format đơn giản hóa.")
        }
        
        // Generic API error
        throw new Error(`❌ Lỗi API Imagen 3: ${errorMsg}\n\nVui lòng kiểm tra console để biết thêm chi tiết.`)
      }
      
    } catch (error: any) {
      const errorMessage = error?.message || "Đã xảy ra lỗi khi tạo ảnh. Vui lòng thử lại."
      
      
    } finally {
      setIsGeneratingImage(false)
    }
  }

  // Handle video generation with Veo 3 using @google/genai SDK
  const handleGenerateVideo = async () => {
    if (!videoPrompt.trim() || !selectedPostId) return
    
    setIsGeneratingVideo(true)
    
    try {
      if (!GEMINI_API_KEY) {
        throw new Error("API Key chưa được cấu hình")
      }

      // Show initial message
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `🎬 Bắt đầu tạo video với Veo 3...\n📝 "${videoPrompt}"\n⏳ Đợi 2-5 phút...` 
      }])

      // Generate video using SDK (similar to example)
      let operation = await ai.models.generateVideos({
        model: "veo-3.0-fast-generate-001",
        source:{
          prompt: videoPrompt,
        },
        config:{
          numberOfVideos:1,
          aspectRatio: videoAspectRatio,
          resolution: videoResolution,
          negativePrompt: videoNegativePrompt
        }
      })

      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `⏳ Video đang được xử lý...\n🔄 Operation đã tạo` 
      }])

      // Poll the operation status until the video is ready
      let pollCount = 0
      while (!operation.done) {
        console.log("Waiting for video generation to complete...")
        await new Promise((resolve) => setTimeout(resolve, 10000))
        pollCount++
        
        // Update progress
        setChatMessages(prev => {
          const newMessages = [...prev]
          newMessages[newMessages.length - 1] = {
            role: 'assistant',
            content: `⏳ Đang xử lý... (${pollCount * 10}s)\n🎬 Veo 3 đang tạo video...`
          }
          return newMessages
        })
        
        operation = await ai.operations.getVideosOperation({
          operation: operation,
        })
        
      // ======================= DEBUGGING START =======================
      // console.log("✅ Operation Completed! Full response object:", JSON.stringify(operation, null, 2));
      // ======================= DEBUGGING END =========================

        // Timeout after 10 minutes
        if (pollCount >= 60) {
          throw new Error("Video generation timeout after 10 minutes")
        }
      }

      // Download the generated video
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `📥 Đang tải video về...` 
      }])

      // Check if response and generatedVideos exist
      if (!operation.response || !operation.response.generatedVideos || operation.response.generatedVideos.length === 0) {
        throw new Error("Không nhận được video từ API")
      }

      const generatedVideo = operation.response.generatedVideos[0]
      const videoFile = generatedVideo.video
      
      if (!videoFile) {
        throw new Error("Không tìm thấy video file")
      }
      
      // Download using SDK's file download
      const downloadPath = `veo3-video-${Date.now()}.mp4`
      
      // Get video URI from the file object (may be uri or fileUri depending on SDK version)
      const videoUri = (videoFile as any).uri || (videoFile as any).fileUri
      
      if (!videoUri) {
        throw new Error("Không tìm thấy URI video")
      }
      
      // Fetch the video from the URI
      console.log("🔗 Fetching video from URI:", videoUri)
      const response = await fetch(videoUri)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch video: ${response.status} ${response.statusText}`)
      }
      
      const videoBlob = await response.blob()
      console.log("📦 Video blob created:", {
        size: videoBlob.size,
        type: videoBlob.type
      })
      
      // Create File object
      const file = new File([videoBlob], downloadPath, { type: 'video/mp4' })
      const preview = URL.createObjectURL(videoBlob)
      console.log("🎬 Video preview URL:", preview)
      
      const newMediaFile: MediaFile = {
        id: `veo3-video-${Date.now()}`,
        type: 'video',
        preview: preview,
        file: file
      }

      setUploadedMedia(prev => ({
        ...prev,
        [selectedPostId]: [...(prev[selectedPostId] || []), newMediaFile]
      }))
      
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `✅ Video đã được tạo thành công!\n⏱️ Thời gian: ${pollCount * 10}s\n📹 Đã thêm vào bài đăng\n💾 Kích thước: ${(videoBlob.size / 1024 / 1024).toFixed(2)} MB` 
      }])
      
      console.log(`✅ Generated video saved. Size: ${videoBlob.size} bytes`)
      setShowVideoGenModal(false)
      
    } catch (error: any) {
      console.error("❌ Veo 3 Error:", error)
      
      let errorMessage = "Đã xảy ra lỗi khi tạo video"
      
      if (error.message?.includes("404") || error.message?.includes("not found")) {
        errorMessage = "⚠️ Model Veo 3 không khả dụng.\n\n• Cần đăng ký early access\n• Truy cập: ai.google.dev"
      } else if (error.message?.includes("403") || error.message?.includes("permission")) {
        errorMessage = "⚠️ Không có quyền truy cập Veo 3.\n\n• Kiểm tra API key\n• Đảm bảo billing đã thiết lập"
      } else if (error.message?.includes("quota")) {
        errorMessage = "⚠️ Vượt quota API.\n\nVeo 3 có giới hạn nghiêm ngặt."
      } else if (error.message?.includes("timeout")) {
        errorMessage = `⏰ Timeout sau 10 phút.\n\nVideo có thể vẫn đang xử lý.`
      } else {
        errorMessage = `❌ Lỗi: ${error.message || error}`
      }
      
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: errorMessage 
      }])
      
      alert(errorMessage)
    } finally {
      setIsGeneratingVideo(false)
    }
  }

  return (
    <div className="flex h-full w-full">
      {/* Left Panel - Sources (241px) */}
      <div className="w-[241px] border-r border-white/10 p-4 pt-[30px] flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <Button
            size="sm"
            className="text-sm bg-[#E33265] hover:bg-[#c52b57] text-white px-3 py-1.5 transition-all duration-200 border-0"
            onClick={() => setShowSourceModal(true)}
          >
            Thêm nguồn <span className="ml-2 text-base">+</span>
          </Button>
        </div>

        {isAddingSource && (
          <div
            className={`border border-white/10 rounded-md p-3 bg-gray-900/50 transition-opacity duration-75 ${
              isSourcePickerVisible ? 'opacity-100' : 'opacity-0'
            }`}
            onMouseEnter={handleSourcePickerMouseEnter}
            onMouseLeave={startSourcePickerHideTimer}
          >
            <div className="grid grid-cols-2 gap-2 mb-3">
              {sourceTypeOptions.map((option) => (
                <Button
                  key={option.key}
                  size="sm"
                  variant={selectedSourceType === (option.key as any) ? "secondary" : "ghost"}
                  className={selectedSourceType === (option.key as any) ? "bg-white/10" : ""}
                  onClick={() => setSelectedSourceType(option.key as any)}
                >
                  {option.label}
                </Button>
              ))}
            </div>

            <div className="space-y-2">
              {selectedSourceType === "text" && (
                <Textarea
                  placeholder="Dán hoặc nhập nguồn văn bản..."
                  className="bg-gray-900/50 border-white/10"
                />
              )}
              {selectedSourceType !== "text" && (
                <Input
                  placeholder={
                    selectedSourceType === "article"
                      ? "Dán URL bài viết..."
                      : selectedSourceType === "youtube"
                      ? "Dán liên kết YouTube..."
                      : selectedSourceType === "tiktok"
                      ? "Dán liên kết TikTok..."
                      : selectedSourceType === "pdf"
                      ? "Dán liên kết PDF..."
                      : "Dán liên kết âm thanh..."
                  }
                  className="bg-gray-900/50 border-white/10"
                />
              )}

              <div className="flex gap-2 pt-1">
                <Button size="sm" className="bg-[#E33265] hover:bg-[#c52b57]">Lưu</Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-transparent"
                  onClick={() => setIsAddingSource(false)}
                >
                  Hủy
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Danh sách nguồn đã lưu */}
        {savedSources.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-gray-300 mb-2">Nguồn đã lưu</h3>
            <div className="space-y-2">
              {savedSources.map((source) => {
                const sourceTypeLabel = sourceTypeOptions.find(opt => opt.key === source.type)?.label || source.type;
                const isSelected = selectedSavedSource === source.id;
                
                // Icon component cho từng loại nguồn
                const SourceIcon = ({ type }: { type: string }) => {
                  const iconClass = `w-5 h-5 ${isSelected ? 'text-[#E33265]' : 'text-gray-400'}`;
                  switch(type) {
                    case 'text': 
                      return <FileTextIcon className={iconClass} />;
                    case 'article': 
                      return <NewspaperIcon className={iconClass} />;
                    case 'youtube': 
                      return <YoutubeIcon className={iconClass} />;
                    case 'tiktok': 
                      return <MusicIcon className={iconClass} />;
                    case 'pdf': 
                      return <FileIcon className={iconClass} />;
                    case 'audio': 
                      return <HeadphonesIcon className={iconClass} />;
                    default: 
                      return <LinkIcon className={iconClass} />;
                  }
                };
                
                return (
                  <div
                    key={source.id}
                    className={`group relative p-3 rounded-lg border cursor-pointer transition-all ${
                      isSelected 
                        ? 'bg-[#E33265]/20 border-[#E33265]' 
                        : 'bg-[#1E1E23] border-white/10 hover:border-[#E33265]/50'
                    }`}
                    onClick={() => {
                      setSelectedSavedSource(source.id);
                      setSourceToGeneratePost({ type: source.type, value: source.value });
                      setShowCreatePostFromSourceModal(true);
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 flex-1 min-w-0">
                        <div className="flex-shrink-0 mt-0.5">
                          <SourceIcon type={source.type} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-gray-400 mb-1">{sourceTypeLabel}</div>
                          <div className="text-sm text-white line-clamp-2">{source.label}</div>
                        </div>
                      </div>
                      <button
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded transition-opacity flex-shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSavedSources(prev => prev.filter(s => s.id !== source.id));
                          if (selectedSavedSource === source.id) {
                            setSelectedSavedSource(null);
                          }
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

      {/* Main Content Area - Post Editor */}
      {/* Remove outer margins/paddings to align content edge-to-edge */}
      <div className="flex-1 flex min-w-0">
        <div className="flex-1 h-full overflow-hidden min-w-0 p-[15px]">
          <div className="w-full flex flex-col h-full">
            {/* Tabs row */}
            <div className="flex items-center gap-3 mb-4">
              {/* Tabs container */}
              <div className="flex items-center gap-3 min-w-0 flex-1 overflow-x-auto scrollbar-hide">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className={`flex items-center gap-2 px-3 py-1 ${
                      selectedPostId === post.id
                        ? "border-b-2 border-[#E33265] text-white"
                        : "border-b border-white/10 text-gray-300"
                    }`}
                  >
                    <button
                      onClick={() => onPostSelect(post.id)}
                      className="text-sm"
                    >
                      {post.type}
                    </button>
                    <button
                      aria-label="Close tab"
                      className="p-1 rounded hover:bg-white/10"
                      onClick={(e) => {
                        e.stopPropagation()
                        onPostDelete(post.id)
                      }}
                    >
                      <CloseIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Post button */}
              <div
                className="relative flex-shrink-0"
                ref={postPickerRef}
                onMouseEnter={handlePostPickerMouseEnter}
                onMouseLeave={handlePostPickerMouseLeave}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className={`transition-all duration-200 ${
                    isAddPostActive 
                      ? 'bg-[#E33265]/80 text-white hover:bg-[#E33265] hover:shadow-md'
                      : 'bg-[#E33265] text-white hover:bg-[#c52b57] shadow-md'
                  }`}
                  onClick={() => {
                    if (showPostPicker) {
                      handlePostPickerMouseLeave()
                    } else {
                      handlePostPickerMouseEnter()
                    }
                  }}
                >
                  <PlusIcon className="w-4 h-4 mr-1.5" /> Thêm bài
                </Button>

                {showPostPicker && (
                  <div
                    className={`absolute right-0 z-20 mt-2 w-[13.75rem] bg-[#2A2A30] border border-[#3A3A42] rounded-lg shadow-lg p-3 transition-opacity duration-75 ${
                      isPostPickerVisible ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    <div className="space-y-1">
                      {platformOptions.map((option, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            onPostCreate(option.name)
                            setShowPostPicker(false)
                            setIsPostPickerVisible(false)
                            setIsAddPostActive(false)
                          }}
                          className="w-full text-left px-4 py-3 rounded-md hover:bg-white/5 text-base text-gray-200 flex items-center gap-4"
                        >
                          <img
                            src={option.icon}
                            alt=""
                            className={`w-7 h-7 ${
                              ["Twitter", "Threads"].includes(option.name)
                                ? "filter brightness-0 invert"
                                : ""
                            }`}
                          />
                          <span>{option.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            

            {/* Editor */}
            <Card className="bg-[#2A2A30] border-[#3A3A42] p-0 gap-0 rounded-[5px] flex-1 flex flex-col w-full">
              {selectedPostId === 0 || posts.length === 0 ? (
                /* Empty state */
                <div className="flex-1 flex items-center justify-center">
                  <Button
                    onClick={handlePostPickerMouseEnter}
                    className="bg-[#E33265] hover:bg-[#c52b57] text-white"
                  >
                    <PlusIcon className="w-6 h-6 mr-2" />
                    Tạo bài viết
                  </Button>

                  
                </div>
                
              ) : (
                /* Editor when a post is selected */
                <div className="flex-1 flex flex-col w-full">
                  <Textarea
                    placeholder={`Bạn muốn chia sẻ gì trên ${currentPost?.type || "bài viết"}?`}
                    value={postContents[selectedPostId] ?? ""}
                    onChange={(e) => onPostContentChange(selectedPostId, e.target.value)}
                    className="w-full h-full bg-[#2A2A30] border border-[#2A2A30] resize-none text-white placeholder:text-gray-400 focus:ring-0 focus:border-[#2A2A30] p-[10px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800"
                  />

                  {/* Media Preview Area */}
                  {uploadedMedia[selectedPostId]?.length > 0 && (
    <div className="mt-4 shrink-0 px-[10px] pb-[10px]"> {/* Thêm padding để cân đối với textarea */}
       <div className="flex gap-3 overflow-x-auto scrollbar-hide py-2">
        {uploadedMedia[selectedPostId].map((media, index) => (
          <div
            key={media.id}
            className="relative w-40 h-32 flex-shrink-0 rounded-lg overflow-hidden border border-[#3A3A42] cursor-pointer" // <-- Thêm cursor-pointer
            onClick={() => { // <-- Thêm onClick
              setLightboxMediaUrl(media.preview);
              setLightboxMediaType(media.type);
              setShowLightbox(true);
            }}
          >
            {media.type === 'image' ? (
              <img
                src={media.preview}
                alt={`Uploaded media ${index + 1}`}
                className="w-full h-full object-cover"
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

            {/* ... Media Type Icon ... */}
          </div>
        ))}
      </div>


    </div>
  )}
                  
                  {/* Action bar - sticky with divider and character count */}
                 {/* Sticky action bar with symmetric vertical spacing for buttons (15px top & bottom) */}
                 <div className="sticky bottom-0 left-0 right-0 bg-[#44424D]">
                   {/* Use 15px top padding for buttons and 0 bottom to tighten bottom spacing */}
                    <div className="relative border-t border-white/10 pt-[15px] pb-0 flex items-center justify-between opacity-100">
                      {/* Character count aligned to the right, above line */}
                      {/* Place count above divider with a 15px gap below it. Approx height ~16px => offset 16 + 15 = 31px */}
                      <div className="absolute -top-[31px] right-0 text-xs text-gray-400 pr-[10px]">
                        {(postContents[selectedPostId] ?? "").length}/
                        {(() => {
                          const platform = currentPost?.type || 'default'
                          const limits: Record<string, number> = { Twitter: 280, Instagram: 2200, LinkedIn: 3000, Facebook: 63206, Pinterest: 500, TikTok: 2200, Threads: 500, Bluesky: 300, YouTube: 5000, default: 5000 }
                          return limits[platform] ?? limits.default
                        })()} ký tự
                      </div>
                      {/* Left: Add Image and Generate buttons */}
                      <div className="flex items-center gap-2 pl-[10px] pb-[10px]">
                      <input
                        type="file"
                        accept="image/*,video/*"
                        multiple
                        onChange={handleFileUpload}
                        className="hidden"
                        id="media-upload"
                      />
                      <label htmlFor="media-upload">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-9 px-4 cursor-pointer bg-black hover:bg-[#E33265]/50 hover:border-[#E33265]/80 border-black text-white"
                          asChild
                        >
                          <span>
                            <ImageIcon className="w-4 h-4 mr-2" />
                            Thêm ảnh
                          </span>
                        </Button>
                      </label>

                      {/* Generate button with dropdown */}
                      <div className="relative" ref={generateMenuRef}>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-9 px-4 bg-black hover:bg-[#7C3AED]/50 hover:border-[#7C3AED]/80 border-black text-white"
                          onClick={() => setShowGenerateMenu(!showGenerateMenu)}
                        >
                          <SparklesIcon className="w-4 h-4 mr-2" />
                          Tạo
                          <ChevronDownIcon className={`w-4 h-4 ml-1 transition-transform ${showGenerateMenu ? 'rotate-180' : ''}`} />
                        </Button>

                        {showGenerateMenu && (
                          <div className="absolute bottom-full left-0 mb-2 w-48 bg-[#2A2A30] border border-[#3A3A42] rounded-md shadow-lg py-2 z-20">
                            <button
                              type="button"
                              onClick={handleOpenImageGen}
                              className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-white/5 flex items-center gap-3"
                            >
                              <ImageIcon className="w-4 h-4" />
                              Tạo ảnh
                            </button>
                            <button
                              type="button"
                              onClick={handleOpenVideoGen}
                              className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-white/5 flex items-center gap-3"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                              Tạo video
                            </button>
                          </div>
                        )}
                      </div>
                      </div>

                      {/* Right: Clone, Save, Publish */}
                      <div className="flex items-center gap-2 pr-[10px] pb-[15px]">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-9 px-4 border-[#E33265] text-white hover:bg-[#E33265]/10"
                          onClick={() => onClonePost(selectedPostId)}
                        >
                          Nhân bản
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-9 px-4 w-16 border-[#E33265] text-white hover:bg-[#E33265]/10"
                          onClick={() => onSaveDraft(selectedPostId)}
                        >
                          Lưu
                        </Button>
                        <Button
                          onClick={handleOpenPublish}
                          className="h-9 px-4 w-16 bg-[#E33265] hover:bg-[#c52b57] text-white"
                        >
                          Đăng
                        </Button>
                      </div>
                  </div>
                </div>
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Right Panel - AI Chatbox (350px) */}
        <div className="w-[350px] border-l border-white/10 flex-shrink-0 p-[15px]">
          <Card className="bg-[#2A2A30] border-[#3A3A42] h-full flex flex-col p-0 gap-0 rounded-[5px]">
            {/* Model Selector Header */}
            <div className="h-[50px] border-b border-white/10 flex items-center pt-4 pl-2 bg-[#44424D]">
              <div className="relative -mt-[15px]" ref={modelMenuRef}>
                <button
                  type="button"
                  onClick={() => setShowModelMenu((v) => !v)}
                  className="inline-flex items-center gap-2 text-sm font-semibold leading-none text-white/90 hover:text-white"
                >
                  <SparklesIcon className="w-4 h-4" />
                  {selectedChatModel}
                  <ChevronDownIcon className={`w-4 h-4 transition-transform ${showModelMenu ? 'rotate-180' : ''}`} />
                </button>
                {showModelMenu && (
                  <div className="absolute mt-2 w-56 bg-[#2A2A30] border border-[#3A3A42] rounded-md shadow-[0_0_0_1px_rgba(255,255,255,0.08)] py-2 z-20">
                    {modelOptions.map((model) => (
                      <button
                        key={model}
                        onClick={() => { 
                          setSelectedChatModel(model)
                          setShowModelMenu(false) 
                        }}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-white/5 ${
                          selectedChatModel === model ? 'text-white' : 'text-white/80'
                        }`}
                      >
                        {model}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Chat Messages */}
            <div ref={chatScrollRef} className="h-[calc(100%-130px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 opacity-80">
              <div className="space-y-4 min-h-0">
                {chatMessages.map((message, index) => (
                  <div key={index} className={`text-sm ${message.role === "user" ? "text-right" : "text-left"}`}>
                    <div className={`rounded-lg p-3 max-w-[80%] break-words ${
                      message.role === "user" 
                        ? "bg-[#E33265] text-white ml-auto inline-block text-left" 
                        : "bg-[#2A2A30] text-[#F5F5F7] inline-block border border-[#3A3A42]"
                    }`}>
                      {message.content}
                    </div>
                  </div>
                ))}
                
                {/* Typing indicator */}
                {isTyping && (
                  <div className="text-sm text-left">
                    <div className="bg-[#2A2A30] text-[#F5F5F7] inline-block rounded-lg p-3 border border-[#3A3A42]">
                      <div className="flex items-center space-x-1">
                        <span>AI đang nhập</span>
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-[#F5F5F7] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-[#F5F5F7] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-[#F5F5F7] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Chat Input */}
            <div className="border-t border-white/10 relative h-[120px]">
              <div className="relative h-full">
                <textarea
                  placeholder="Tôi là trợ lý viết mới của bạn. Bạn muốn viết về điều gì?"
                  className="w-full h-full bg-[#2A2A30] border border-[#2A2A30] rounded-md outline-none focus:outline-none focus:ring-0 focus:border-[#2A2A30] resize-none text-[#F5F5F7] placeholder-gray-400 text-sm p-[10px]"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      submitChat()
                    }
                  }}
                />
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Source Modal */}
      {showSourceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={(e) => { if (e.target === e.currentTarget) setShowSourceModal(false) }}>
          <div className="bg-[#2A2A30] border border-[#3A3A42] rounded-2xl w-[1000px] max-w-[95vw] max-h-[90vh] overflow-hidden shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <h2 className="text-lg font-semibold text-white">Chỉnh sửa nguồn</h2>
              <button className="text-gray-400 hover:text-white" onClick={() => setShowSourceModal(false)}>
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
              <div className="text-white">Văn bản</div>
              {selectedSourceType === 'text' && (
                <Textarea placeholder="Dán văn bản vào đây" 
                  className="bg-gray-900/50 border-white/10 h-40"
                  value={sourceTextInput}
                  onChange={(e) => setSourceTextInput(e.target.value)}
                />
              )}

              {selectedSourceType !== 'text' && (
                <Input
                  placeholder={
                    selectedSourceType === 'article' ? 'Dán URL bài viết...' :
                    selectedSourceType === 'youtube' ? 'Dán URL YouTube...' :
                    selectedSourceType === 'tiktok' ? 'Dán URL TikTok...' :
                    selectedSourceType === 'pdf' ? 'Dán URL PDF...' :
                    'Dán URL âm thanh...'
                  }
                  className="bg-gray-900/50 border-white/10"
                  value={sourceUrlInput}
                  onChange={(e) => setSourceUrlInput(e.target.value)}
                />
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
            
            {/* Footer */}
            <div className="px-6 pb-6">
              <button
                className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white py-3 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!(selectedSourceType === 'text' ? sourceTextInput.trim() : sourceUrlInput.trim())}
                onClick={() => {
                  const sourceValue = selectedSourceType === 'text' ? sourceTextInput : sourceUrlInput;
                  
                  if (!sourceValue.trim()) {
                    return; // Không làm gì nếu nguồn rỗng
                  }
                  
                  // Nếu checkbox "Lưu nguồn" được tích, lưu vào danh sách
                  if (shouldSaveSource) {
                    const newSource = {
                      id: Date.now().toString(),
                      type: selectedSourceType,
                      value: sourceValue,
                      label: sourceValue.length > 50 ? sourceValue.substring(0, 50) + '...' : sourceValue
                    };
                    setSavedSources(prev => [...prev, newSource]);
                  }
                  
                  setSourceToGeneratePost({ type: selectedSourceType, value: sourceValue });
                  setShowSourceModal(false);
                  setShowCreatePostFromSourceModal(true);

                  // Reset input sau khi thêm
                  setSourceTextInput('');
                  setSourceUrlInput('');
                  setShouldSaveSource(false);
                }}
              >
                Thêm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Publish Modal - choose account and schedule */}
      {showPublishModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={(e) => { if (e.target === e.currentTarget) setShowPublishModal(false) }}>
          <div ref={publishModalRef} className="bg-[#2A2A30] border border-[#3A3A42] rounded-lg p-7 w-[450px] max-w-[90vw] shadow-[0_0_0_1px_rgba(255,255,255,0.08)] relative">
            {/* Header */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-[#F5F5F7]">Xác nhận đăng</h3>
              <p className="text-sm text-gray-400 mt-1">Chọn tài khoản và thời điểm đăng.</p>
            </div>

            {/* Account & Platform */}
            <div className="flex items-center gap-3 mb-4">
              {/* Platform icon */}
              <img src={platformOptions.find(p => p.name === selectedPlatform)?.icon || '/placeholder.svg'} alt={selectedPlatform} className={`w-7 h-7 ${['Twitter','Threads'].includes(selectedPlatform) ? 'filter brightness-0 invert' : ''}`} />
              <div className="flex-1 relative">
                <div 
                  className={`flex items-center gap-3 bg-[#1E1E23] rounded-lg p-3 h-12 cursor-pointer transition-colors border border-[#3A3A42] ${showAccountDropdown ? 'ring-2 ring-[#E33265]' : ''}`}
                  onClick={() => setShowAccountDropdown(!showAccountDropdown)}
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden">
                    <img src={selectedAccountPic} alt="Profile" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className="text-white text-sm">{selectedAccount || 'Chọn tài khoản'}</div>
                    <div className="text-xs text-white/50">{selectedPlatform}</div>
                  </div>
                  <ChevronDownIcon className="w-4 h-4 text-white/70" />
                </div>

                {/* Account Dropdown */}
                {showAccountDropdown && (
                  <div ref={accountDropdownRef} data-account-dropdown className="absolute top-full left-0 right-0 mt-1 bg-[#1E1E23] rounded-lg border border-gray-700 shadow-[0_0_0_1px_rgba(255,255,255,0.08)] z-10 max-h-48 overflow-y-auto">
                    {getAccountsForPlatform(selectedPlatform).map((account, index) => (
                      <button
                        key={index}
                        type="button"
                        className="w-full text-left flex items-center gap-3 p-3 hover:bg-gray-700 cursor-pointer"
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedAccount(account.username)
                          setSelectedAccountPic(account.profilePic)
                          setShowAccountDropdown(false)
                        }}
                      >
                        <div className="w-8 h-8 rounded-full overflow-hidden">
                          <img src={account.profilePic} alt="Profile" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <div className="text-white text-sm">{account.username}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Schedule */}
            <div className="mb-4">
              <p className="text-white mb-2">Khi nào bạn muốn đăng?</p>
              <div ref={calendarAnchorRef} className={`relative rounded-lg bg-[#1E1E23] border border-[#3A3A42]`}>
                <select 
                  value={publishTime} 
                  onChange={(e) => {
                    setPublishTime(e.target.value)
                    setShowCalendar(e.target.value === 'pick a time')
                  }}
                  className="w-full bg-[#1E1E23] text-white rounded-lg p-3 appearance-none pr-8 focus:outline-none"
                >
                  <option value="now|Bây giờ">Bây giờ</option>
                  <option value="next free slot">Khe trống tiếp theo</option>
                  <option value="pick a time">Chọn thời gian</option>
                </select>
                <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white pointer-events-none" />
              </div>
            </div>

            {publishTime === 'pick a time' && (
              <div className="mb-4">
                <div className="text-white mb-2">Chọn thời gian</div>
                <div 
                  className={`w-full bg-[#1E1E23] text-white rounded-lg p-3 cursor-pointer border border-[#3A3A42] ${showCalendar ? 'ring-2 ring-[#E33265]' : ''}`}
                  onClick={() => setShowCalendar(true)}
                  role="button"
                  aria-label="Chọn thời gian"
                >
                  {selectedDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} {selectedTime}
                </div>
              </div>
            )}

            {/* Calendar Popup */}
            {showCalendar && publishTime === 'pick a time' && (
              <div
                ref={calendarRef}
                className="absolute left-full top-0 ml-[15px] bg-[#2A2A30] rounded-xl p-4 w-[360px] border border-[#3A3A42] shadow-[0_0_0_1px_rgba(255,255,255,0.08)]"
                tabIndex={0}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <button onClick={() => { const d=new Date(selectedDate); d.setMonth(d.getMonth()-1); setSelectedDate(d) }} className="text-white hover:text-gray-300"><ChevronLeftIcon className="w-5 h-5" /></button>
                  <h3 className="text-white font-semibold">{selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h3>
                  <button onClick={() => { const d=new Date(selectedDate); d.setMonth(d.getMonth()+1); setSelectedDate(d) }} className="text-white hover:text-gray-300"><ChevronRightIcon className="w-5 h-5" /></button>
                </div>
                {/* Weekday headers */}
                <div className="grid grid-cols-7 text-center text-xs text-white/70 mb-2">
                  {vietnameseWeekdays.map((w) => (<div key={w} className="py-1">{w}</div>))}
                </div>
                {/* Month grid */}
                <div className="grid grid-cols-7 gap-1">
                  {getMonthGrid(selectedDate).flat().map((cell, idx) => {
                    const isSelected = cell.day === selectedDate.getDate()
                    return (
                      <button
                        key={idx}
                        disabled={!cell.day}
                        onClick={() => {
                          if (!cell.day) return
                          const d = new Date(selectedDate)
                          d.setDate(cell.day)
                          setSelectedDate(d)
                        }}
                        className={`h-9 rounded-md text-sm ${!cell.day ? 'opacity-30 cursor-default' : 'hover:bg-white/10'} ${isSelected ? 'bg-[#E33265]/20 text-white ring-1 ring-[#E33265]' : 'text-white/80'}`}
                      >
                        {cell.day || ''}
                      </button>
                    )
                  })}
                </div>
                {/* Time Input */}
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex items-center bg-[#1E1E23] text-white rounded px-3 py-2 gap-2 border border-[#3A3A42]">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={timeHour}
                      onChange={(e) => {
                        const v = e.target.value.replace(/[^0-9]/g, '').slice(0,2)
                        setTimeHour(v)
                      }}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleConfirmPickTime() }}
                      className="w-8 bg-transparent text-center"
                      placeholder="– –"
                      aria-label="Giờ"
                    />
                    <span>:</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={timeMinute}
                      onChange={(e) => {
                        const v = e.target.value.replace(/[^0-9]/g, '').slice(0,2)
                        setTimeMinute(v)
                      }}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleConfirmPickTime() }}
                      className="w-8 bg-transparent text-center"
                      placeholder="– –"
                      aria-label="Phút"
                    />
                    <select
                      value={timeAmPm}
                      onChange={(e) => setTimeAmPm(e.target.value as 'AM'|'PM')}
                      className="bg-transparent"
                      aria-label="AM/PM"
                    >
                      <option>AM</option>
                      <option>PM</option>
                    </select>
                  </div>
                  <button className="bg-[#E33265] text-white p-2 rounded active:bg-[#c52b57]" onClick={handleConfirmPickTime}>
                    <CheckCircleIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <Button 
                variant="outline" 
                className="flex-1 border-[#E33265] text-white hover:bg-[#E33265]/10"
                onClick={() => setShowPublishModal(false)}
              >
                Hủy
              </Button>
              <Button 
                className="flex-1 bg-[#E33265] hover:bg-[#c52b57] text-white opacity-50"
                onClick={() => { 
                  if (publishTime === 'pick a time') {
                    // Dispatch schedule event for calendar (yellow note)
                    const detail = {
                      platform: selectedPlatform || (currentPost?.type || ''),
                      date: selectedDate?.toISOString?.() || new Date().toISOString(),
                      time: selectedTime, // e.g., "07:30 PM"
                      content: postContents[selectedPostId] ?? ''
                    }
                    try { window.dispatchEvent(new CustomEvent('schedule-post', { detail })) } catch {}
                    setShowPublishModal(false)
                    // Close the active tab to avoid confusion after scheduling
                    try { onPostDelete(selectedPostId) } catch {}
                  } else {
                    setShowPublishModal(false); 
                    onPublish(selectedPostId)
                    // Close the active tab after instant publish
                    try { onPostDelete(selectedPostId) } catch {}
                  }
                }}
              >
                Đăng
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Lightbox/Modal để xem ảnh chi tiết */}
      {showLightbox && lightboxMediaUrl && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => {
            setShowLightbox(false);
            setLightboxMediaUrl(null);
            setLightboxMediaType(null);
          }}
        >
          <div
            className="relative max-w-full max-h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()} // Ngăn chặn đóng modal khi click vào ảnh
          >
            <button
              className="absolute top-4 right-4 bg-black/60 rounded-full p-2 text-white hover:bg-black/80 transition-colors"
              onClick={() => {
                setShowLightbox(false);
                setLightboxMediaUrl(null);
                setLightboxMediaType(null);
              }}
              aria-label="Đóng ảnh"
            >
              <CloseIcon className="w-6 h-6" />
            </button>

            {lightboxMediaType === 'image' ? (
              <img
                src={lightboxMediaUrl}
                alt="Ảnh phóng to"
                className="max-w-full max-h-[90vh] object-contain rounded-lg" // Điều chỉnh kích thước và giữ tỷ lệ
              />
            ) : (
              <video
                src={lightboxMediaUrl}
                controls // Hiển thị controls cho video phóng to
                autoPlay
                loop
                className="max-w-full max-h-[90vh] object-contain rounded-lg"
              />
            )}
          </div>
        </div>
      )}


     
{showCreatePostFromSourceModal && sourceToGeneratePost && (
  <CreatePostFromSourceModal
    source={sourceToGeneratePost}
    platformOptions={platformOptions} // Truyền prop này từ CreateSection
    onClose={() => setShowCreatePostFromSourceModal(false)}
    onGeneratePosts={async (selectedPlatforms: { platform: string; count: number }[]) => {
      // Logic để gọi Gemini API và tạo bài đăng

      if (!genAI || !model) {
        setChatMessages(prev => [...prev, { role: 'assistant', content: "Lỗi: Không thể kết nối với API Gemini để tạo bài đăng." }]);
        return;
      }

      setIsTyping(true); // Hiển thị trạng thái AI đang nhập trong chatbox
      let chatShow =`Hãy tạo bài đăng từ nguồn "${sourceToGeneratePost.value}" cho các nền tảng: ${selectedPlatforms.map(p => `${p.platform} (${p.count} bài)`).join(', ')}`;
      if (advancedInstructions) { // Kiểm tra nếu có hướng dẫn chi tiết
          chatShow += `\n**Yêu cầu chi tiết:**\n${advancedInstructions}\n`;
      }
      setChatMessages(prev => [...prev, { role: 'user', content: chatShow }]);

      try {
        const platformInstructions = selectedPlatforms.map(p => `Tạo ${p.count} bài đăng cho nền tảng ${p.platform}.`).join('\n');
        let userPrompt = `Dựa trên nguồn sau đây: "${sourceToGeneratePost.value}", hãy tạo các bài đăng theo yêu cầu:\n${platformInstructions}\n\nĐịnh dạng phản hồi của bạn là một mảng JSON, mỗi đối tượng chứa "platform", "content" và "summary_for_chat" như sau:\n\`\`\`json\n[\n  {\n    "action": "create_post",\n    "platform": "Tên nền tảng",\n    "content": "Nội dung bài đăng",\n    "summary_for_chat": "Tóm tắt ngắn gọn"\n  }\n]\n\`\`\``;
        let dataUrl = sourceToGeneratePost.value

        if (advancedInstructions) { // Kiểm tra nếu có hướng dẫn chi tiết
          userPrompt += `\n**Yêu cầu chi tiết:**\n${advancedInstructions}\n`;
          
          setAdvancedInstructions(''); 
        }


        let promptToSend:any = [{ text: userPrompt }]
      
        if(selectedSourceType ==='youtube')
        {
          promptToSend = [
            { text: userPrompt },
            ...(dataUrl ? [{ fileData: { fileUri: dataUrl, mimeType: "video/mp4", } }] : [])
          ]
        }

        if(selectedSourceType === 'tiktok')
        {
          // Gọi API để download và convert TikTok video sang base64
          try {
            setChatMessages(prev => [...prev, { role: 'assistant', content: 'Đang tải video TikTok...' }]);
            
            const response = await fetch('/api/tiktok/download', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ url: dataUrl })
            });

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || 'Không thể tải video TikTok');
            }

            const { base64, mimeType } = await response.json();
            
            // Sử dụng inline data với base64
            promptToSend = [
              { text: userPrompt },
              { 
                inlineData: { 
                  data: base64, 
                  mimeType: mimeType 
                } 
              }
            ];
            
            setChatMessages(prev => prev.slice(0, -1)); // Xóa message "Đang tải..."
          } catch (error) {
            console.error('Error downloading TikTok video:', error);
            setChatMessages(prev => [...prev.slice(0, -1), { 
              role: 'assistant', 
              content: `Lỗi khi tải video TikTok: ${error instanceof Error ? error.message : 'Unknown error'}. Vui lòng thử lại hoặc kiểm tra link.` 
            }]);
            setIsTyping(false);
            return; // Dừng xử lý nếu không tải được video
          }
        }

        console.log("selectedSourceType = ", selectedSourceType)
      
        if(selectedSourceType ==='pdf')
        {
          promptToSend = [
            { text: userPrompt },
            ...(dataUrl ? [{ fileData: { fileUri: dataUrl, mimeType: "application/pdf", } }] : [])
          ]
        }




       

        // Xây dựng lịch sử trò chuyện cho Gemini, bao gồm system instruction
        const chat = model.startChat({
          history: [{
              role: 'user',
              parts: [{ text: geminiSystemInstruction }]
            }, {
              role: 'model',
              parts: [{ text: "Đã hiểu! Tôi sẵn sàng giúp bạn tạo bài đăng hoặc trả lời câu hỏi." }]
            },
            ...chatMessages.map(msg => ({ // Thêm lịch sử chat hiện tại để duy trì ngữ cảnh
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.content }]
              })
            )
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 30000, // Tăng giới hạn đầu ra cho nhiều bài đăng
          },
          safetySettings: [
            {
              category: HarmCategory.HARM_CATEGORY_HARASSMENT,
              threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
            {
              category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
              threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
            {
              category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
              threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
            {
              category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
              threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
          ],
        });

        // const result = await chat.sendMessage(userPrompt); // Gửi prompt tới Gemini
        const result = await chat.sendMessage(promptToSend);

        let geminiResponseText = result.response.text();



try {
          const jsonMatch = geminiResponseText.match(/```json\n([\s\S]*?)\n```/);
          if (jsonMatch && jsonMatch[1]) {
            const parsedResponses = JSON.parse(jsonMatch[1]);
            if (Array.isArray(parsedResponses) && parsedResponses.every(res => res.action === "create_post")) {
              let overallSummary = `Đã tạo các bài đăng từ nguồn ${sourceToGeneratePost.type} (${sourceToGeneratePost.value}):\n`;
              // for (const postData of parsedResponses) {
              //   const formattedPlatform = platformOptions.find(p => p.name.toLowerCase() === postData.platform.toLowerCase())?.name || 'Facebook';
              //   overallSummary += `- ${postData.summary_for_chat || `Bài đăng cho ${formattedPlatform}.`}\n`;

              //   const newPostId = onPostCreate(formattedPlatform); // Tạo bài đăng mới
                
              //   console.log("postData = ", postData);
              //   console.log("formattedPlatform = ", formattedPlatform);

              //   if (newPostId) { // Đảm bảo newPostId có giá trị
               
              //     setTimeout(() => {
              //         const latest = [...posts].reverse().find(p => p.type.toLowerCase() === formattedPlatform.toLowerCase());
              //         const idToUpdate = latest?.id ?? newPostId;
              //         if (idToUpdate) {
              //             onPostSelect(idToUpdate);
              //             onPostContentChange(idToUpdate, postData.content);
              //         }
              //     }, 100); // Đợi một chút để state posts cập nhật
              //   }
              // }
              // setChatMessages(prev => [...prev, { role: 'assistant', content: overallSummary.trim() }]);

              // Sử dụng Promise.all để đợi tất cả các tác vụ tạo và cập nhật hoàn tất
              const creationPromises = parsedResponses.map(async (postData: any) => { // Dùng `any` tạm thời nếu không có kiểu chính xác cho `postData`
                const formattedPlatform = platformOptions.find(p => p.name.toLowerCase() === postData.platform.toLowerCase())?.name || 'Facebook';
                overallSummary += `- ${postData.summary_for_chat || `Bài đăng cho ${formattedPlatform}.`}\n`;

                // Gọi onPostCreate và nhận ngay ID của bài đăng mới
                const newPostId = onPostCreate(formattedPlatform); // <-- newPostId BÂY GIỜ PHẢI LÀ number

                console.log("postData = ", postData);
                console.log("formattedPlatform = ", formattedPlatform);
                console.log("newPostId returned from onPostCreate = ", newPostId); // Kiểm tra giá trị này

                if (typeof newPostId === 'number' && newPostId > 0) { // Kiểm tra chặt chẽ newPostId là number và hợp lệ
                  // Chọn bài đăng mới và cập nhật nội dung của nó
                  // Không cần setTimeout hay tìm kiếm bài đăng nữa vì đã có ID chính xác
                  onPostSelect(newPostId);
                  onPostContentChange(newPostId, postData.content);
                  console.log(`Đã cập nhật nội dung cho bài đăng ID ${newPostId} (${formattedPlatform})`);
                } else {
                  console.warn(`Không thể lấy ID bài đăng mới hoặc ID không hợp lệ cho nền tảng ${formattedPlatform}. Nội dung không được cập nhật.`);
                }
              });

              await Promise.all(creationPromises); // Chờ tất cả các bài đăng được tạo và cập nhật

              setChatMessages(prev => [...prev, { role: 'assistant', content: overallSummary.trim() }]);

            } else {
              throw new Error("Phản hồi JSON không đúng định dạng mong muốn.");
            }
          } else {
            throw new Error("Không tìm thấy khối JSON trong phản hồi.");
          }
        } catch (jsonError) {
          console.warn("Không thể phân tích phản hồi Gemini thành JSON mảng, xử lý như văn bản thuần túy.", jsonError);
          setChatMessages(prev => [...prev, { role: 'assistant', content: geminiResponseText }]);
        }

      } catch (error) {
        console.error("Lỗi khi gọi API Gemini để tạo bài đăng từ nguồn:", error);
        setChatMessages(prev => [...prev, { role: 'assistant', content: "Đã xảy ra lỗi khi tạo bài đăng từ nguồn từ Gemini. Vui lòng thử lại." }]);
      } finally {
        setIsTyping(false);
        setShowCreatePostFromSourceModal(false); // Đóng modal sau khi tạo
      }
    }}
  />
)}



      {/* Image Generation Modal */}
      {showImageGenModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={(e) => { if (e.target === e.currentTarget) setShowImageGenModal(false) }}>
          <div className="bg-[#2A2A30] border border-[#3A3A42] rounded-2xl w-[600px] max-w-[95vw] max-h-[90vh] overflow-hidden shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <SparklesIcon className="w-5 h-5 text-[#7C3AED]" />
                <h2 className="text-lg font-semibold text-white">Tạo ảnh với AI</h2>
              </div>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-4 overflow-auto" style={{ maxHeight: "60vh" }}>
              <div className="space-y-4">
                {/* Prompt Input */}
                <div>
                  <label className="block text-white mb-2 text-sm font-medium">Mô tả ảnh cần tạo</label>
                  <Textarea
                    placeholder="Mô tả chi tiết ảnh bạn muốn tạo..."
                    className="bg-[#1E1E23] border-[#3A3A42] text-white h-32 resize-none"
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                  />
                  <p className="text-xs text-gray-400 mt-1">Nội dung bài viết đã được tự động điền. Bạn có thể chỉnh sửa.</p>
                </div>

                {/* Image Count */}
                <div>
                  <label className="block text-white mb-2 text-sm font-medium">Số lượng ảnh (tối đa 3)</label>
                  <div className="flex items-center gap-3">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-9 w-9 p-0 bg-[#1E1E23] border-[#3A3A42] text-white hover:bg-white/5"
                      onClick={() => setImageCount(Math.max(1, imageCount - 1))}
                      disabled={imageCount <= 1}
                    >
                      -
                    </Button>
                    <span className="text-white text-lg font-semibold w-8 text-center">{imageCount}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-9 w-9 p-0 bg-[#1E1E23] border-[#3A3A42] text-white hover:bg-white/5"
                      onClick={() => setImageCount(Math.min(3, imageCount + 1))}
                      disabled={imageCount >= 3}
                    >
                      +
                    </Button>
                  </div>
                </div>

                {/* Image Size (Gemini supports 1K and 2K) */}
                <div>
                  <label className="block text-white mb-2 text-sm font-medium">Kích thước ảnh</label>
                  <select
                    value={imageSize}
                    onChange={(e) => setImageSize(e.target.value as "1K" | "2K")}
                    className="w-full bg-[#1E1E23] border border-[#3A3A42] text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
                  >
                    <option value="1K">1K - Tiêu chuẩn (1024x1024 tùy tỷ lệ)</option>
                    <option value="2K">2K - Chất lượng cao (2048x2048 tùy tỷ lệ)</option>
                  </select>
                  <p className="text-xs text-gray-400 mt-1">Kích thước thực tế phụ thuộc vào tỷ lệ khung hình</p>
                </div>

                {/* Aspect Ratio */}
                <div>
                  <label className="block text-white mb-2 text-sm font-medium">Tỷ lệ khung hình</label>
                  <select
                    value={imageAspectRatio}
                    onChange={(e) => setImageAspectRatio(e.target.value as typeof imageAspectRatio)}
                    className="w-full bg-[#1E1E23] border border-[#3A3A42] text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
                  >
                    <option value="1:1">1:1 - Vuông (Instagram, Facebook)</option>
                    <option value="4:3">4:3 - Ngang (Tiêu chuẩn)</option>
                    <option value="3:4">3:4 - Dọc (Story)</option>
                    <option value="16:9">16:9 - Ngang (YouTube, Twitter)</option>
                    <option value="9:16">9:16 - Dọc (TikTok, Reels)</option>
                  </select>
                </div>

                {/* Person Generation - Temporarily Commented */}
                {/* <div>
                  <label className="block text-white mb-2 text-sm font-medium">Cho phép tạo hình người</label>
                  <select
                    value={imagePersonGeneration}
                    onChange={(e) => setImagePersonGeneration(e.target.value as typeof imagePersonGeneration)}
                    className="w-full bg-[#1E1E23] border border-[#3A3A42] text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
                  >
                    <option value="allow_adult">Cho phép người lớn (Mặc định)</option>
                    <option value="allow_all">Cho phép tất cả</option>
                    <option value="dont_allow">Không cho phép</option>
                  </select>
                  <p className="text-xs text-gray-400 mt-1">Kiểm soát việc tạo hình người trong ảnh</p>
                </div> */}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-white/10 flex justify-end gap-3">
              <Button
                variant="outline"
                className="border-[#3A3A42] text-white hover:bg-white/5"
                onClick={() => setShowImageGenModal(false)}
              >
                Hủy
              </Button>
              <Button
                className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white"
                onClick={handleGenerateImage}
                disabled={!imagePrompt.trim() || isGeneratingImage}
              >
                {isGeneratingImage ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <SparklesIcon className="w-4 h-4 mr-2" />
                    Tạo ảnh
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Video Generation Modal */}
      {showVideoGenModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={(e) => { if (e.target === e.currentTarget) setShowVideoGenModal(false) }}>
          <div className="bg-[#2A2A30] border border-[#3A3A42] rounded-2xl w-[600px] max-w-[95vw] max-h-[90vh] overflow-hidden shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <SparklesIcon className="w-5 h-5 text-[#7C3AED]" />
                <h2 className="text-lg font-semibold text-white">Tạo video với AI (Veo3)</h2>
              </div>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-4 overflow-auto" style={{ maxHeight: "60vh" }}>
              <div className="space-y-4">
                {/* Prompt Input */}
                <div>
                  <label className="block text-white mb-2 text-sm font-medium">Mô tả video cần tạo</label>
                  <Textarea
                    placeholder="Mô tả chi tiết video bạn muốn tạo..."
                    className="bg-[#1E1E23] border-[#3A3A42] text-white h-32 resize-none"
                    value={videoPrompt}
                    onChange={(e) => setVideoPrompt(e.target.value)}
                  />
                  <p className="text-xs text-gray-400 mt-1">Nội dung bài viết đã được tự động điền. Bạn có thể chỉnh sửa.</p>
                </div>

                {/* Negative Prompt (Optional) */}
                <div>
                  <label className="block text-white mb-2 text-sm font-medium">Mô tả điều KHÔNG muốn (tùy chọn)</label>
                  <Input
                    placeholder="VD: mờ, tối, xấu, biến dạng..."
                    className="bg-[#1E1E23] border-[#3A3A42] text-white"
                    value={videoNegativePrompt}
                    onChange={(e) => setVideoNegativePrompt(e.target.value)}
                  />
                  <p className="text-xs text-gray-400 mt-1">Giúp AI tránh tạo những yếu tố không mong muốn</p>
                </div>

                {/* Video Aspect Ratio */}
                <div>
                  <label className="block text-white mb-2 text-sm font-medium">Tỷ lệ khung hình</label>
                  <select
                    value={videoAspectRatio}
                    onChange={(e) => setVideoAspectRatio(e.target.value as typeof videoAspectRatio)}
                    className="w-full bg-[#1E1E23] border border-[#3A3A42] text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
                  >
                    <option value="16:9">16:9 - Ngang (YouTube, Facebook)</option>
                    <option value="9:16">9:16 - Dọc (TikTok, Instagram Reels)</option>
                    <option value="1:1">1:1 - Vuông (Instagram Feed)</option>
                    <option value="4:5">4:5 - Dọc (Instagram Feed)</option>
                    <option value="4:3">4:3 - Tiêu chuẩn</option>
                  </select>
                </div>

                {/* Video Resolution */}
                <div>
                  <label className="block text-white mb-2 text-sm font-medium">Chất lượng video</label>
                  <select
                    value={videoResolution}
                    onChange={(e) => setVideoResolution(e.target.value as typeof videoResolution)}
                    className="w-full bg-[#1E1E23] border border-[#3A3A42] text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
                  >
                    <option value="720p">HD - 720p</option>
                    <option value="1080p">Full HD - 1080p (Khuyến nghị)</option>
                    <option value="4K">Ultra HD - 4K</option>
                  </select>
                </div>

                {/* Person Generation - Temporarily Commented */}
                {/* <div>
                  <label className="block text-white mb-2 text-sm font-medium">Cho phép tạo hình người</label>
                  <select
                    value={videoPersonGeneration}
                    onChange={(e) => setVideoPersonGeneration(e.target.value as typeof videoPersonGeneration)}
                    className="w-full bg-[#1E1E23] border border-[#3A3A42] text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
                  >
                    <option value="allow_adult">Cho phép người lớn (Mặc định)</option>
                    <option value="allow_all">Cho phép tất cả</option>
                    <option value="dont_allow">Không cho phép</option>
                  </select>
                  <p className="text-xs text-gray-400 mt-1">Kiểm soát việc tạo hình người trong video</p>
                </div> */}

                {/* Info note */}
                <div className="bg-[#7C3AED]/10 border border-[#7C3AED]/30 rounded-lg p-3">
                  <p className="text-xs text-gray-300">
                    <strong className="text-[#7C3AED]">Lưu ý:</strong> Chỉ có thể tạo 1 video mỗi lần. Quá trình tạo video có thể mất vài phút tùy thuộc vào độ phức tạp.
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-white/10 flex justify-end gap-3">
              <Button
                variant="outline"
                className="border-[#3A3A42] text-white hover:bg-white/5"
                onClick={() => setShowVideoGenModal(false)}
              >
                Hủy
              </Button>
              <Button
                className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white"
                onClick={handleGenerateVideo}
                disabled={!videoPrompt.trim() || isGeneratingVideo}
              >
                {isGeneratingVideo ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang tạo video...
                  </>
                ) : (
                  <>
                    <SparklesIcon className="w-4 h-4 mr-2" />
                    Tạo video
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}


    </div>
  )
}
