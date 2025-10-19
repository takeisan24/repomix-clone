"use client"

import CreateLayout from "@/components/create/layout/CreateLayout"
import MainContent from "@/components/create/layout/MainContent"
import SectionsManager from "@/components/create/sections/SectionsManager"
import { useCreatePage } from "@/hooks/useCreatePage"
import { useEffect } from "react"

/**
 * Refactored Create Page Component
 * 
 * This is the main create page that has been refactored from a single 5000+ line file
 * into multiple smaller, manageable components:
 * 
 * - CreateLayout: Main layout wrapper with sidebar
 * - MainContent: Content area wrapper
 * - SectionsManager: Manages different sections (create, calendar, drafts, etc.)
 * - Individual section components for each feature
 * - Custom hooks for state management
 * - Utility functions for common operations
 * 
 * The refactoring follows these principles:
 * 1. Separation of concerns - each component has a single responsibility
 * 2. Reusability - components can be reused across different pages
 * 3. Maintainability - smaller files are easier to understand and modify
 * 4. Testability - individual components can be tested in isolation
 */
export default function SectionPage({ params }: { params: { section: string } }) {
  const {
    // State
    activeSection,
    setActiveSection,
    isSidebarOpen,
    setIsSidebarOpen,
    openPosts,
    selectedPostId,
    postContents,
    uploadedMedia,
    currentMediaIndex,
    calendarEvents,
    draftPosts,
    publishedPosts,
    failedPosts,
    videoProjects,
    apiStats,
    apiKeys,
    
    // Event handlers
    handlePostSelect,
    handlePostCreate,
    handlePostDelete,
    handlePostContentChange,
    handleClonePost,
    handleSaveDraft,
    handleMediaUpload,
    handleMediaRemove,
    handlePublish,
    handleEditDraft,
    handleDeleteDraft,
    handlePublishDraft,
    handleViewPost,
    handleRetryPost,
    handleDeletePost,
    handleVideoUpload,
    handleVideoEdit,
    handleVideoDelete,
    handleEventAdd,
    handleEventUpdate,
    handleEventDelete,
    handleClearCalendarEvents,
    handleRegenerateKey,
    handleCreateKey,
  } = useCreatePage()

  useEffect(() => {
    // Handle 'create' as the default or when the path is just /create
    const sectionToSet = params.section === "create" ? "create-post" : params.section;
    if (sectionToSet) {
      setActiveSection(sectionToSet);
    }
  }, [params.section, setActiveSection]);

  return (
    <CreateLayout
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      isSidebarOpen={isSidebarOpen}
      onSidebarToggle={setIsSidebarOpen}
    >
      <MainContent activeSection={activeSection}>
        <SectionsManager
          activeSection={activeSection}
          // Data props
          posts={openPosts}
          selectedPostId={selectedPostId}
          postContents={postContents}
          draftPosts={draftPosts}
          publishedPosts={publishedPosts}
          failedPosts={failedPosts}
          videoProjects={videoProjects}
          calendarEvents={calendarEvents}
          apiStats={apiStats}
          apiKeys={apiKeys}
          // Event handlers
          onPostSelect={handlePostSelect}
          onPostCreate={handlePostCreate}
          onPostDelete={handlePostDelete}
          onPostContentChange={handlePostContentChange}
          onClonePost={handleClonePost}
          onSaveDraft={handleSaveDraft}
          onMediaUpload={handleMediaUpload}
          onMediaRemove={handleMediaRemove}
          onPublish={handlePublish}
          onEditDraft={handleEditDraft}
          onDeleteDraft={handleDeleteDraft}
          onPublishDraft={handlePublishDraft}
          onViewPost={handleViewPost}
          onRetryPost={handleRetryPost}
          onDeletePost={handleDeletePost}
          onVideoUpload={handleVideoUpload}
          onVideoEdit={handleVideoEdit}
          onVideoDelete={handleVideoDelete}
          onEventAdd={handleEventAdd}
          onEventUpdate={handleEventUpdate}
          onEventDelete={handleEventDelete}
          onClearAll={handleClearCalendarEvents}
          onRegenerateKey={handleRegenerateKey}
          onCreateKey={handleCreateKey}
        />
      </MainContent>
    </CreateLayout>
  )
}
