
import React, { useState } from 'react';
import { ViewState } from './types';
import Home from './components/Home';
import Visualizer from './components/Visualizer';
import PseudoCode from './components/PseudoCode';
import CodeExamples from './components/CodeExamples';
import Complexity from './components/Complexity';
import PracticeMode from './components/PracticeMode';
import { LayoutGrid, Home as HomeIcon } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('home');

  const renderContent = () => {
    switch (view) {
      case 'visualizer':
        return <Visualizer />;
      case 'practice':
        return <PracticeMode />;
      case 'pseudocode':
        return <PseudoCode />;
      case 'code':
        return <CodeExamples />;
      case 'complexity':
        return <Complexity />;
      default:
        return <Home changeView={setView} />;
    }
  };

  const getTitle = () => {
    switch(view) {
      case 'visualizer': return 'Simülasyon';
      case 'practice': return 'Kendini Dene';
      case 'pseudocode': return 'Sözde Kod';
      case 'code': return 'Kod Örnekleri';
      case 'complexity': return 'Analiz';
      default: return '';
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div 
              className="flex items-center gap-2 cursor-pointer" 
              onClick={() => setView('home')}
            >
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
                K
              </div>
              <span className="font-bold text-xl text-slate-800">KruskalÖğren</span>
            </div>

            <div className="flex items-center gap-4">
              {view !== 'home' && (
                <button
                  onClick={() => setView('home')}
                  className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 transition-colors"
                >
                  <HomeIcon size={18} />
                  <span className="hidden sm:inline">Ana Sayfa</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {view !== 'home' && (
          <div className="mb-6 flex items-center gap-2">
             <span className="text-slate-400">/</span>
             <h2 className="text-2xl font-bold text-slate-800">{getTitle()}</h2>
          </div>
        )}
        {renderContent()}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
          <p>© 2024 Kruskal Eğitim Aracı. Öğrenciler için sevgiyle yapıldı.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
