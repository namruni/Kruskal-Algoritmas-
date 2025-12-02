import React from 'react';

const PseudoCode: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-3xl font-bold text-slate-800 mb-6">Kruskal Algoritması Sözde Kodu (Pseudo Code)</h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Code Block */}
          <div className="bg-slate-900 text-slate-50 p-6 rounded-xl font-mono text-sm leading-relaxed overflow-x-auto shadow-inner">
            <p className="text-slate-400 mb-2">// G: Çizge, E: Kenarlar, V: Düğümler</p>
            <p><span className="text-purple-400">KRUSKAL</span>(G):</p>
            <div className="pl-4 space-y-1">
              <p>1. <span className="text-yellow-300">A</span> = ∅  <span className="text-slate-500">// MST kümesi başlangıçta boştur</span></p>
              <p>2. <span className="text-pink-400">her</span> düğüm <span className="text-blue-300">v</span> ∈ G.V <span className="text-pink-400">için</span>:</p>
              <p className="pl-4">MAKE-SET(v) <span className="text-slate-500">// Her düğüm kendi kümesini oluşturur</span></p>
              <p>3. G.E'deki kenarları ağırlıklarına göre <span className="text-green-400">küçükten büyüğe sırala</span></p>
              <p>4. <span className="text-pink-400">her</span> kenar (u, v) ∈ G.E (sıralı listeden) <span className="text-pink-400">için</span>:</p>
              <div className="pl-4 border-l-2 border-slate-700 space-y-1">
                <p><span className="text-pink-400">eğer</span> FIND-SET(u) ≠ FIND-SET(v) <span className="text-pink-400">ise</span>:</p>
                <div className="pl-4">
                  <p><span className="text-yellow-300">A</span> = <span className="text-yellow-300">A</span> ∪ {'{(u, v)}'} <span className="text-slate-500">// Kenarı MST'ye ekle</span></p>
                  <p>UNION(u, v) <span className="text-slate-500">// Kümeleri birleştir</span></p>
                </div>
              </div>
              <p>5. <span className="text-pink-400">döndür</span> <span className="text-yellow-300">A</span></p>
            </div>
          </div>

          {/* Explanation */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-indigo-700">Öğrenciler İçin Adım Adım Açıklama</h3>
            
            <div className="space-y-3 text-slate-700">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold">1</div>
                <p><strong>Hazırlık:</strong> Diyelim ki elimizde şehirler (düğümler) ve bu şehirleri birbirine bağlayan olası yollar (kenarlar) var. Amacımız tüm şehirleri birbirine en ucuza bağlamak. Başlangıçta hiçbir yol seçilmemiştir.</p>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold">2</div>
                <p><strong>Sıralama (En Önemli Adım):</strong> Tüm yolların maliyetlerini bir listeye yazarız ve en ucuzdan en pahalıya doğru sıralarız. Mantık basit: "Önce en ucuz yolu dene!"</p>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold">3</div>
                <p><strong>Seçim Döngüsü:</strong> Sıradaki en ucuz yolu elimize alırız. Şunu sorarız: "Bu yolun bağladığı iki şehir zaten bir şekilde birbirine ulaşabiliyor mu?"</p>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold">4</div>
                <p><strong>Karar Anı (Döngü Kontrolü):</strong> 
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li><span className="text-emerald-600 font-semibold">Hayır, ulaşamıyor:</span> O zaman bu yolu inşa et! (İki ayrı kümeyi birleştir).</li>
                    <li><span className="text-red-600 font-semibold">Evet, zaten bağlılar:</span> O zaman bu yolu yapmaya gerek yok, çünkü gereksiz masraf olur ve döngü oluşturur. Bu yolu çöpe at.</li>
                  </ul>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PseudoCode;