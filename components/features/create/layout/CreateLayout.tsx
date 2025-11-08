"use client"

import { ReactNode } from "react"
import Sidebar from "./Sidebar"

interface CreateLayoutProps {
  children: ReactNode
  activeSection: string
  onSectionChange: (section: string) => void
  isSidebarOpen: boolean
  onSidebarToggle: (isOpen: boolean) => void
}

/**
 * Main layout wrapper for the create page
 * Combines sidebar and main content with consistent styling
 */
export default function CreateLayout({ 
  children, 
  activeSection, 
  onSectionChange, 
  isSidebarOpen, 
  onSidebarToggle,
}: CreateLayoutProps) {
  return (
    <div className="h-screen bg-[#0C0717] text-white">
      <div className="relative flex h-screen">
        {/* Sidebar spacer keeps content fixed; actual sidebar overlays within */}
        <div className="relative flex-none w-[79px] h-full">
          <Sidebar 
            activeSection={activeSection}
            onSectionChange={onSectionChange}
            isSidebarOpen={isSidebarOpen}
            onSidebarToggle={onSidebarToggle}
          />
        </div>
        
        {/* Main content */}
        {children}
      </div>
    </div>
  )
}

