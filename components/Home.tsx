
import React from 'react';
import { ViewState } from '../types';
import { Network, Code, BookOpen, Activity, PlayCircle } from 'lucide-react';

interface HomeProps {
  changeView: (view: ViewState) => void;
}

const Home: React.FC<HomeProps> = ({ changeView }) => {
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
      
      {/* Hero Image Section - Clean, only image */}
      <div className="w-full h-64 md:h-[450px] rounded-3xl overflow-hidden mb-12 shadow-xl border border-slate-200">
        <img 
           src="https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=2886&auto=format&fit=crop" 
           className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
           alt="İstanbul Çamlıca Argem Lisesi"
        />
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
            className={`group text-left p-6 bg-white rounded-2xl shadow-sm border-2 border-transparent transition-all duration-300 hover:shadow-xl ${card.color} border-slate-100 flex flex-col items-start`}
          >
            <div className="mb-4 p-3 rounded-xl bg-slate-50 transform group-hover:scale-110 transition-transform duration-300">
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
