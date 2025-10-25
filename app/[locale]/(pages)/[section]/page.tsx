"use client"

import CreateLayout from "@/components/create/layout/CreateLayout"
import MainContent from "@/components/create/layout/MainContent"
import SectionsManager from "@/components/create/sections/SectionsManager"

// import { useCreatePage } from "@/hooks/useCreatePage"
import { useEffect } from "react"
import { useCreatePageStore } from "@/store/createPageStore"
import { useShallow } from 'zustand/react/shallow'

export default function SectionPage({ params }: { params: { section: string } }) {
  // Dùng useShallow để component chỉ re-render khi một trong các giá trị này thay đổi,
  // thay vì re-render mỗi khi bất kỳ giá trị nào khác trong store thay đổi.
  const {activeSection, setActiveSection, isSidebarOpen,
    setIsSidebarOpen} = useCreatePageStore(
    useShallow((state) => ({
      activeSection: state.activeSection,
      setActiveSection: state.setActiveSection,
      isSidebarOpen: state.isSidebarOpen,
      setIsSidebarOpen: state.setIsSidebarOpen,
    }))
  )

  useEffect(() => {
    // Handle 'create' as the default or when the path is just /create
    const sectionToSet = params.section === "create" ? "create-post" : params.section;
    if (sectionToSet) {
      setActiveSection(sectionToSet);
    }
  }, [params.section]);

  return (
    <CreateLayout
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      isSidebarOpen={isSidebarOpen}
      onSidebarToggle={setIsSidebarOpen}
    >
      <MainContent activeSection={activeSection}>
        <SectionsManager />
      </MainContent>
    </CreateLayout>
  )
}
