import './App.css'
import { useState } from 'react'
import { Sidebar, Header } from './components'
import { ProjectFeed, Discover, MyProjects, Settings } from './views'

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentView, setCurrentView] = useState('home')

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const closeSidebar = () => {
    setSidebarOpen(false)
  }

  const handleNavigate = (view: string) => {
    setCurrentView(view)
  }

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <ProjectFeed />
      case 'discover':
        return <Discover />
      case 'my-projects':
        return <MyProjects />
      case 'settings':
        return <Settings />
      default:
        return <ProjectFeed />
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
        <Header onMenuToggle={toggleSidebar} />
        <div className="content-body">
          {renderView()}
        </div>
      </main>
    </div>
  )
}

export default App
