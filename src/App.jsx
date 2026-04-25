import React, { useEffect } from 'react'
import Navbar from './components/Navbar'
import LeftSidebar from './components/LeftSidebar'
import Canvas3D from './components/Canvas3D'
import RightSidebar from './components/RightSidebar'
import BottomBar from './components/BottomBar'
import { useStore } from './store/useStore'

export default function App() {
  const calculatePrice = useStore(s => s.calculatePrice)
  const saveHistory = useStore(s => s.saveHistory)

  useEffect(() => {
    calculatePrice()
    saveHistory()
  }, [])

  return (
    <div className="app-shell h-screen overflow-hidden bg-background text-foreground">
      <div className="relative z-10 flex h-full flex-col overflow-hidden px-4 pb-4 pt-3 md:px-5">
        <Navbar />
        <div className="flex flex-1 overflow-hidden pt-4">
          <div className="hidden h-full min-h-0 xl:block xl:pr-4">
            <LeftSidebar />
          </div>
          <div className="mx-0 flex min-w-0 flex-1 flex-col">
            <Canvas3D />
          </div>
          <div className="hidden h-full min-h-0 lg:block lg:pl-4">
            <RightSidebar />
          </div>
        </div>
        <div className="pt-4">
          <BottomBar />
        </div>
      </div>
    </div>
  )
}
