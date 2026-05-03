import React, { useEffect } from 'react'
import Navbar from './Navbar'
import LeftSidebar from './LeftSidebar'
import Canvas3D from './Canvas3D'
import RightSidebar from './RightSidebar'
import BottomBar from './BottomBar'
import { useStore } from '../../../store/useStore'

export default function App() {
  const calculatePrice = useStore(s => s.calculatePrice)
  const saveHistory = useStore(s => s.saveHistory)

  useEffect(() => {
    calculatePrice()
    saveHistory()
  }, [])

  return (
    <div className="app-shell h-screen overflow-hidden bg-[#F4F5F7] text-[#1A1A1A]">
      <div className="relative z-10 flex h-full flex-col overflow-hidden p-6">
        <Navbar />
        <div className="flex flex-1 overflow-hidden pt-6 gap-6">
          <div className="hidden h-full min-h-0 xl:block">
            <LeftSidebar />
          </div>
          <div className="mx-0 flex min-w-0 flex-1 flex-col relative rounded-[20px] overflow-hidden shadow-sm">
            <Canvas3D />
          </div>
          <div className="hidden h-full min-h-0 lg:block">
            <RightSidebar />
          </div>
        </div>
        <div className="pt-6">
          <BottomBar />
        </div>
      </div>
    </div>
  )
}
