"use client"

import CreateLayout from "@/components/features/create/layout/CreateLayout"
import MainContent from "@/components/features/create/layout/MainContent"
import SectionsManager from "@/components/features/create/SectionsManager"
import PageLoader from "@/components/shared/page-loader"

// import { useCreatePage } from "@/hooks/useCreatePage"
import { useEffect, useState } from "react"
import { useCreatePageStore } from "@/store/createPageStore"
import { useShallow } from 'zustand/react/shallow'

export default function SectionPage({ params }: { params: { section: string } }) {
  const [isLoading, setIsLoading] = useState(true)
  
  // Dùng useShallow để component chỉ re-render khi một trong các giá trị này thay đổi,
  // thay vì re-render mỗi khi bất kỳ giá trị nào khác trong store thay đổi.
  const { setActiveSection, isSidebarOpen, setIsSidebarOpen } = useCreatePageStore(
    useShallow((state) => ({
      setActiveSection: state.setActiveSection,
      isSidebarOpen: state.isSidebarOpen,
      setIsSidebarOpen: state.setIsSidebarOpen,
    }))
  );

  // *** THAY ĐỔI 1: Lấy section từ URL ngay lập tức ***
  const sectionFromUrl = params.section;

  // useEffect vẫn cần thiết để cập nhật state trong store
  useEffect(() => {
    setIsLoading(true)
    
    // Đóng sidebar khi chuyển trang để tránh sidebar mở trong quá trình loading
    setIsSidebarOpen(false);
    
    // Chỉ cập nhật nếu state trong store chưa khớp
    const currentState = useCreatePageStore.getState().activeSection;
    if (sectionFromUrl && sectionFromUrl !== currentState) {
      setActiveSection(sectionFromUrl);
    }
    
    // Minimum loading time để user thấy animation
    const timer = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [sectionFromUrl, setActiveSection, setIsSidebarOpen]);

  // Show loading screen
  if (isLoading) {
    return <PageLoader />
  }

  return (
    <CreateLayout
      activeSection={sectionFromUrl}
      onSectionChange={setActiveSection}
      isSidebarOpen={isSidebarOpen}
      onSidebarToggle={setIsSidebarOpen}
    >
      <MainContent activeSection={sectionFromUrl}>
        <SectionsManager />
      </MainContent>
    </CreateLayout>
  )
}
