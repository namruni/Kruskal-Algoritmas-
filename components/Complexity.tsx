import React from 'react';

const Complexity: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-3xl font-bold text-slate-800 mb-8 border-b pb-4">Big O Karmaşıklık Analizi</h2>
        
        <div className="space-y-8">
          {/* Main Complexity */}
          <div className="flex items-center justify-center p-8 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-center">
              <p className="text-slate-500 mb-2 font-medium">Zaman Karmaşıklığı (Time Complexity)</p>
              <div className="text-5xl font-mono font-bold text-indigo-600">
                O(E log E)
              </div>
              <p className="text-slate-400 mt-2 text-sm">veya O(E log V)</p>
            </div>
          </div>

          {/* Breakdown */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 bg-blue-50 rounded-xl border border-blue-100">
              <h3 className="font-bold text-blue-800 mb-2">1. Sıralama İşlemi</h3>
              <p className="text-blue-900/80 text-sm leading-relaxed">
                Algoritmanın en maliyetli kısmı kenarları ağırlıklarına göre sıralamaktır. 
                <br/><br/>
                Eğer <span className="font-mono bg-blue-200 px-1 rounded">E</span> kenar sayımız ise, verimli bir sıralama algoritması (Merge Sort veya Quick Sort gibi) ile bu işlem:
                <br/>
                <strong className="text-lg block mt-2">O(E log E)</strong>
              </p>
            </div>

            <div className="p-6 bg-emerald-50 rounded-xl border border-emerald-100">
              <h3 className="font-bold text-emerald-800 mb-2">2. Union-Find İşlemleri</h3>
              <p className="text-emerald-900/80 text-sm leading-relaxed">
                Sıralamadan sonra her kenar için döngü kontrolü yaparız. Union-Find veri yapısı kullanıldığında (Path Compression ve Union by Rank ile), bu işlemler neredeyse sabittir.
                <br/><br/>
                Her kenar için işlem: <span className="font-mono">O(α(V))</span>
                <br/>
                Toplam: <strong className="text-lg block mt-2">O(E α(V))</strong>
                <span className="text-xs italic block mt-1">* α ters Ackermann fonksiyonudur, pratik amaçlar için 4'ten küçüktür (neredeyse sabit).</span>
              </p>
            </div>
          </div>

          {/* Conclusion */}
          <div className="p-6 bg-slate-900 text-slate-300 rounded-xl">
            <h3 className="text-white font-bold mb-2">Sonuç</h3>
            <p>
              <span className="font-mono text-yellow-400">O(E log E)</span> (sıralama) + <span className="font-mono text-green-400">O(E α(V))</span> (birleştirme) toplandığında, baskın olan terim sıralamadır.
            </p>
            <p className="mt-4">
              Bu nedenle Kruskal algoritmasının toplam karmaşıklığı <span className="font-bold text-white">O(E log E)</span> olarak kabul edilir. Graf yoğunsa (E ≈ V²), bu O(V² log V) olur.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Complexity;