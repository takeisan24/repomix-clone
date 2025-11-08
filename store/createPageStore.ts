
import { create } from 'zustand';
import { saveToLocalStorage, loadFromLocalStorage, removeFromLocalStorage } from '@/lib/utils/storage';
import { CalendarEvent } from '@/lib/types/calendar';
import { toast } from 'sonner';
import { getToast } from '@/lib/utils/i18nHelper';

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

export interface FailedPost{
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

export interface VideoProject{
    id: string
    title: string
    thumbnail: string
    duration: string
    createdAt: string
    status: 'processing' | 'completed' | 'failed'
    // Thêm các trường tùy chọn
    originalFile?: File; 
    options?: {
        language: string;
        multiSpeaker: boolean;
        translate: boolean;
    };
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

    isSavingDraft: boolean;
    

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
  handleVideoUpload: (file: File, options: { language: string; multiSpeaker: boolean; translate: boolean; }) => void;
  handleVideoEdit: (projectId: string) => void;
  handleVideoDelete: (projectId: string) => void;

  // Hàm quản lý sự kiện lịch
  handleEventAdd: (year: number, month: number, day: number, platform: string, time?: string) => void;
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
  videoProjects: loadFromLocalStorage('videoProjects', []) as VideoProject[], 
  

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

  isSavingDraft: false,

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
    if (!post) {
        toast.error(getToast('cannotClone'));
        return;
    };
    
    const newId = Date.now();
    const content = postContents[postId] || "";
    const newPost = { id: newId, type: post.type };

    set(state => ({
        openPosts: [...state.openPosts, newPost],
        postContents: { ...state.postContents, [newId]: content },
        selectedPostId: newId
    }));

    // Hiển thị thông báo thành công
    toast.info(getToast('postCloned', { platform: post.type }));
  },

