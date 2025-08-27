import type  { ReactNode } from 'react';
import { Globe } from '../components/Icons';

interface MainLayoutProps {
  children: ReactNode;
  countriesCount?: number;
}

export const MainLayout = ({ children, countriesCount = 0 }: MainLayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <Globe className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Zifala Distance Calculator</h1>
              <p className="text-sm text-gray-600">Calculate great-circle distances between country capitals</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-600">
            <p>Built with React + TypeScript. Distances calculated using the Haversine formula.</p>
            <p className="mt-1">
              Data source: {countriesCount} countries with precise capital coordinates.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};