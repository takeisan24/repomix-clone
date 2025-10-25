// store/createPageStore.ts
import { create } from 'zustand';
import { saveToLocalStorage, loadFromLocalStorage, removeFromLocalStorage } from '@/lib';
import { CalendarEvent } from '@/lib';

// Thêm import cho Gemini
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai"
import { GoogleGenAI } from "@google/genai"

// Định nghĩa các kiểu dữ liệu (bạn có thể copy từ useCreatePage.ts)
interface Post {
  id: number
  type: string
  content?: string
}

interface DraftPost{
    id: number
    platform: string
    platformIcon?: string
    content: string
    time: string
    status: string
    media?: string[]
}

interface PublishedPost {
    id: number
    platform: string
    content: string
    time: string
    status: string
    url: string
    profileName?: string
    profilePic?: string
    engagement?: {
      likes: number
      comments: number
      shares: number
    }
}

interface FailedPost{
    id: number
    platform: string
    content: string
    date: string
    time: string
    error?: string
    profileName?: string
    profilePic?: string
    url?: string
    platformIcon?: string
}

interface VideoProject{
    id: string
    title: string
    thumbnail: string
    duration: string
    createdAt: string
    status: 'processing' | 'completed' | 'failed'
}

interface ApiStats {
    apiCalls: 1247,
    successRate: 98.5,
    rateLimit: {
      used: 750,
      total: 1000,
      resetTime: "2h 15m"
    }
}

interface ApiKey{
    id: string
    name: string
    type: 'production' | 'development'
    lastUsed: string
    isActive: boolean
}

interface MediaFile{
    id: string
    type: 'image' | 'video'
    preview: string
    file: File
}

interface ChatMessage { 
  role: 'user' | 'assistant'; 
  content: string; 
}

interface SavedSource{
  id: string;
  type: string;
  value: string;
  label: string;
}

type SourceToGenerate = {type: string; value: string} | null;

// Định nghĩa kiểu cho State và Actions
interface CreatePageState {
  // State
    activeSection: string;
    isSidebarOpen: boolean;
    language: 'vi' | 'en';
    openPosts: Post[];
    selectedPostId: number;
    postContents: Record<number, string>;
    postToEventMap: Record<number, {eventId: string, dateKey: string}>;
    uploadedMedia: MediaFile[];
    currentMediaIndex: number;
    videoProjects: VideoProject[];
    apiStats: ApiStats;
    apiKeys: ApiKey[];
    calendarEvents: Record<string, CalendarEvent[]>;
    draftPosts: DraftPost[];
    publishedPosts: PublishedPost[];
    failedPosts: FailedPost[];

    // Chat state
    chatMessages: ChatMessage[];
    isTyping: boolean;
    
    // Saved sources
    savedSources: SavedSource[];
    isSourceModalOpen: boolean;

    // Create from source modal state
    isCreateFromSourceModalOpen: boolean;
    sourceToGenerate: SourceToGenerate;

    // Publish modal state
    isPublishModalOpen: boolean;

    // Image generation modal state
    isImageGenModalOpen: boolean;
    isGeneratingMedia: boolean;

    // Video generation modal state
    isVideoGenModalOpen: boolean; 

    lightboxMedia: { url: string | null; type: 'image' | 'video' | null };
    

  // Actions (các hàm cập nhật state)
  // Các hàm đơn giản chỉ cập nhật state
  setActiveSection: (section: string) => void;
  setIsSidebarOpen: (isOpen: boolean) => void;
  setLanguage: (lang: 'vi' | 'en') => void;

  // Hàm chọn bài viết
  handlePostSelect: (id: number) => void;

  // Hàm quản lý bài viết
  handlePostCreate: (type: string) => number;
  handlePostDelete: (id: number) => void;
  handlePostContentChange: (id: number, content: string) => void;
  handleClonePost: (postId: number) => void;
  handleSaveDraft: (postId: number) => void;

  // Hàm quản lý media
  handleMediaUpload: (files: File[]) => void;
  handleMediaRemove: (mediaId: string) => void;

  // Hàm xuất bản bài viết
  handlePublish: (postId: number) => void;