  // Lưu bản nháp vào localStorage
  handleSaveDraft: (postId) => {
        set({ isSavingDraft: true }); // Bật trạng thái loading
        try {
            const { openPosts, postContents, draftPosts } = get();
            const post = openPosts.find(p => p.id === postId);
            if (!post) {
                throw new Error(getToast('postNotFound'));
            }

            const content = postContents[postId] || "";
            // Yêu cầu: Không lưu nháp nếu nội dung rỗng
            if (!content.trim()) {
                toast.warning(getToast('cannotSaveEmptyDraft'));
                return; // Dừng lại ở đây
            }

            const draft: DraftPost = {
                id: postId,
                platform: post.type,
                content,
                time: new Date().toISOString(),
                status: 'draft'
            };

            const updatedDrafts = [
                ...draftPosts.filter(d => d.id !== postId), // Xóa bản nháp cũ (nếu có)
                draft // Thêm bản nháp mới/cập nhật
            ];

            set({ draftPosts: updatedDrafts });
            saveToLocalStorage('draftPosts', updatedDrafts);

            // Hiển thị thông báo thành công
            toast.success(getToast('draftSavedSuccess'));

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : getToast('postNotFound');
            console.error("Lỗi khi lưu bản nháp:", error);
            // Hiển thị thông báo lỗi
            toast.error(getToast('draftSaveFailed', { error: errorMessage }));
        } finally {
            // Luôn tắt trạng thái loading sau 1 giây để người dùng thấy phản hồi
            setTimeout(() => {
                set({ isSavingDraft: false });
            }, 1000);
        }
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
    const { openPosts, postContents, publishedPosts, calendarEvents, handlePostDelete } = get();
    const post = openPosts.find(p => p.id === postId);

    if (post) {
        const content = postContents[postId] || "";
        if (!content.trim()) {
            toast.warning(getToast('cannotPublishEmpty'));
            return;
        }

        const now = new Date();
        const publishedPost: PublishedPost = {
            id: postId,
            platform: post.type,
            content: content,
            time: now.toISOString(),
            status: 'published',
            url: `https://${post.type.toLowerCase()}.com/post/${postId}`,
            engagement: { likes: 0, comments: 0, shares: 0 }
        };

        const updatedPublished = [...publishedPosts, publishedPost];

        const pad = (n: number) => String(n).padStart(2, '0');
        const time24h = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
        const dateKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;

        const newCalendarEvent: CalendarEvent = {
            id: `event-${Date.now()}`,
            platform: post.type,
            time: time24h,
            status: 'posted',
            noteType: 'green',
            content: content,
            url: publishedPost.url
        };

        const updatedEvents = { ...calendarEvents };
        updatedEvents[dateKey] = [...(updatedEvents[dateKey] || []), newCalendarEvent];

        set({ 
            publishedPosts: updatedPublished,
            calendarEvents: updatedEvents // Cập nhật state của lịch
        });
        saveToLocalStorage('publishedPosts', updatedPublished);
        
        // Hiển thị thông báo thành công
        toast.success(getToast('publishSuccess', { platform: post.type }));

        // Xóa tab bài viết đã đăng
        handlePostDelete(postId);
    } else {
        toast.error(getToast('cannotPublishNotFound'));
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
        const draftToDelete = state.draftPosts.find(p => p.id === id);
        if (!draftToDelete) {
            // Hiển thị lỗi nếu không tìm thấy, mặc dù trường hợp này hiếm
            toast.error(getToast('draftNotFoundToDelete'));
            return {};
        }

        const updated = state.draftPosts.filter(p => p.id !== id);
        saveToLocalStorage('draftPosts', updated);

        // Hiển thị thông báo thành công
        toast.success(getToast('draftDeletedSuccess'));
        
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
    const { failedPosts, schedulePost, publishedPosts, openPostFromUrl } = get();
    const post = failedPosts.find(p => p.id === id);
    if (!post) {
        toast.error(getToast('postNotFoundToRetry'));
        return;
    }

    // Luồng 1: Lên lịch lại
    if (rescheduleDate && rescheduleTime) {
        // Biến bài đăng thất bại thành một bài đăng "ảo" để lên lịch
        const tempPostId = Date.now();
        set(state => ({
            openPosts: [...state.openPosts, { id: tempPostId, type: post.platform }],
            postContents: { ...state.postContents, [tempPostId]: post.content }
        }));
        
        const dateObj = new Date(rescheduleDate);
        // Gọi hàm schedulePost đã có sẵn toast
        schedulePost(tempPostId, dateObj, rescheduleTime);

        // Xóa khỏi danh sách thất bại sau khi đã xử lý
        set(state => ({
            failedPosts: state.failedPosts.filter(p => p.id !== id)
        }));
        saveToLocalStorage('failedPosts', get().failedPosts);
        return;
    }

    const getFailureReason = (post: FailedPost) => {
    const platform = (post.platform || '').toLowerCase()
    const contentLength = (post.content || '').length
    const characterLimits: Record<string, number> = {
      twitter: 280,
      facebook: 2200,
      instagram: 2200,
      linkedin: 3000,
      threads: 500,
      tiktok: 2200,
      bluesky: 300,
      youtube: 5000,
      pinterest: 500
    }
    const limit = characterLimits[platform] ?? 2200
    const err = (post.error || '').toLowerCase()

    if (contentLength > limit || err.includes('character') || err.includes('limit')) {
      return {
        type: 'character_limit',
        message: `Vượt giới hạn ký tự. Vui lòng rút gọn còn ${limit} ký tự.`,
        currentLength: contentLength,
        limit
      }
    }
    if (err.includes('network') || err.includes('timeout') || err.includes('connection')) {
      return { type: 'connection', message: 'Kết nối kém. Vui lòng thử lại.', currentLength: contentLength, limit }
    }
    if (err.includes('authentication') || err.includes('auth')) {
      return { type: 'authentication', message: 'Lỗi xác thực. Hãy kiểm tra cài đặt tài khoản.', currentLength: contentLength, limit }
    }
    if (err.includes('policy') || err.includes('violation')) {
      return { type: 'policy', message: 'Nội dung vi phạm chính sách. Vui lòng chỉnh sửa.', currentLength: contentLength, limit }
    }
    return { type: 'other', message: 'Đã xảy ra lỗi không xác định. Vui lòng thử lại.', currentLength: contentLength, limit }
  }
    // Luồng 2: Mở trong trình soạn thảo để sửa lỗi nội dung
    const reason = getFailureReason(post); // Giả sử có một hàm helper để xác định lý do
    if (reason.type === 'character_limit' || reason.type === 'policy') {
        openPostFromUrl(post.platform, post.content);
        set({ activeSection: 'create' });
        toast.info(getToast('failedPostOpened'));
        // Xóa khỏi danh sách thất bại
        set(state => ({
            failedPosts: state.failedPosts.filter(p => p.id !== id)
        }));
        saveToLocalStorage('failedPosts', get().failedPosts);
        return;
    }
    
    // Luồng 3: Thử đăng lại ngay lập tức (cho các lỗi kết nối)
    const loadingToastId = toast.loading(getToast('retrying'));
    
    // Giả lập một request API
    setTimeout(() => {
        const isSuccess = Math.random() > 0.3; // 70% tỷ lệ thành công để test
        
        if (isSuccess) {
            const newPublishedPost: PublishedPost = {
                id: Date.now(),
                platform: post.platform,
                content: post.content,
                time: new Date().toISOString(),
                status: 'published',
                url: post.url || `https://${post.platform.toLowerCase()}.com/post/${Date.now()}`,
            };

            set(state => ({
                publishedPosts: [...state.publishedPosts, newPublishedPost],
                failedPosts: state.failedPosts.filter(p => p.id !== id) // Xóa khỏi danh sách thất bại
            }));
            saveToLocalStorage('publishedPosts', get().publishedPosts);
            saveToLocalStorage('failedPosts', get().failedPosts);

            toast.success(getToast('retrySuccess'), { id: loadingToastId });
        } else {
            // Nếu vẫn thất bại, chỉ cần cập nhật toast
            toast.error(getToast('retryFailed'), { id: loadingToastId });
            // Bài viết vẫn nằm trong danh sách failed, không cần làm gì thêm
        }
    }, 1500); // Giả lập độ trễ mạng 1.5 giây
},
  
  handleDeletePost: (id) => {
    let postFound = false;
    set(state => {
        const initialPublishedCount = state.publishedPosts.length;
        const initialFailedCount = state.failedPosts.length;

        const updatedPublished = state.publishedPosts.filter(p => p.id !== id);
        const updatedFailed = state.failedPosts.filter(p => p.id !== id);

        if (updatedPublished.length < initialPublishedCount || updatedFailed.length < initialFailedCount) {
            postFound = true;
        }

        saveToLocalStorage('publishedPosts', updatedPublished);
        saveToLocalStorage('failedPosts', updatedFailed);
        return { publishedPosts: updatedPublished, failedPosts: updatedFailed };
    });

    // Hiển thị thông báo sau khi state đã cập nhật
    if (postFound) {
        toast.success(getToast('postDeletedSuccess'));
    } else {
        toast.error(getToast('postNotFoundToDelete'));
    }
},
  
  //Hàm quản lý video
  handleVideoUpload: (file, options) => {
        
        const newProject: VideoProject = {
            id: `vid-${Date.now()}`,
            title: file.name,
            thumbnail: '',
            duration: '0:00',
            createdAt: new Date().toISOString(),
            status: 'processing',
            options: options // Gán trực tiếp object options vào đây
        };

        set(state => {
            const updatedProjects = [...state.videoProjects, newProject];
            const projectsToSave = updatedProjects.map(({ originalFile, ...rest }) => rest);
        saveToLocalStorage('videoProjects', projectsToSave);
        return { videoProjects: updatedProjects };
    });

    toast.info(getToast('videoProcessingStarted', { title: file.name }));

    // Giả lập quá trình xử lý video...
    setTimeout(() => {
        set(state => {
            const updatedProjects = state.videoProjects.map(p => 
                p.id === newProject.id ? { ...p, status: 'completed' as const, duration: '0:32' } : p
            );
            const projectsToSave = updatedProjects.map(({ originalFile, ...rest }) => rest);
            saveToLocalStorage('videoProjects', projectsToSave);
            return { videoProjects: updatedProjects };
        });
        toast.success(getToast('videoProcessingCompleted', { title: newProject.title }));
    }, 7000); 
},

 handleVideoEdit: (projectId) => {
        const project = get().videoProjects.find(p => p.id === projectId);
        if (project) {
            // Trong tương lai, đây là nơi sẽ điều hướng người dùng đến một
            // trang chỉnh sửa video chuyên dụng.
            console.log("Mở trình chỉnh sửa cho dự án:", project);
            toast.info(getToast('videoEditorOpened', { title: project.title }));
            // Ví dụ: router.push(`/editor/video/${projectId}`);
        } else {
            toast.error(getToast('videoProjectNotFound'));
        }
    },
  
  handleVideoDelete: (projectId) => {
        const projectToDelete = get().videoProjects.find(p => p.id === projectId);
        if (!projectToDelete) {
            toast.error(getToast('videoProjectNotFoundToDelete'));
            return;
        }

        // Hiển thị modal xác nhận (sử dụng toast.promise)
        const promise = new Promise<void>((resolve, reject) => {
            // Đây là nơi bạn có thể hiển thị một modal xác nhận tùy chỉnh
            // nếu muốn. Với `sonner`, chúng ta có thể dùng action buttons.
            // Tạm thời, chúng ta sẽ xóa trực tiếp và thông báo.
            
            set(state => {
                const updatedProjects = state.videoProjects.filter(p => p.id !== projectId);
                saveToLocalStorage('videoProjects', updatedProjects);
                return { videoProjects: updatedProjects };
            });
            resolve();
        });

        toast.promise(promise, {
            loading: getToast('deletingProject'),
            success: getToast('projectDeleted', { title: projectToDelete.title }),
            error: getToast('projectDeleteFailed'),
        });
    },

// Hàm thêm sự kiện vào lịch
  handleEventAdd: (year, month, day, platform, time = '') => {
      const key = `${year}-${month}-${day}`;
      const eventId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newEvent: CalendarEvent = {
          id: eventId,
          platform,
          time: time,
          status: 'Trống',
          noteType: 'yellow'
      };
      set(state => {
          // const updatedEvents = { ...state.calendarEvents };
          // updatedEvents[key] = [...(updatedEvents[key] || []), newEvent];
          const updatedDayEvents = [...(state.calendarEvents[key] || []), newEvent];

          const updatedEvents = {
            ...state.calendarEvents, [key]: updatedDayEvents
          };
          
          saveToLocalStorage('calendarEvents', updatedEvents);
          return { calendarEvents: updatedEvents };
      });
  },

  handleEventDelete: (year, month, day, event) => {
    set(state => {
            const key = `${year}-${month}-${day}`;
            if (!state.calendarEvents[key]) {
                return {}; // Không có gì để xóa
            }
            
            // Tạo bản sao mới của mảng sự kiện cho ngày đó, loại bỏ sự kiện cần xóa
            const updatedDayEvents = state.calendarEvents[key].filter(ev => ev.id !== event.id);

            const updatedEvents = { ...state.calendarEvents };

            if (updatedDayEvents.length > 0) {
                updatedEvents[key] = updatedDayEvents;
            } else {
                // Nếu ngày đó không còn sự kiện nào, xóa luôn key đó
                delete updatedEvents[key];
            }
            
            saveToLocalStorage('calendarEvents', updatedEvents);
            return { calendarEvents: updatedEvents };
        });
  },

  handleEventUpdate: (oldYear, oldMonth, oldDay, oldEvent, newYear, newMonth, newDay, newTime) => {
      set(state => {
            const oldKey = `${oldYear}-${oldMonth}-${oldDay}`;
            const newKey = `${newYear}-${newMonth}-${newDay}`;

            const updatedEvents = { ...state.calendarEvents };

            // 1. Xóa khỏi ngày cũ (bất biến)
            if (updatedEvents[oldKey]) {
                const newOldDayEvents = updatedEvents[oldKey].filter(ev => ev.id !== oldEvent.id);
                if (newOldDayEvents.length > 0) {
                    updatedEvents[oldKey] = newOldDayEvents;
                } else {
                    delete updatedEvents[oldKey];
                }
            }

            // 2. Thêm vào ngày mới (bất biến)
            const updatedEvent = { ...oldEvent, time: newTime === undefined ? oldEvent.time : newTime };
            const newNewDayEvents = [...(updatedEvents[newKey] || []), updatedEvent];
            newNewDayEvents.sort((a, b) => (a.time || '').localeCompare(b.time || ''));
            updatedEvents[newKey] = newNewDayEvents;

            saveToLocalStorage('calendarEvents', updatedEvents);
            return { calendarEvents: updatedEvents };
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
    // Lấy các state và action cần thiết từ store
    const { sourceToGenerate, handlePostCreate, handlePostContentChange } = get();
    if (!sourceToGenerate) return;

    // Cập nhật UI để báo cho người dùng biết quá trình bắt đầu
    set({ isTyping: true, isCreateFromSourceModalOpen: false });
    const chatMessageContent = `Đang tạo ${selectedPlatforms.reduce((acc, p) => acc + p.count, 0)} bài viết từ nguồn ${sourceToGenerate.type}...`;
    set(state => ({
        chatMessages: [...state.chatMessages, { role: 'user', content: chatMessageContent }]
    }));

    // 1. Xây dựng phần chỉ dẫn bằng text cho AI
    const instructions = `Dựa trên nội dung của file/video/văn bản được cung cấp, hãy tạo các bài đăng theo yêu cầu sau:\n${selectedPlatforms.map(p => `- Tạo ${p.count} bài đăng cho nền tảng ${p.platform}.`).join('\n')}\n\nHãy sáng tạo, đừng chỉ tóm tắt. Phân tích sâu nội dung để đưa ra các góc nhìn thú vị.\n\nĐịnh dạng phản hồi của bạn BẮT BUỘC là một mảng JSON như sau:\n\`\`\`json\n[\n  {\n    "action": "create_post",\n    "platform": "Tên nền tảng",\n    "content": "Nội dung bài đăng đã tạo.",\n    "summary_for_chat": "Tóm tắt ngắn gọn để hiển thị trong chatbox."\n  }\n]\n\`\`\``;

    // 2. Chuẩn bị 'promptParts' - Trái tim của logic từ file backup
    let promptParts: any[];
    const sourceType = sourceToGenerate.type;
    const sourceValue = sourceToGenerate.value;

    try {
        // Bắt đầu xây dựng prompt dựa trên loại nguồn
        if (sourceType === 'pdf') {
            promptParts = [
                instructions,
                { fileData: { mimeType: 'application/pdf', fileUri: sourceValue } }
            ];
        } else if (sourceType === 'youtube') {
            // Gửi thẳng URL cho Gemini xử lý
            promptParts = [
                instructions,
                { fileData: { mimeType: 'video/mp4', fileUri: sourceValue } }
            ];
        } else if (sourceType === 'tiktok') {
            // Tải video về, chuyển sang base64 và gửi dưới dạng inlineData
            set(state => ({
                chatMessages: [...state.chatMessages, { role: 'assistant', content: 'Đang xử lý video TikTok...' }]
            }));
            
            const response = await fetch('/api/tiktok/download', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: sourceValue })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.details || data.error || 'Không thể tải video TikTok');
            
            promptParts = [
                instructions,
                { inlineData: { data: data.base64, mimeType: data.mimeType || 'video/mp4' } }
            ];
            set(state => ({ chatMessages: state.chatMessages.slice(0, -1) })); // Xóa thông báo đang xử lý
        }
        else {
            // Mặc định cho 'text', 'article', và các loại URL khác mà Gemini có thể tự hiểu
            const simplePrompt = `Dựa trên nguồn sau đây: "${sourceValue}", ${instructions}`;
            promptParts = [simplePrompt];
        }
        
        // 3. Gửi 'promptParts' đến API
        const response = await fetch('/api/generate-from-source', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ promptParts }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Lỗi API: ${response.statusText}`);
        }

        const data = await response.json();
        const geminiResponseText = data.response;

        // 4. Xử lý kết quả (Logic này đã tốt và giữ nguyên)
        const jsonMatch = geminiResponseText.match(/```json\n([\s\S]*?)\n```/);
        if (!jsonMatch || !jsonMatch[1]) {
            throw new Error("Phản hồi của AI không chứa khối JSON hợp lệ.");
        }
        const parsedResponses = JSON.parse(jsonMatch[1]);
        if (!Array.isArray(parsedResponses)) { throw new Error("Dữ liệu JSON trả về không phải mảng."); }

        let overallSummary = `Đã tạo thành công các bài viết từ nguồn:\n`;
        for (const postData of parsedResponses) {
            if (postData.action === "create_post" && postData.platform && postData.content) {
                const newPostId = handlePostCreate(postData.platform);
                if (newPostId) {
                    handlePostContentChange(newPostId, postData.content);
                }
                overallSummary += `- ${postData.summary_for_chat || `Một bài đăng cho ${postData.platform}`}\n`;
            }
        }
        set(state => ({ chatMessages: [...state.chatMessages, { role: 'assistant', content: overallSummary.trim() }] }));

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
    if (!post) {
        toast.error(getToast('postNotFound'));
        return;
    }

    const content = postContents[postId] || "";
    if (!content.trim()) {
        toast.warning(getToast('cannotScheduleEmpty'));
        return;
    }

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

    // Hiển thị thông báo thành công
    const formattedDate = date.toLocaleDateString('vi-VN');
    toast.success(getToast('postScheduledSuccess', { platform: post.type, time, date: formattedDate }));

    // Sau khi lên lịch, xóa tab đang mở
    handlePostDelete(postId);
},

setIsImageGenModalOpen: (isOpen) => set({ isImageGenModalOpen: isOpen }),

generateImage: async (prompt, count, size, aspectRatio) => {
    const { selectedPostId } = get();
    if (!prompt.trim() || !selectedPostId) return;

    set({ isGeneratingMedia: true, isImageGenModalOpen: false });
    
    // 1. Hiển thị toast loading ngay lập tức
    const loadingToastId = toast.loading(getToast('sendingImageRequest', { count }));

    try {
        const response = await fetch('/api/generate-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, n: count, size, aspectRatio }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.details || data.error || `Yêu cầu thất bại với mã lỗi ${response.status}`);
        }
        if (!data.images || data.images.length === 0) {
            throw new Error("API đã xử lý thành công nhưng không trả về hình ảnh nào.");
        }

        const newMediaFiles: MediaFile[] = data.images.map((image: { base64: string; mimeType: string }, index: number) => {
            // ... (logic chuyển đổi base64 giữ nguyên)
            try {
                const byteCharacters = atob(image.base64);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) { byteNumbers[i] = byteCharacters.charCodeAt(i); }
                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], { type: image.mimeType });
                const file = new File([blob], `gemini-image-${Date.now()}-${index}.png`, { type: image.mimeType });
                const preview = URL.createObjectURL(blob);
                return { id: `gemini-img-${Date.now()}-${index}`, type: 'image' as const, preview, file };
            } catch (e) {
                console.error("Lỗi khi xử lý dữ liệu base64 cho một ảnh:", e);
                return null;
            }
        }).filter((file: MediaFile | null): file is MediaFile => file !== null);

        if (newMediaFiles.length > 0) {
            set(state => ({
                uploadedMedia: [...state.uploadedMedia, ...newMediaFiles]
            }));
            // 2. Cập nhật toast thành công
            toast.success(getToast('imageGenerationSuccess', { count: newMediaFiles.length }), { id: loadingToastId });
        } else {
            throw new Error(getToast('cannotProcessImageData'));
        }

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Đã có lỗi không xác định xảy ra.";
        console.error("Lỗi trong quá trình tạo ảnh (createPageStore):", error);
        // 3. Cập nhật toast thành thất bại
        toast.error(getToast('imageGenerationFailed', { error: errorMessage }), { id: loadingToastId });
    } finally {
        set({ isGeneratingMedia: false });
    }
},

setIsVideoGenModalOpen: (isOpen) => set({ isVideoGenModalOpen: isOpen }),

generateVideo: async (prompt, negativePrompt, aspectRatio, resolution) => {
  //Hiện tại lỗi ở Gemini API, tạm thời chưa test được chức năng này
    const { selectedPostId } = get();
    if (!prompt.trim() || !selectedPostId) return;

    set({ isGeneratingMedia: true, isVideoGenModalOpen: false });
    
    // 1. Hiển thị toast loading ban đầu
    const loadingToastId = toast.loading(getToast('sendingVideoRequest'));

    try {
        const response = await fetch('/api/generate-video', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, negativePrompt, aspectRatio, resolution }),
        });
        
        // --- Xử lý Blob Response ---
        if (!response.ok) {
            // Cố gắng đọc lỗi từ JSON nếu có
            const errorData = await response.json().catch(() => ({ error: `Yêu cầu thất bại với mã lỗi ${response.status}` }));
            throw new Error(errorData.details || errorData.error);
        }

        // 2. Cập nhật toast khi video đang được xử lý
        toast.loading(getToast('videoGenerating'), { id: loadingToastId });

        const videoBlob = await response.blob();
        if (videoBlob.size === 0) {
            throw new Error(getToast('emptyVideoResponse'));
        }

        const file = new File([videoBlob], `veo3-video-${Date.now()}.mp4`, { type: 'video/mp4' });
        const preview = URL.createObjectURL(videoBlob);
        
        const newMediaFile: MediaFile = {
            id: `veo3-video-${Date.now()}`,
            type: 'video',
            preview,
            file
        };

        set(state => ({
            uploadedMedia: [...state.uploadedMedia, newMediaFile]
        }));

        // 3. Cập nhật toast thành công
        toast.success(getToast('videoGenerationSuccess'), { id: loadingToastId, duration: 5000 });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Lỗi không xác định";
        console.error("Lỗi khi tạo video:", error);
        // 4. Cập nhật toast thành thất bại
        toast.error(getToast('videoGenerationFailed', { error: errorMessage }), { id: loadingToastId });
    } finally {
        set({ isGeneratingMedia: false });
    }
},

openLightbox: (url, type) => set({ lightboxMedia: { url, type } }),

closeLightbox: () => set({ lightboxMedia: { url: null, type: null } }),
}));

export const getCreatePageStore = useCreatePageStore.getState;
