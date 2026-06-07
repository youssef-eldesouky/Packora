import React from 'react';
import { Outlet } from 'react-router-dom';
import PackoraChatbot from '../Chatbot/PackoraChatbot';
import Footer from '../Footer/Footer';
import './GlobalLayout.css';

export default function GlobalLayout() {
  return (
    <div className="global-layout">
      <main className="content">
        <Outlet />
        <PackoraChatbot />
      </main>
      <Footer />
    </div>
  );
}
