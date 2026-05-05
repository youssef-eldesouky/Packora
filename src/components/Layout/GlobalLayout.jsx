import React from 'react';
import { Outlet } from 'react-router-dom';
import PackoraChatbot from '../Chatbot/PackoraChatbot';

export default function GlobalLayout() {
  return (
    <>
      <Outlet />
      <PackoraChatbot />
    </>
  );
}
