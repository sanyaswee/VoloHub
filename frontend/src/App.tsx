import './App.css'
import { useState } from 'react'
import { Sidebar, Header, CreateProjectModal, LoginModal } from './components'
import { ProjectFeed, Discover, MyProjects, Settings } from './views'
import type { Project } from './types'

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentView, setCurrentView] = useState('home')
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

  const handleNavigate = (view: string) => {
    setCurrentView(view)
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

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <ProjectFeed key={refreshKey} onEditProject={handleEditProject} onLoginRequired={openLoginModal} />
      case 'discover':
        return <Discover />
      case 'my-projects':
        return <MyProjects />
      case 'settings':
        return <Settings />
      default:
        return <ProjectFeed key={refreshKey} onEditProject={handleEditProject} onLoginRequired={openLoginModal} />
    }
  }

  return (
    <div className="app-container">
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={closeSidebar} 
        currentView={currentView}
        onNavigate={handleNavigate}
      />
      
      <main className="main-content">
        <Header 
          onMenuToggle={toggleSidebar} 
          onNewProjectClick={openModal}
          onLoginClick={openLoginModal}
        />
        <div className="content-body">
          {renderView()}
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
