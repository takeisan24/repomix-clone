"use client"

import CreateLayout from "@/components/features/create/layout/CreateLayout"
import MainContent from "@/components/features/create/layout/MainContent"
import SectionsManager from "@/components/features/create/SectionsManager"

// import { useCreatePage } from "@/hooks/useCreatePage"
import { useEffect } from "react"
import { useCreatePageStore } from "@/store/createPageStore"
import { useShallow } from 'zustand/react/shallow'

export default function SectionPage({ params }: { params: { section: string } }) {
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
    // Chỉ cập nhật nếu state trong store chưa khớp
    const currentState = useCreatePageStore.getState().activeSection;
    if (sectionFromUrl && sectionFromUrl !== currentState) {
      setActiveSection(sectionFromUrl);
    }
  }, [sectionFromUrl, setActiveSection]);

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
