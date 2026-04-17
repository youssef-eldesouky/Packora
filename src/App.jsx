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
    <div className="flex flex-col h-screen bg-[#0f1117] overflow-hidden">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <LeftSidebar />
        <Canvas3D />
        <RightSidebar />
      </div>
      <BottomBar />
    </div>
  )
}
