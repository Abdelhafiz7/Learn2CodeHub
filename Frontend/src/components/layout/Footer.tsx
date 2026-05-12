import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import logoUrl from '@/assets/Learn2codehub.png';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-gray-200 bg-white dark:bg-gray-950 transition-colors duration-200">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center">
              <img src={logoUrl} alt="Learn To Code Hub" className="h-8 w-auto invert dark:invert-0" />
            </Link>
            <p className="mt-3 max-w-xs text-sm text-gray-500">
              Empowering learners worldwide with high-quality online courses taught by expert
              instructors.
            </p>
            <div className="mt-4 flex gap-3">
              {['Twitter', 'GitHub', 'LinkedIn'].map((social) => (
                <a key={social} href="#" className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors">
                  <ExternalLink className="h-4 w-4" />
                  {social}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-900">Platform</h4>
            <ul className="mt-3 flex flex-col gap-2">
              {['Browse Courses', 'Become Instructor', 'Pricing', 'Blog'].map((item) => (
                <li key={item}>
                  <Link
                    to="/courses"
                    className="text-sm text-gray-500 hover:text-indigo-600 transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-900">Support</h4>
            <ul className="mt-3 flex flex-col gap-2">
              {['Help Center', 'Contact Us', 'Privacy Policy', 'Terms of Service'].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-sm text-gray-500 hover:text-indigo-600 transition-colors"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-100 pt-6">
          <p className="text-center text-xs text-gray-400">
            &copy; {new Date().getFullYear()} Learn To Code Hub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
