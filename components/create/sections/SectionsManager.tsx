"use client"

import SettingsSection from "./Settings_CaiDat"
import CalendarSection from "./Calendar_Lich"
import DraftsSection from "./Drafts_BanNhap"
import PublishedSection from "./Published_BaiDaDang"
import FailedSection from "./Failed_BaiDangThatBai"
import VideosSection from "./Videos"
import ApiDashboardSection from "./ApiDashboard"
import CreateSection from "./Create_TaoBaiViet"
import { useCreatePageStore } from "@/store/createPageStore"



/**
 * Main sections manager component that renders the appropriate section based on activeSection
 * Centralizes all section components and their props
 */
export default function SectionsManager() {
  const  activeSection  = useCreatePageStore((state) => state.activeSection);

  switch (activeSection) {
    case "settings":
      return <SettingsSection />
      
    case "calendar":
      return (
        <CalendarSection />
      )
      
    case "drafts":
      return (
        <DraftsSection />
      )
      
    case "published":
      return (
        <PublishedSection />
      )
      
    case "failed":
      return (
        <FailedSection />
      )
      
    case "videos":
      return (
        <VideosSection />
      )
      
    case "api":
      return (
        <ApiDashboardSection />
      )
      
    case "create":
    default:
      return (
        <CreateSection />
      )
  }
}
