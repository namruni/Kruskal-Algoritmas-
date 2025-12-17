
import React, { useState } from 'react';
import { ViewState } from '../types';
import { Network, Code, BookOpen, Activity, PlayCircle, GraduationCap, Image as ImageIcon, RefreshCw } from 'lucide-react';

interface HomeProps {
  changeView: (view: ViewState) => void;
}

const Home: React.FC<HomeProps> = ({ changeView }) => {
  // State to manage image source. 
  // Using relative path './' is safer for most environments
  const [imgSrc, setImgSrc] = useState("./argem.jpg");
  
  // Fallback image (A nice school/university building) if local file is missing
  const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=2000";

  const handleRetryImage = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering other clicks
    // Force reload by adding a timestamp
    setImgSrc(`./argem.jpg?t=${new Date().getTime()}`);
  };

  const cards = [
    {
      id: 'visualizer' as ViewState,
      title: 'Simülasyon',
      desc: 'Rastgele çizgeler üzerinde adım adım MST oluşturun.',
      icon: <Network size={40} className="text-indigo-600" />,
      color: 'hover:border-indigo-500'
    },
    {
      id: 'practice' as ViewState,
      title: 'Kendini Dene',
      desc: 'Kruskal kurallarına göre kenarları sen seç, yaparak öğren.',
      icon: <PlayCircle size={40} className="text-violet-600" />,
      color: 'hover:border-violet-500'
    },
    {
      id: 'quiz' as ViewState,
      title: 'Bilgi Sınavı',
      desc: '10 soruluk zaman ayarlı sınav ile bilgini test et.',
      icon: <GraduationCap size={40} className="text-red-600" />,
      color: 'hover:border-red-500'
    },
    {
      id: 'pseudocode' as ViewState,
      title: 'Sözde Kod & Mantık',
      desc: 'Algoritmanın nasıl çalıştığını basit bir dille öğrenin.',
      icon: <BookOpen size={40} className="text-emerald-600" />,
      color: 'hover:border-emerald-500'
    },
    {
      id: 'code' as ViewState,
      title: 'C ve Python Kodları',
      desc: 'Hazır kod örnekleri ile kendi projenize entegre edin.',
      icon: <Code size={40} className="text-amber-600" />,
      color: 'hover:border-amber-500'
    },
    {
      id: 'complexity' as ViewState,
      title: 'Big O Analizi',
      desc: 'Zaman karmaşıklığının matematiksel açıklaması.',
      icon: <Activity size={40} className="text-pink-600" />,
      color: 'hover:border-pink-500'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      
      {/* Hero Image Section */}
      <div className="w-full h-64 md:h-[400px] rounded-3xl overflow-hidden mb-12 shadow-2xl border border-slate-200 relative bg-slate-900 group">
        
        {/* Manual Retry Button - Top Right */}
        <div className="absolute top-4 right-4 z-30">
          <button 
            onClick={handleRetryImage}
            className="bg-black/30 hover:bg-black/50 text-white p-2 rounded-full backdrop-blur-md transition border border-white/20 shadow-lg group-retry"
            title="Okul Resmini Tekrar Yükle (argem.jpg)"
          >
             <ImageIcon size={20} className="group-retry-hover:hidden" />
          </button>
        </div>

        <img 
           src={imgSrc} 
           onError={(e) => {
             // Only switch if we aren't already on fallback to prevent loops
             if (imgSrc !== FALLBACK_IMAGE) {
               console.warn("Local image failed, switching to fallback.");
               setImgSrc(FALLBACK_IMAGE);
             }
           }}
           className="w-full h-full object-cover opacity-100 group-hover:scale-105 transition-transform duration-700"
           alt="ARGEM Eğitim Merkezi"
        />
        
        {/* Dark Gradient Overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent"></div>

        {/* Content Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-10 p-4">
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl mb-4 border border-white/20 shadow-lg animate-fade-in-up">
              <Network size={64} className="text-indigo-300 drop-shadow-lg" />
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-center drop-shadow-xl mb-2">
              Minimum Tarama Ağacı
            </h1>
            <p className="mt-2 text-indigo-100 text-lg md:text-xl font-medium tracking-wide drop-shadow-md text-center bg-slate-900/40 px-6 py-2 rounded-full backdrop-blur-sm border border-white/10">
              ARGEM Kruskal Algoritması Görselleştirme Aracı
            </p>
        </div>
      </div>

      <div className="text-center mb-12 space-y-4">
        <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">
          Kruskal Algoritması <span className="text-indigo-600">Eğitim Portalı</span>
        </h2>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
          Minimum Tarama Ağacı (MST) bulmak hiç bu kadar eğlenceli olmamıştı. 
          Görselleştirin, analiz edin ve kodlayın.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => changeView(card.id)}
            className={`group text-left p-6 bg-white rounded-2xl shadow-sm border-2 border-transparent transition-all duration-300 hover:shadow-xl ${card.color} border-slate-100 flex flex-col items-start hover:-translate-y-1`}
          >
            <div className="mb-4 p-3 rounded-xl bg-slate-50 transform group-hover:scale-110 transition-transform duration-300 group-hover:bg-indigo-50">
              {card.icon}
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">{card.title}</h2>
            <p className="text-slate-500 text-sm">{card.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Home;
