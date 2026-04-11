/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import { LanguageProvider } from './components/LanguageProvider';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import { Toaster } from '@/components/ui/sonner';

export default function App() {
  return (
    // @ts-ignore - next-themes ThemeProvider types might mismatch in React 19
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <LanguageProvider>
        <Router>
          <div className="min-h-screen bg-background text-foreground font-sans antialiased">
            <Navbar />
            <main>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<Dashboard />} />
              </Routes>
            </main>
            <Toaster position="top-right" />
          </div>
        </Router>
      </LanguageProvider>
    </ThemeProvider>
  );
}

