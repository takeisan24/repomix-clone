"use client"

import { useState } from 'react';
import { PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen } from 'lucide-react';

//Import component UI
import AIChatbox from './chat/AIChatbox';
import SourcePanel from './sources/SourcePanel';
import PostEditor from './editor/PostEditor';
import OnboardingTour from './layout/OnboardingTour';

// Import modal manager
import ModalManager from './modals/ModalManager';

/**
 * Create section component with collapsible three-panel layout:
 * 1. Left panel (241px) - Sources management (collapsible)
 * 2. Main panel (flex-1) - Post creation editor (always visible)
 * 3. Right panel (350px) - AI chatbox (collapsible)
 */
export default function CreateSection() {
  const [isSourcePanelOpen, setIsSourcePanelOpen] = useState(true);
  const [isAIChatOpen, setIsAIChatOpen] = useState(true);

  return (
    <>
      <div className="flex h-full w-full relative">
        {/* Left Panel - Sources */}
        <div
          className={`transition-all duration-300 ease-in-out ${
            isSourcePanelOpen ? 'w-[241px]' : 'w-0'
          } overflow-hidden relative`}
        >
          <SourcePanel />
          {/* Toggle Button inside Source Panel */}
          {isSourcePanelOpen && (
            <button
              onClick={() => setIsSourcePanelOpen(false)}
              className="absolute right-2 top-2 z-10 bg-[#2A2A30] hover:bg-[#3A3A42] text-white p-1.5 rounded-lg shadow-lg border border-white/10 transition-all"
              title="Close Sources Panel"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Toggle Button - Left Panel (when closed) */}
        {!isSourcePanelOpen && (
          <button
            onClick={() => setIsSourcePanelOpen(true)}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-[#E33265] hover:bg-[#c52b57] text-white p-2 rounded-r-lg shadow-lg transition-all"
            title="Open Sources Panel"
          >
            <PanelLeftOpen className="w-5 h-5" />
          </button>
        )}

        {/* Main Panel - Editor (Always visible) */}
        <div className="flex-1 min-w-0">
          <PostEditor />
        </div>

        {/* Toggle Button - Right Panel (when closed) */}
        {!isAIChatOpen && (
          <button
            onClick={() => setIsAIChatOpen(true)}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-[#7C3AED] hover:bg-[#6D28D9] text-white p-2 rounded-l-lg shadow-lg transition-all"
            title="Open AI Chat"
          >
            <PanelRightOpen className="w-5 h-5" />
          </button>
        )}

        {/* Right Panel - AI Chat */}
        <div
          className={`transition-all duration-300 ease-in-out ${
            isAIChatOpen ? 'w-[350px]' : 'w-0'
          } overflow-hidden relative`}
        >
          <AIChatbox />
          {/* Toggle Button inside AI Chat Panel */}
          {isAIChatOpen && (
            <button
              onClick={() => setIsAIChatOpen(false)}
              className="absolute right-2 top-2 z-10 bg-[#2A2A30] hover:bg-[#3A3A42] text-white p-1.5 rounded-lg shadow-lg border border-white/10 transition-all"
              title="Close AI Chat"
            >
              <PanelRightClose className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      
      {/* 
        Gọi ModalManager ở đây.
        Nó sẽ tự xử lý việc hiển thị modal nào cần thiết.
        Điều này tách biệt hoàn toàn logic render modal ra khỏi luồng render chính.
      */}
      <ModalManager />
      
      {/* Onboarding tour for first-time users */}
      <OnboardingTour />
    </>
  )
}   
