
import React, { useState, useEffect } from 'react';
import { ImageWorkspace } from './components/ImageWorkspace';
import { DesktopIcon } from './components/Icons';

const App: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black text-slate-100 selection:bg-banana-500/30">
      
      {/* Navbar */}
      <header className="border-b border-white/5 bg-black/20 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-banana-500 flex items-center justify-center shadow-lg shadow-banana-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-slate-900">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
              </svg>
            </div>
            <span className="font-bold text-xl tracking-tight text-white">Banana<span className="text-banana-400">Edit</span></span>
          </div>
          
          <div className="flex items-center gap-4">
            {deferredPrompt && (
              <button 
                onClick={handleInstall}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-banana-100 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/10"
              >
                <DesktopIcon className="w-4 h-4" />
                Install App
              </button>
            )}
            <div className="text-xs font-medium text-slate-400 px-3 py-1 bg-slate-800 rounded-full border border-slate-700 hidden sm:block">
              Powered by Gemini 2.5 Flash Image
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-8">
        <div className="text-center mb-8 space-y-2">
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-banana-100 to-banana-300">
            Transform Images with Words
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Upload an image and describe how you want to change it. 
            Colorize old photos, add effects, or remove objects instantly.
          </p>
        </div>

        <ImageWorkspace />
      </main>

      <footer className="py-8 text-center text-slate-600 text-sm">
        <p>&copy; {new Date().getFullYear()} BananaEdit. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;
