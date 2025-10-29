"use client";

import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { SparklesIcon, ChevronDownIcon, SendIcon } from 'lucide-react';

import { useCreatePageStore } from '@/store/createPageStore';
import { useShallow } from 'zustand/react/shallow';

// Logic gọi API Gemini có thể được trừu tượng hóa ra service (Giai đoạn 3)
// Tạm thời để logic submit ở đây

export default function AIChatbox() {
    // State cục bộ cho UI của chatbox
    const [chatInput, setChatInput] = useState("");
    const [showModelMenu, setShowModelMenu] = useState<boolean>(false);
    const [selectedChatModel, setSelectedChatModel] = useState<string>("Gemini Pro");
    const modelMenuRef = useRef<HTMLDivElement>(null);
    const chatScrollRef = useRef<HTMLDivElement>(null);

    // Lấy state và action liên quan đến chat từ store
    const { chatMessages, isTyping, submitChat } = useCreatePageStore(
      useShallow(state => ({
        chatMessages: state.chatMessages, 
        isTyping: state.isTyping,         
        submitChat: state.submitChat,       
    })));
    
    // Auto-scroll chat to bottom
    useEffect(() => {
      if (chatScrollRef.current) {
        chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
      }
    }, [chatMessages, isTyping]);
    
    const handleSend = () => {
      if (chatInput.trim() && !isTyping){
        submitChat(chatInput);
        setChatInput("");
      };
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const modelOptions = [
    "Gemini Pro", // Mặc định là Gemini Pro
    "ChatGPT",
    "Claude Sonnet 4",
    "gpt-4.1",
    "o4-mini",
    "o3",
    "gpt-4o"
    ];

    //Đóng dropdown khi click ra ngoài
    useEffect(() => {
        if (!showModelMenu) return;
        const handleClickOutside = (e: MouseEvent) => {
            if (modelMenuRef.current && !modelMenuRef.current.contains(e.target as Node)) {
                setShowModelMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showModelMenu]);

    return (
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
                  onKeyDown={handleKeyDown}
                />
                <button onClick={handleSend} className='absolute right-4 bottom-4 text-white disabled:text-gray-500'>
                  <SendIcon className='w-5 h-5' />
                </button>
              </div>
            </div>
          </Card>
        </div>
    );
}