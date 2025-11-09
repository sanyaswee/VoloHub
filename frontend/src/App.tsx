import './App.css'
import { useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { Sidebar, Header, CreateProjectModal, LoginModal } from './components'
import { ProjectFeed, Discover, MyProjects, Settings, ProjectDetail } from './views'
import type { Project } from './types'

function App() {
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const closeSidebar = () => {
    setSidebarOpen(false)
  }

  const openModal = () => {
    setEditingProject(null)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingProject(null)
  }

  const openLoginModal = () => {
    setLoginModalOpen(true)
  }

  const closeLoginModal = () => {
    setLoginModalOpen(false)
  }

  const handleEditProject = (project: Project) => {
    setEditingProject(project)
    setModalOpen(true)
  }

  const handleProjectCreated = () => {
    // Refresh the project list by incrementing the key
    setRefreshKey(prev => prev + 1)
  }

  return (
    <div className="app-container">
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={closeSidebar} 
        currentPath={location.pathname}
      />
      
      <main className="main-content">
        <Header 
          onMenuToggle={toggleSidebar} 
          onNewProjectClick={openModal}
          onLoginClick={openLoginModal}
        />
        <div className="content-body">
          <Routes>
            <Route 
              path="/" 
              element={
                <ProjectFeed 
                  key={refreshKey} 
                  onEditProject={handleEditProject} 
                  onLoginRequired={openLoginModal} 
                />
              } 
            />
            <Route path="/discover" element={<Discover />} />
            <Route 
              path="/my-projects" 
              element={
                <MyProjects 
                  key={refreshKey}
                  onEditProject={handleEditProject}
                  onLoginRequired={openLoginModal}
                />
              } 
            />
            <Route path="/settings" element={<Settings />} />
            <Route 
              path="/projects/:id" 
              element={<ProjectDetail onLoginRequired={openLoginModal} />} 
            />
          </Routes>
        </div>
      </main>

      <CreateProjectModal 
        isOpen={modalOpen}
        onClose={closeModal}
        onProjectCreated={handleProjectCreated}
        editProject={editingProject}
      />

      <LoginModal 
        isOpen={loginModalOpen}
        onClose={closeLoginModal}
      />
    </div>
  )
}

export default App