  // Hàm quản lý bản nháp
  handleEditDraft: (post: DraftPost) => void;
  handleDeleteDraft: (id: number) => void;
  handlePublishDraft: (id: number) => void;

  // Hàm quản lý bài viết đã xuất bản và thất bại
  handleViewPost: (url: string) => void;
  handleRetryPost: (id: number, rescheduleDate?: string, rescheduleTime?: string) => void;
  handleDeletePost: (id: number) => void;

  // Hàm quản lý video
  handleVideoUpload: () => void;
  handleVideoEdit: (projectId: string) => void;
  handleVideoDelete: (projectId: string) => void;

  // Hàm quản lý sự kiện lịch
  handleEventAdd: (year: number, month: number, day: number, platform: string) => void;
  handleEventUpdate: (oldYear: number, oldMonth: number, oldDay: number, oldEvent: CalendarEvent, newYear: number, newMonth: number, newDay: number, newTime?: string) => void;
  handleEventDelete: (year: number, month: number, day: number, event: CalendarEvent) => void;
  handleClearCalendarEvents: () => void;

  // Hàm quản lý API keys
  handleRegenerateKey: (keyId: string) => void;
  handleCreateKey: () => void;

  // Hàm đặc biệt để mở post từ URL
  openPostFromUrl: (platform: string, content?: string, eventMapping?: { eventId: string; dateKey: string }) => void;

  // Hàm gửi chat đến AI
  submitChat: (chatInput: string) => Promise<void>;

  // Hàm quản lý nguồn đã lưu
  setIsSourceModalOpen: (isOpen: boolean) => void;
  addSavedSource: (source: Omit<SavedSource, 'id'>) => void;
  deleteSavedSource: (sourceId: string) => void;

  // Hàm quản lý modal tạo bài viết từ nguồn
  openCreateFromSourceModal: (source: SourceToGenerate) => void;
  closeCreateFromSourceModal: () => void;
  generatePostsFromSource: (selectedPlatforms: { platform: string; count: number }[]) => Promise<void>;
  
  setIsPublishModalOpen: (isOpen: boolean) => void;
  schedulePost: (postId: number, date: Date, time: string) => void;

  // Hàm quản lý modal tạo ảnh
  setIsImageGenModalOpen: (isOpen: boolean) => void;
  generateImage: (prompt: string, count: number, size: "1K" | "2K", aspectRatio: string) => Promise<void>;

  // Hàm quản lý modal tạo video
  setIsVideoGenModalOpen: (isOpen: boolean) => void;
  generateVideo: (prompt: string, negativePrompt: string, aspectRatio: string, resolution: string) => Promise<void>;

  // Hàm quản lý Lightbox
  openLightbox: (url: string, type: 'image' | 'video') => void;
  closeLightbox: () => void;
}

