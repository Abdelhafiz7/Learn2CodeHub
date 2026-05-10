import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '@/components/layout';
import { Footer } from '@/components/layout';

export const PublicLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
