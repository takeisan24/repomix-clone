"use client";

import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { SparklesIcon, ChevronDownIcon, SendIcon, MessageCircle, Wand2, Lightbulb, Zap } from 'lucide-react';

import { useCreatePageStore } from '@/store/createPageStore';
import { useShallow } from 'zustand/react/shallow';
import { useTranslations } from 'next-intl';

// Logic gọi API Gemini có thể được trừu tượng hóa ra service (Giai đoạn 3)
// Tạm thời để logic submit ở đây

export default function AIChatbox() {
    const t = useTranslations('CreatePage.createSection.chatPanel');
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
        <div className="w-full h-full border-l border-white/10 p-[15px] relative z-0" data-tour="ai-chat">
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
            <div ref={chatScrollRef} className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 opacity-80 p-2">
              {chatMessages.length === 0 ? (
                /* Empty State with Guide */
                <div className="h-full flex items-center justify-center p-4">
                  <div className="max-w-sm space-y-4">
                    {/* Icon */}
                    <div className="flex justify-center">
                      <div className="relative">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-purple-500/20">
                          <MessageCircle className="w-8 h-8 text-purple-400" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center animate-pulse">
                          <SparklesIcon className="w-3 h-3 text-white" />
                        </div>
                      </div>
                    </div>

                    {/* Title */}
                    <div className="text-center space-y-1">
                      <h3 className="text-base font-semibold text-white">
                        {t('emptyState.title')}
                      </h3>
                      <p className="text-xs text-gray-400">
                        {t('emptyState.description')}
                      </p>
                    </div>

                    {/* Example Commands */}
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-gray-300 text-center">
                        {t('emptyState.examplesTitle')}
                      </p>
                      
                      <button
                        onClick={() => setChatInput(t('emptyState.example1'))}
                        className="w-full text-left p-2.5 rounded-lg bg-[#1E1E23] border border-white/5 hover:border-purple-500/30 hover:bg-[#252529] transition-all group"
                      >
                        <div className="flex items-start gap-2">
                          <Wand2 className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-white/90 group-hover:text-white">
                              {t('emptyState.example1')}
                            </p>
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={() => setChatInput(t('emptyState.example2'))}
                        className="w-full text-left p-2.5 rounded-lg bg-[#1E1E23] border border-white/5 hover:border-blue-500/30 hover:bg-[#252529] transition-all group"
                      >
                        <div className="flex items-start gap-2">
                          <Lightbulb className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-white/90 group-hover:text-white">
                              {t('emptyState.example2')}
                            </p>
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={() => setChatInput(t('emptyState.example3'))}
                        className="w-full text-left p-2.5 rounded-lg bg-[#1E1E23] border border-white/5 hover:border-green-500/30 hover:bg-[#252529] transition-all group"
                      >
                        <div className="flex items-start gap-2">
                          <Zap className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-white/90 group-hover:text-white">
                              {t('emptyState.example3')}
                            </p>
                          </div>
                        </div>
                      </button>
                    </div>

                    {/* Hint */}
                    <div className="pt-2 border-t border-white/5">
                      <p className="text-xs text-gray-500 text-center">
                        {t('emptyState.hint')}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                /* Existing Chat Messages */
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
                          <span>{t('aiTyping')}</span>
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
              )}
            </div>

            {/* Chat Input */}
            <div className="border-t border-white/10 p-3 h-auto bg-[#1E1E23]">
              <div className="relative">
                <textarea
                  placeholder={t('aiChatPlaceholder')}
                  className="w-full bg-[#2A2A30] border-2 border-[#3A3A42] rounded-lg outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 resize-none text-white placeholder-gray-500 text-sm p-3 pr-12 min-h-[80px] max-h-[120px] transition-all"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <button 
                  onClick={handleSend} 
                  disabled={!chatInput.trim() || isTyping}
                  className='absolute right-3 bottom-3 text-white bg-gradient-to-br from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed rounded-lg p-2 transition-all hover:scale-105 active:scale-95'
                >
                  <SendIcon className='w-4 h-4' />
                </button>
              </div>
            </div>
          </Card>
        </div>
    );
}