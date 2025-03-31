import React from 'react';
import Head from 'next/head';
import Navbar from './Navbar';
import Footer from './Footer';
import { useSession } from 'next-auth/react';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  withSidebar?: boolean;
}

export default function Layout({
  children,
  title = 'Безбар\'єрний доступ України',
  description = 'Платформа для забезпечення безбар\'єрного доступу в Україні',
  withSidebar = false,
}: LayoutProps) {
  const { data: session } = useSession();
  const isAuthenticated = !!session;

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-grow">
          {withSidebar && isAuthenticated ? (
            <div className="flex">
              <Sidebar />
              <div className="flex-1 p-6">{children}</div>
            </div>
          ) : (
            <div className="container mx-auto px-4 py-8">{children}</div>
          )}
        </main>
        
        <Footer />
      </div>
    </>
  );
}
