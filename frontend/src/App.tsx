import './App.css'
import { useState } from 'react'
import { Sidebar, Header, CreateProjectModal } from './components'
import { ProjectFeed, Discover, MyProjects, Settings } from './views'

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentView, setCurrentView] = useState('home')
  const [modalOpen, setModalOpen] = useState(false)
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
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
  }

  const handleProjectCreated = () => {
    // Refresh the project list by incrementing the key
    setRefreshKey(prev => prev + 1)
  }

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <ProjectFeed key={refreshKey} />
      case 'discover':
        return <Discover />
      case 'my-projects':
        return <MyProjects />
      case 'settings':
        return <Settings />
      default:
        return <ProjectFeed key={refreshKey} />
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
        <Header onMenuToggle={toggleSidebar} onNewProjectClick={openModal} />
        <div className="content-body">
          {renderView()}
        </div>
      </main>

      <CreateProjectModal 
        isOpen={modalOpen}
        onClose={closeModal}
        onProjectCreated={handleProjectCreated}
      />
    </div>
  )
}

export default App
