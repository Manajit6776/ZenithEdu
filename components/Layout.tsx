import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-ivory">
      {/* 🧭 Navigation */}
      <nav className="navbar">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="navbar-brand">
              ZenithEdu CMS
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'text-blue' : ''}`}>
                Dashboard
              </Link>
              <Link to="/students" className={`nav-link ${isActive('/students') ? 'text-blue' : ''}`}>
                Students
              </Link>
              <Link to="/courses" className={`nav-link ${isActive('/courses') ? 'text-blue' : ''}`}>
                Courses
              </Link>
              <Link to="/assignments" className={`nav-link ${isActive('/assignments') ? 'text-blue' : ''}`}>
                Assignments
              </Link>
              <Link to="/analytics" className={`nav-link ${isActive('/analytics') ? 'text-blue' : ''}`}>
                Analytics
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-blue-light transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden py-4 space-y-2">
              <Link to="/dashboard" className={`block nav-link ${isActive('/dashboard') ? 'text-blue' : ''}`}>
                Dashboard
              </Link>
              <Link to="/students" className={`block nav-link ${isActive('/students') ? 'text-blue' : ''}`}>
                Students
              </Link>
              <Link to="/courses" className={`block nav-link ${isActive('/courses') ? 'text-blue' : ''}`}>
                Courses
              </Link>
              <Link to="/assignments" className={`block nav-link ${isActive('/assignments') ? 'text-blue' : ''}`}>
                Assignments
              </Link>
              <Link to="/analytics" className={`block nav-link ${isActive('/analytics') ? 'text-blue' : ''}`}>
                Analytics
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* 📱 Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* 🦶 Footer */}
      <footer className="footer">
        <div className="container mx-auto px-4">
          <div className="footer-content">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* About */}
              <div className="space-y-4">
                <h3 className="text-lg font-heading">ZenithEdu CMS</h3>
                <p className="text-sm opacity-80">
                  A comprehensive course management system designed for modern educational institutions.
                </p>
              </div>

              {/* Quick Links */}
              <div className="space-y-4">
                <h4 className="font-heading">Quick Links</h4>
                <ul className="space-y-2 text-sm">
                  <li><Link to="/dashboard" className="hover:text-blue transition-colors">Dashboard</Link></li>
                  <li><Link to="/students" className="hover:text-blue transition-colors">Students</Link></li>
                  <li><Link to="/courses" className="hover:text-blue transition-colors">Courses</Link></li>
                  <li><Link to="/analytics" className="hover:text-blue transition-colors">Analytics</Link></li>
                </ul>
              </div>

              {/* Resources */}
              <div className="space-y-4">
                <h4 className="font-heading">Resources</h4>
                <ul className="space-y-2 text-sm">
                  <li><Link to="/help" className="hover:text-blue transition-colors">Help Center</Link></li>
                  <li><Link to="/docs" className="hover:text-blue transition-colors">Documentation</Link></li>
                  <li><Link to="/support" className="hover:text-blue transition-colors">Support</Link></li>
                  <li><Link to="/api" className="hover:text-blue transition-colors">API</Link></li>
                </ul>
              </div>

              {/* Contact */}
              <div className="space-y-4">
                <h4 className="font-heading">Contact</h4>
                <div className="space-y-2 text-sm">
                  <p className="flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>info@zenithedu.edu</span>
                  </p>
                  <p className="flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span>+1 (555) 123-4567</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="mt-8 pt-8 border-t border-beige-dark text-center text-sm">
              <p>&copy; 2024 ZenithEdu CMS. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
