import React from 'react'
import App3DBox from './3D-Box/3DApp'
import './3D-Box/index.css'

import Footer from '../Footer/Footer'

export default function Design() {
  return (
    
    <div className="design-page-container w-full h-screen">
      <App3DBox />
      <Footer/>
    </div>
  )
}