export const useCreatePageStore = create<CreatePageState>((set, get) => ({
  // --- Giá trị khởi tạo cho State ---
  activeSection: 'create',
  isSidebarOpen: false,
  language: 'vi',
  openPosts: [],
  selectedPostId: 0,
  postContents: {},
  postToEventMap: {},
  uploadedMedia: [],
  currentMediaIndex: 0,
  // Tải dữ liệu từ localStorage ngay khi store được tạo
  calendarEvents: loadFromLocalStorage('calendarEvents', {}),
  draftPosts: loadFromLocalStorage('draftPosts', []),
  publishedPosts: loadFromLocalStorage('publishedPosts', []),
  failedPosts: loadFromLocalStorage('failedPosts', []),

  videoProjects: [], // Tạm thời để trống, bạn có thể thêm logic load sau
  apiStats: { apiCalls: 1247, successRate: 98.5, rateLimit: { used: 750, total: 1000, resetTime: "2h 15m" } },
  apiKeys: [ 
    { id: '1', name: 'Production Key', type: 'production', lastUsed: '2 hours ago', isActive: true }, 
    { id: '2', name: 'Development Key', type: 'development', lastUsed: '1 day ago', isActive: true } 
  ],

  // Chat state
  chatMessages: [],
  isTyping: false,

  // Saved sources state
  savedSources: loadFromLocalStorage('savedSources', []),
  isSourceModalOpen: false,

  // Create from source modal state
  isCreateFromSourceModalOpen: false,
  sourceToGenerate: null,

  isPublishModalOpen: false,

  isGeneratingMedia: false,
  isImageGenModalOpen: false,

  isVideoGenModalOpen: false,
  lightboxMedia: { url: null, type: null },

  // --- Triển khai các Actions ---
  // Các hàm đơn giản chỉ cập nhật state
  setActiveSection: (section) => set({ activeSection: section }),
  setIsSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
  setLanguage: (lang) => set({ language: lang }),

  // Hàm chọn bài viết
  handlePostSelect: (id) => set({ selectedPostId: id }),

  //Hàm quản lý bài viết
  handlePostCreate: (type) => {
    const newPostId = Date.now() + Math.floor(Math.random() * 1000000);
    const newPost = { id: newPostId, type: type };
    set((state) => ({
      openPosts: [...state.openPosts, newPost],
      postContents: { ...state.postContents, [newPostId]: '' },
      selectedPostId: newPostId,
    }));
    return newPostId;
  },

  // Xóa bài viết và cập nhật selectedPostId nếu cần
  handlePostDelete: (id) => {
    set((state) => {
      const remaining = state.openPosts.filter((p) => p.id !== id);
      const nextId = remaining.length > 0 ? remaining[0].id : 0;
      const newPostContents = { ...state.postContents };
      delete newPostContents[id];
      const newPostToEventMap = { ...state.postToEventMap };
      delete newPostToEventMap[id];
      return {
        openPosts: remaining,
        selectedPostId: nextId,
        postContents: newPostContents,
        postToEventMap: newPostToEventMap,
      };
    });
  },
  
  // Cập nhật nội dung bài viết và đồng bộ với calendar event nếu có liên kết
  handlePostContentChange: (id, content) => {
    set((state) => {
        const updatedPostContents = { ...state.postContents, [id]: content };
        saveToLocalStorage('postContents', updatedPostContents);
        
        // Cập nhật calendar event nếu có liên kết
        const eventMapping = state.postToEventMap[id];
        if (eventMapping) {
            const { eventId, dateKey } = eventMapping;
            const updatedCalendarEvents = { ...state.calendarEvents };
            if (updatedCalendarEvents[dateKey]) {
                updatedCalendarEvents[dateKey] = updatedCalendarEvents[dateKey].map(event => 
                    event.id === eventId ? { ...event, content } : event
                );
                saveToLocalStorage('calendarEvents', updatedCalendarEvents);
                return { postContents: updatedPostContents, calendarEvents: updatedCalendarEvents };
            }
        }
        
        return { postContents: updatedPostContents };
    });
  },


  // Nhân bản bài viết
  handleClonePost: (postId) => {
    const { openPosts, postContents } = get();
    const post = openPosts.find(p => p.id === postId);
    if (!post) return;
    
    const newId = Date.now();
    const content = postContents[postId] || "";
    const newPost = { id: newId, type: post.type };

    set(state => ({
        openPosts: [...state.openPosts, newPost],
        postContents: { ...state.postContents, [newId]: content },
        selectedPostId: newId
    }));
  },


  // Lưu bản nháp vào localStorage
  handleSaveDraft: (postId) => {
    const { openPosts, postContents, draftPosts } = get();
    const post = openPosts.find(p => p.id === postId);
    if (!post) return;

    const content = postContents[postId] || "";
    const draft: DraftPost = {
      id: postId,
      platform: post.type,
      content,
      time: new Date().toISOString(),
      status: 'draft'
    };

    const updatedDrafts = [...draftPosts.filter(d => d.id !== postId), draft];
    set({ draftPosts: updatedDrafts });
    saveToLocalStorage('draftPosts', updatedDrafts);
  },

  // Hàm quản lý media
  handleMediaUpload: (files) => {
    const mediaFiles: MediaFile[] = files.map(file => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      type: file.type.startsWith('image/') ? 'image' : 'video',
      preview: URL.createObjectURL(file),
      file
    }));
    set(state => ({ uploadedMedia: [...state.uploadedMedia, ...mediaFiles] }));
  },

  handleMediaRemove: (mediaId) => {
    set(state => ({
      uploadedMedia: state.uploadedMedia.filter(media => media.id !== mediaId)
    }));
  },

  handlePublish: (postId) => {
    const { openPosts, postContents, publishedPosts, handlePostDelete } = get();
    const post = openPosts.find(p => p.id === postId);
    if (post) {
      const publishedPost: PublishedPost = {
        id: postId,
        platform: post.type,
        content: postContents[postId] || "",
        time: new Date().toISOString(),
        status: 'published',
        url: `https://${post.type.toLowerCase()}.com/post/${postId}`,
        engagement: { likes: 0, comments: 0, shares: 0 }
      };
      const updatedPublished = [...publishedPosts, publishedPost];
      set({ publishedPosts: updatedPublished });
      saveToLocalStorage('publishedPosts', updatedPublished);
      handlePostDelete(postId);
    }
  },
  
  handleEditDraft: (post: DraftPost) => {
    // Hàm này sẽ gọi một action khác để giữ logic tập trung
    get().openPostFromUrl(post.platform, post.content);
    set({ activeSection: 'create' });
  },

  openPostFromUrl: (platform, content = '', eventMapping) => {
    const { openPosts } = get();
    const existing = openPosts.find(p => p.type === platform);
    let targetId = existing?.id;

    if (!targetId) {
      targetId = Date.now();
      const newPost = { id: targetId, type: platform };
      set(state => ({
        openPosts: [...state.openPosts, newPost]
      }));
    }

    set(state => ({
        selectedPostId: targetId!,
        postContents: { ...state.postContents, [targetId!]: content },
        postToEventMap: eventMapping ? { ...state.postToEventMap, [targetId!]: eventMapping } : state.postToEventMap
    }));
  },


  handleDeleteDraft: (id) => {
    set(state => {
        const updated = state.draftPosts.filter(p => p.id !== id);
        saveToLocalStorage('draftPosts', updated);
        return { draftPosts: updated };
    });
  },

  handlePublishDraft: (id) => {
    const { draftPosts, handlePublish, handleDeleteDraft } = get();
    const draft = draftPosts.find(p => p.id === id);
    if(draft) {
        // Đây là một ví dụ action gọi action khác
        handlePublish(id);
        handleDeleteDraft(id);
    }
  },
  
  handleViewPost: (url) => { if (url) window.open(url, '_blank'); },

  handleRetryPost: (id, rescheduleDate, rescheduleTime) => { 

        const { failedPosts, openPostFromUrl } = get();
        const post = failedPosts.find(p => p.id === id);
        if (!post) return {};
        
        const updatedFailedPosts = failedPosts.filter(p => p.id !== id);
        set({failedPosts: updatedFailedPosts});
        saveToLocalStorage('failedPosts', updatedFailedPosts);

        if(rescheduleDate || rescheduleTime){
            const dateObj = new Date(rescheduleDate || '');
            const year = dateObj.getFullYear();
            const month = dateObj.getMonth();
            const day = dateObj.getDate();
            get().handleEventAdd(year, month, day, post.platform);
        } else{
            const newPublishPost: PublishedPost = {
                id: Date.now(),
                platform: post.platform,
                content: post.content,
                time: new Date().toISOString(),
                status: 'published',
                url: `https://${post.platform.toLowerCase()}.com/post/${Date.now()}`,
            };
            set(state => {
                const uodatedPublished = [...state.publishedPosts, newPublishPost];
                saveToLocalStorage('publishedPosts', uodatedPublished);
                return { publishedPosts: uodatedPublished };
            });
        }
   },
  handleDeletePost: (id) => {
    set(state => {
        const updatedPublished = state.publishedPosts.filter(p => p.id !== id);
        const updatedFailed = state.failedPosts.filter(p => p.id !== id);
        saveToLocalStorage('publishedPosts', updatedPublished);
        saveToLocalStorage('failedPosts', updatedFailed);
        return { publishedPosts: updatedPublished, failedPosts: updatedFailed };
    });
  },
  
  //Hàm quản lý video
  // Tạm thời để trống các hàm này
  handleVideoUpload: () => console.log('Video upload'),

  handleVideoEdit: (projectId) => console.log('Edit video:', projectId),
  
  handleVideoDelete: (projectId) => {
    set(state => ({
        videoProjects: state.videoProjects.filter(p => p.id !== projectId)
    }));
  },

// Hàm thêm sự kiện vào lịch
  handleEventAdd: (year, month, day, platform) => {
      const key = `${year}-${month}-${day}`;
      const eventId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newEvent: CalendarEvent = {
          id: eventId,
          platform,
          time: '',
          status: 'Trống',
          noteType: 'yellow'
      };
      set(state => {
          const updatedEvents = { ...state.calendarEvents };
          updatedEvents[key] = [...(updatedEvents[key] || []), newEvent];
          saveToLocalStorage('calendarEvents', updatedEvents);
          return { calendarEvents: updatedEvents };
      });
  },

  handleEventDelete: (year, month, day, event) => {
    const key = `${year}-${month}-${day}`;
    set(state => {
        const updated = { ...state.calendarEvents };
        if (updated[key]) {
            updated[key] = updated[key].filter(ev => ev.id !== event.id);
            if(updated[key].length === 0) delete updated[key];
        }
        saveToLocalStorage('calendarEvents', updated);
        return { calendarEvents: updated };
    });
  },

  handleEventUpdate: (oldYear, oldMonth, oldDay, oldEvent, newYear, newMonth, newDay, newTime) => {
      const oldKey = `${oldYear}-${oldMonth}-${oldDay}`;
      const newKey = `${newYear}-${newMonth}-${newDay}`;
      set(state => {
          const updated = { ...state.calendarEvents };
          // Xóa khỏi vị trí cũ
          if (updated[oldKey]) {
              updated[oldKey] = updated[oldKey].filter(ev => ev.id !== oldEvent.id);
              if (updated[oldKey].length === 0) delete updated[oldKey];
          }
          // Thêm vào vị trí mới
          const updatedEvent = newTime !== undefined ? { ...oldEvent, time: newTime } : oldEvent;
          updated[newKey] = [...(updated[newKey] || []), updatedEvent];
          updated[newKey].sort((a, b) => (a.time || '').localeCompare(b.time || ''));
          saveToLocalStorage('calendarEvents', updated);
          return { calendarEvents: updated };
      });
  },

  handleClearCalendarEvents: () => {
    set({ calendarEvents: {} });
    removeFromLocalStorage('calendarEvents');
  },

  //Hàm quản lý API keys
  handleRegenerateKey: (keyId) => console.log('Regenerate key:', keyId),
    
  handleCreateKey: () => console.log('Create new key'),

  // Hàm gửi chat đến AI
  submitChat: async (chatInput) => {
    const text = chatInput.trim()
    if (!text || get().isTyping) return;
    
    const userMessage = { role: 'user' as const, content: text };
    set(state => ({ 
            chatMessages: [...state.chatMessages, userMessage] 
        }));
    set({ isTyping: true });
    
    const currentChatMessages = get().chatMessages;
    const historyForApi = currentChatMessages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }))

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history: historyForApi, newMessage: text , 
          //modelPreference: get().selectedChatModel
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Lỗi API: ${response.statusText}`);
      }
      
      const data = await response.json();
      const geminiResponseText = data.response;
      
      let aiResponseForChat = geminiResponseText; // Mặc định hiển thị toàn bộ phản hồi
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
      set(state => ({ 
            chatMessages: [...state.chatMessages, { role: 'assistant', content: aiResponseForChat }] 
        }));

      // Nếu AI báo hiệu tạo bài đăng, hãy thực hiện
      if (shouldCreatePost && platformName && postContent) {
        // Đảm bảo platformName hợp lệ
        // const formattedPlatform = platformOptions.find(p => p.name.toLowerCase() === platformName.toLowerCase())?.name || 'Facebook';
        // const newPostId = onPostCreate(formattedPlatform) // Tạo và tự động chọn tab
        const { handlePostCreate, handlePostContentChange } = get();
        const newPostId = handlePostCreate(platformName);
        if (newPostId){
          handlePostContentChange(newPostId, postContent);
        }
        
        // set(state => ({
        //   openPosts: [...state.openPosts, newPostId],
        //   postContents: { ...state.postContents, [newPostId]: postContent },
        //   selectedPostId: newPostId,
        // }));
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Lỗi không xác định.";
            set(state => ({ 
                chatMessages: [...state.chatMessages, { role: 'assistant', content: `Xin lỗi, đã có lỗi xảy ra: ${errorMessage}` }] 
            }));
    } finally {
      set({ isTyping: false });
    }
  },

  // Hàm quản lý nguồn đã lưu
  setIsSourceModalOpen: (isOpen) => set({ isSourceModalOpen: isOpen }),

  addSavedSource: (source) => {
    const newSource = { ...source, id: Date.now().toString() };
    set(state => {
        const updatedSources = [...state.savedSources, newSource];
        saveToLocalStorage('savedSources', updatedSources);
        return { savedSources: updatedSources };
    });
},

  deleteSavedSource: (sourceId) => {
    set(state => {
        const updatedSources = state.savedSources.filter(s => s.id !== sourceId);
        saveToLocalStorage('savedSources', updatedSources);
        return { savedSources: updatedSources };
    });
},

openCreateFromSourceModal: (source) => set({ sourceToGenerate: source, isCreateFromSourceModalOpen: true }),

closeCreateFromSourceModal: () => set({ isCreateFromSourceModalOpen: false, sourceToGenerate: null }),

generatePostsFromSource: async (selectedPlatforms) => {
    const { sourceToGenerate, handlePostCreate, handlePostContentChange} = get();
    if (!sourceToGenerate) return;

    set({ isTyping: true, isCreateFromSourceModalOpen: false});

    set(state => ({
        chatMessages: [...state.chatMessages, { role: 'user', content: `Đang tạo ${selectedPlatforms.reduce((acc, p) => acc + p.count, 0)} bài viết từ nguồn ${sourceToGenerate.type}...` }]
    }));
    
    const platformInstructions = selectedPlatforms.map(p => `Tạo ${p.count} bài đăng cho nền tảng ${p.platform}.`).join('\n');
    let userPrompt = `Dựa trên nguồn sau đây: "${sourceToGenerate.value}", hãy tạo các bài đăng theo yêu cầu:\n${platformInstructions}\n\nHãy sáng tạo, đừng chỉ tóm tắt. Mỗi bài đăng phải có nội dung độc đáo, phù hợp với văn phong của nền tảng được chỉ định.\n\nĐịnh dạng phản hồi của bạn BẮT BUỘC là một mảng JSON, mỗi đối tượng chứa "platform", "content", và "summary_for_chat" như sau:\n\`\`\`json\n[\n  {\n    "action": "create_post",\n    "platform": "Tên nền tảng",\n    "content": "Nội dung bài đăng đã tạo.",\n    "summary_for_chat": "Tóm tắt ngắn gọn để hiển thị trong chatbox."\n  }\n]\n\`\`\``;
    

    try {
        const response = await fetch('/api/generate-from-source', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({prompt: userPrompt}),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Lỗi API: ${response.statusText}`);
        }

        const data = await response.json();
        const geminiResponseText = data.response;

        // 4. Xử lý kết quả trả về
        const jsonMatch = geminiResponseText.match(/```json\n([\s\S]*?)\n```/);
        if (!jsonMatch || !jsonMatch[1]) {
            throw new Error("Phản hồi của AI không chứa khối JSON hợp lệ.");
        }

        const parsedResponses = JSON.parse(jsonMatch[1]);
        if (!Array.isArray(parsedResponses)) {
            throw new Error("Dữ liệu JSON trả về không phải là một mảng.");
        }

        let overallSummary = `Đã tạo thành công các bài viết từ nguồn:\n`;
        let postsCreated = 0;

        // Dùng for...of để đảm bảo thứ tự thực thi
        for (const postData of parsedResponses) {
            if (postData.action === "create_post" && postData.platform && postData.content) {
                // Gọi các action khác trong store để cập nhật state
                const newPostId = handlePostCreate(postData.platform);
                if (newPostId) {
                    handlePostContentChange(newPostId, postData.content);
                    postsCreated++;
                }
                overallSummary += `- ${postData.summary_for_chat || `Một bài đăng cho ${postData.platform}`}\n`;
            }
        }
        
        if (postsCreated === 0) {
            throw new Error("AI không trả về bài viết nào hợp lệ.");
        }

        set(state => ({
            chatMessages: [...state.chatMessages, { role: 'assistant', content: overallSummary.trim() }]
        }));

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Đã xảy ra lỗi không xác định.";
        console.error("Lỗi khi tạo bài viết từ nguồn:", error);
        set(state => ({
            chatMessages: [...state.chatMessages, { role: 'assistant', content: `Tạo bài viết từ nguồn thất bại: ${errorMessage}` }]
        }));
    } finally {
        set({ isTyping: false, sourceToGenerate: null });
    }
},

setIsPublishModalOpen(isOpen) {
    set({ isPublishModalOpen: isOpen });
},

schedulePost: (postId, date, time) => {
    const { openPosts, postContents, handlePostDelete } = get();
    const post = openPosts.find(p => p.id === postId);
    if (!post) return;

    const content = postContents[postId] || "";
        const [hStr, rest] = String(time || '').split(':');
        let hour = parseInt(hStr || '0', 10);
        let minute = parseInt((rest || '0').slice(0, 2) || '0', 10);
        const ampm = (time || '').toUpperCase().includes('PM');
        if (ampm && hour < 12) hour += 12;
        if (!ampm && hour === 12) hour = 0;
        const pad = (n: number) => (n < 10 ? `0${n}` : String(n));
        const time24 = `${pad(hour)}:${pad(minute)}`;

        const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
        const eventId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newEvent: CalendarEvent = {
            id: eventId, platform: post.type, time: time24,
            status: `scheduled ${time}`, noteType: 'yellow', content: content
        };

        set(state => {
            const updatedEvents = { ...state.calendarEvents };
            updatedEvents[key] = [...(updatedEvents[key] || []), newEvent];
            saveToLocalStorage('calendarEvents', updatedEvents);
            return { calendarEvents: updatedEvents };
        });
    console.log(`Đã lên lịch bài viết ID ${postId} cho ${post.type} vào ${date.toLocaleDateString()} lúc ${time}`);

    // Sau khi lên lịch, xóa tab đang mở
    handlePostDelete(postId);
},

setIsImageGenModalOpen: (isOpen) => set({ isImageGenModalOpen: isOpen }),

generateImage: async (prompt, count, size, aspectRatio) => {
    const { selectedPostId } = get();
    if (!prompt.trim() || !selectedPostId) return;

    set({ isGeneratingMedia: true, isImageGenModalOpen: false });

    // Thông báo cho người dùng qua chatbox
    set(state => ({
        chatMessages: [...state.chatMessages, { role: 'assistant', content: `🎨 Bắt đầu tạo ${count} ảnh với prompt: "${prompt}"...` }]
    }));

    try {
      const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!GEMINI_API_KEY) throw new Error("Thiếu Gemini API Key");

      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
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
        const result = await imageModel.generateContent(prompt)

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
          set(state => ({
            uploadedMedia: [...state.uploadedMedia, ...newMediaFiles],
            chatMessages: [...state.chatMessages, { role: 'assistant', content: `✅ Đã tạo thành công ${newMediaFiles.length} ảnh và thêm vào bài viết.` }]
          }));

        } else {
          throw new Error("Không thể trích xuất dữ liệu ảnh từ phản hồi API. API có thể chỉ trả về text description.")
        }
        
      } catch (error: any) {
        // API error - log detailed error
        const errorMessage = error instanceof Error ? error.message : "Lỗi không xác định";
        console.error("Lỗi API khi tạo ảnh:", error);
        set(state => ({
          chatMessages: [...state.chatMessages, { role: 'assistant', content: `❌ Tạo ảnh thất bại: ${errorMessage}` }]
        }));
      } finally{
        set({ isGeneratingMedia: false });
      }
      
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : "Lỗi không xác định";
        console.error("Lỗi khi tạo ảnh:", error);
        set(state => ({
            chatMessages: [...state.chatMessages, { role: 'assistant', content: `❌ Tạo ảnh thất bại: ${errorMessage}` }]
        }));
      
      
    } finally {
      set({ isGeneratingMedia: false, isImageGenModalOpen: false });
    }
},

setIsVideoGenModalOpen: (isOpen) => set({ isVideoGenModalOpen: isOpen }),

generateVideo: async (prompt, negativePrompt, aspectRatio, resolution) => {
    const { selectedPostId } = get();
    if (!prompt.trim() || !selectedPostId) return;

    // 1. Cập nhật UI
    set({ isGeneratingMedia: true, isVideoGenModalOpen: false });
    set(state => ({
        chatMessages: [...state.chatMessages, { role: 'assistant', content: `🎬 Bắt đầu tạo video với Veo 3... Prompt: "${prompt}". Quá trình này có thể mất vài phút.` }]
    }));

    // 2. Logic gọi API Veo 3 (chuyển từ file gốc)
    try {
        const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
        if (!GEMINI_API_KEY) throw new Error("API Key của Gemini chưa được cấu hình.");
        
        const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

        let operation = await ai.models.generateVideos({
            model: "veo-3.0-fast-generate-001",
            source: { prompt },
            config: { numberOfVideos: 1, aspectRatio, resolution, negativePrompt }
        });

        set(state => ({
            chatMessages: [...state.chatMessages, { role: 'assistant', content: `⏳ Video đang được xử lý... Operation đã được tạo.` }]
        }));
        
        // 3. Logic Polling (chờ kết quả)
        let pollCount = 0;
        while (!operation.done) {
            console.log("Đang chờ video hoàn thành...");
            await new Promise((resolve) => setTimeout(resolve, 10000)); // Chờ 10 giây
            pollCount++;
            
            set(state => {
                const newMessages = [...state.chatMessages];
                const lastMessageIndex = newMessages.length - 1;
                if (lastMessageIndex >= 0 && newMessages[lastMessageIndex].role === 'assistant') {
                    newMessages[lastMessageIndex] = { role: 'assistant', content: `⏳ Đang xử lý... (${pollCount * 10}s). Veo 3 đang tạo video...` };
                    return { chatMessages: newMessages };
                }
                return {};
            });

            operation = await ai.operations.getVideosOperation({ operation });

            if (pollCount >= 60) { // Timeout sau 10 phút
                throw new Error("Quá trình tạo video mất quá nhiều thời gian (timeout 10 phút).");
            }
        }

        // 4. Xử lý video khi đã hoàn thành
        if (!operation.response?.generatedVideos?.[0]?.video) {
            throw new Error("Không nhận được file video từ API.");
        }
        
        const videoFile = operation.response.generatedVideos[0].video;
        const videoUri = (videoFile as any).uri || (videoFile as any).fileUri;
        if (!videoUri) throw new Error("Không tìm thấy URI của video.");

        set(state => ({
            chatMessages: [...state.chatMessages, { role: 'assistant', content: `📥 Đang tải video về...` }]
        }));
        
        const response = await fetch(videoUri);
        if (!response.ok) throw new Error(`Tải video thất bại: ${response.statusText}`);

        const videoBlob = await response.blob();
        const file = new File([videoBlob], `veo3-video-${Date.now()}.mp4`, { type: 'video/mp4' });
        const preview = URL.createObjectURL(videoBlob);
        
        const newMediaFile: MediaFile = {
            id: `veo3-video-${Date.now()}`,
            type: 'video',
            preview: preview,
            file: file
        };

        // 5. Cập nhật state thành công
        set(state => ({
            uploadedMedia: [...state.uploadedMedia, newMediaFile],
            chatMessages: [...state.chatMessages, { role: 'assistant', content: `✅ Video đã được tạo thành công và thêm vào bài viết! Kích thước: ${(videoBlob.size / 1024 / 1024).toFixed(2)} MB` }]
        }));

    } catch (error) {
        // 6. Cập nhật state thất bại
        const errorMessage = error instanceof Error ? error.message : "Lỗi không xác định";
        console.error("Lỗi khi tạo video:", error);
        set(state => ({
            chatMessages: [...state.chatMessages, { role: 'assistant', content: `❌ Tạo video thất bại: ${errorMessage}` }]
        }));
    } finally {
        // 7. Luôn tắt trạng thái loading
        set({ isGeneratingMedia: false });
    }
},

openLightbox: (url, type) => set({ lightboxMedia: { url, type } }),

closeLightbox: () => set({ lightboxMedia: { url: null, type: null } }),
}));

export const getCreatePageStore = useCreatePageStore.getState;
