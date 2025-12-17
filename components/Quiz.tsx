
import React, { useState, useEffect } from 'react';
import { Timer, CheckCircle, XCircle, AlertCircle, Award, ArrowRight, RotateCcw } from 'lucide-react';

interface Question {
  id: number;
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const questions: Question[] = [
  {
    id: 1,
    text: "Kruskal algoritmasının temel amacı nedir?",
    options: [
      "Bir grafikteki en kısa yolu bulmak (Shortest Path)",
      "Bir grafikteki tüm düğümleri içeren, en küçük toplam ağırlıklı ağacı bulmak (MST)",
      "Bir grafikteki maksimum akışı (Max Flow) hesaplamak",
      "Bir grafiği iki eşit parçaya bölmek"
    ],
    correctIndex: 1,
    explanation: "Kruskal algoritması, bağlantılı ve ağırlıklı bir çizgede tüm düğümleri birbirine bağlayan, toplam kenar ağırlığı en az olan 'Minimum Tarama Ağacı'nı (MST) bulur."
  },
  {
    id: 2,
    text: "Kruskal algoritması çalışmaya başladığında ilk olarak ne yapar?",
    options: [
      "Rastgele bir düğüm seçer",
      "En büyük ağırlıklı kenarı seçer",
      "Tüm kenarları ağırlıklarına göre küçükten büyüğe sıralar",
      "Düğümleri derecelerine göre sıralar"
    ],
    correctIndex: 2,
    explanation: "Algoritmanın en belirleyici adımı, işlem yapmadan önce tüm kenarları ağırlıklarına göre küçükten büyüğe (artan sırada) sıralamasıdır."
  },
  {
    id: 3,
    text: "Kruskal algoritması bir kenarı seçerken hangi durumu kontrol eder?",
    options: [
      "Kenarın negatif olup olmadığını",
      "Kenarın eklenmesinin bir döngü (cycle) oluşturup oluşturmadığını",
      "Kenarın ağırlığının 10'dan büyük olup olmadığını",
      "Düğümün rengini"
    ],
    correctIndex: 1,
    explanation: "Kruskal algoritması 'greedy' (açgözlü) bir yaklaşımla en küçük kenarı almayı dener, ancak bu kenar MST'ye eklendiğinde bir döngü oluşturuyorsa o kenarı reddeder."
  },
  {
    id: 4,
    text: "Kruskal algoritmasında döngü kontrolü için en verimli veri yapısı hangisidir?",
    options: [
      "Stack (Yığın)",
      "Queue (Kuyruk)",
      "Union-Find (Disjoint Set Union)",
      "Linked List (Bağlı Liste)"
    ],
    correctIndex: 2,
    explanation: "Union-Find veri yapısı, düğümlerin hangi kümelerde olduğunu çok hızlı takip eder ve iki düğümün aynı kümede (yani zaten bağlı) olup olmadığını anlamak için en verimli yöntemdir."
  },
  {
    id: 5,
    text: "V adet düğümü (vertex) olan bir grafiğin Minimum Tarama Ağacında (MST) kaç adet kenar bulunur?",
    options: [
      "V adet",
      "V - 1 adet",
      "V + 1 adet",
      "V * V adet"
    ],
    correctIndex: 1,
    explanation: "Bir ağaç yapısında (döngüsüz, bağlı grafik), eğer V tane düğüm varsa, bunları birbirine bağlayan en az ve en çok kenar sayısı her zaman V-1'dir."
  },
  {
    id: 6,
    text: "Kruskal algoritmasının zaman karmaşıklığı (Time Complexity) genel olarak nedir?",
    options: [
      "O(V)",
      "O(E log E) veya O(E log V)",
      "O(V^2)",
      "O(1)"
    ],
    correctIndex: 1,
    explanation: "Algoritmanın en maliyetli kısmı kenarları sıralamaktır. E adet kenarı sıralamak O(E log E) sürer. Union-Find işlemleri neredeyse sabit zamanlıdır."
  },
  {
    id: 7,
    text: "Kruskal algoritması hangi algoritma paradigmasına örnektir?",
    options: [
      "Dinamik Programlama (Dynamic Programming)",
      "Böl ve Yönet (Divide and Conquer)",
      "Açgözlü Yaklaşım (Greedy Approach)",
      "Geri İzleme (Backtracking)"
    ],
    correctIndex: 2,
    explanation: "Kruskal, her adımda o anki en iyi seçeneği (en küçük ağırlıklı kenarı) seçtiği ve geri dönüp karar değiştirmediği için Açgözlü (Greedy) bir algoritmadır."
  },
  {
    id: 8,
    text: "Prim algoritması ile Kruskal algoritması arasındaki temel fark nedir?",
    options: [
      "Prim en uzun yolu bulur, Kruskal en kısayı.",
      "Prim kenar tabanlıdır, Kruskal düğüm tabanlıdır.",
      "Kruskal kenarları sıralayıp seçer, Prim bir düğümden başlayıp ağacı büyütür.",
      "İkisi de tamamen aynı şekilde çalışır."
    ],
    correctIndex: 2,
    explanation: "Kruskal grafiğin genelindeki en küçük kenarları arar (ormanları birleştirir). Prim ise belirli bir başlangıç düğümünden yola çıkarak ağacı adım adım büyütür."
  },
  {
    id: 9,
    text: "Bir grafikte tüm kenar ağırlıkları birbirinden farklıysa (unique), kaç tane MST oluşabilir?",
    options: [
      "Sadece 1 tane (Tekil MST)",
      "En az 2 tane",
      "Grafiğin boyutuna göre değişir",
      "Sonsuz sayıda"
    ],
    correctIndex: 0,
    explanation: "Eğer bir grafikteki tüm kenar ağırlıkları benzersizse, Kruskal algoritması her adımda kesin bir seçim yapar ve sonuçta sadece 1 tane benzersiz Minimum Tarama Ağacı oluşur."
  },
  {
    id: 10,
    text: "Kruskal algoritması bağlantısız (disconnected) bir grafikte çalıştırılırsa sonuç ne olur?",
    options: [
      "Hata verir",
      "Sonsuz döngüye girer",
      "Minimum Tarama Ormanı (Minimum Spanning Forest) oluşur",
      "Hiçbir kenar seçmez"
    ],
    correctIndex: 2,
    explanation: "Grafik bağlantısızsa, algoritma her bağlantılı bileşen için ayrı bir MST oluşturur. Bu yapıların toplamına Minimum Tarama Ormanı denir."
  }
];

const Quiz: React.FC = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{[key: number]: number}>({});
  const [score, setScore] = useState(0);
  const [status, setStatus] = useState<'intro' | 'playing' | 'finished'>('intro');
  const [timeLeft, setTimeLeft] = useState(60);

  // Timer logic
  useEffect(() => {
    let timer: any;
    if (status === 'playing' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && status === 'playing') {
      handleNextQuestion(true); // Auto skip if time runs out
    }
    return () => clearInterval(timer);
  }, [timeLeft, status]);

  const startQuiz = () => {
    setStatus('playing');
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswers({});
    setTimeLeft(60);
  };

  const handleOptionSelect = (optionIndex: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questions[currentQuestionIndex].id]: optionIndex
    }));
  };

  const handleNextQuestion = (isTimeOut: boolean = false) => {
    // If timed out and no answer selected, mark as -1 (unanswered)
    if (isTimeOut && selectedAnswers[questions[currentQuestionIndex].id] === undefined) {
       setSelectedAnswers(prev => ({
        ...prev,
        [questions[currentQuestionIndex].id]: -1
      }));
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setTimeLeft(60); // Reset timer for next question
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    let finalScore = 0;
    questions.forEach(q => {
      if (selectedAnswers[q.id] === q.correctIndex) {
        finalScore++;
      }
    });
    setScore(finalScore);
    setStatus('finished');
  };

  // Intro Screen
  if (status === 'intro') {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden text-center p-8 border border-slate-200">
          <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Award size={40} className="text-indigo-600" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-4">Kruskal Bilgi Sınavı</h1>
          <p className="text-slate-600 mb-8 text-lg">
            Algoritma bilginizi test etmeye hazır mısınız? 
            <br />
            Toplam 10 soru, her soru için 60 saniye süreniz var.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 text-left max-w-lg mx-auto">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex items-center gap-3">
               <div className="bg-blue-100 p-2 rounded-full text-blue-600">10</div>
               <span className="font-medium text-slate-700">Soru</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex items-center gap-3">
               <div className="bg-amber-100 p-2 rounded-full text-amber-600"><Timer size={16}/></div>
               <span className="font-medium text-slate-700">60sn / Soru</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex items-center gap-3">
               <div className="bg-green-100 p-2 rounded-full text-green-600">%</div>
               <span className="font-medium text-slate-700">Detaylı Analiz</span>
            </div>
          </div>

          <button 
            onClick={startQuiz}
            className="px-8 py-4 bg-indigo-600 text-white text-lg font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl w-full md:w-auto"
          >
            Sınavı Başlat
          </button>
        </div>
      </div>
    );
  }

  // Finished Screen
  if (status === 'finished') {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8 text-center">
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Sınav Tamamlandı!</h2>
          <div className="text-6xl font-extrabold text-indigo-600 my-6">
            {score} / {questions.length}
          </div>
          <p className="text-slate-500 mb-6">
            {score >= 8 ? "Mükemmel sonuç! Konuya hakimsin." : 
             score >= 5 ? "Güzel deneme, biraz daha tekrar ile mükemmel olabilir." : 
             "Konuyu tekrar gözden geçirmeni öneririz."}
          </p>
          <button 
            onClick={startQuiz}
            className="flex items-center gap-2 px-6 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition mx-auto"
          >
            <RotateCcw size={18} /> Yeniden Dene
          </button>
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-bold text-slate-800 ml-2">Cevap Anahtarı ve Çözümler</h3>
          {questions.map((q, index) => {
            const userAnswer = selectedAnswers[q.id];
            const isCorrect = userAnswer === q.correctIndex;
            const isUnanswered = userAnswer === undefined || userAnswer === -1;

            return (
              <div key={q.id} className={`bg-white p-6 rounded-xl border-l-4 shadow-sm ${isCorrect ? 'border-emerald-500' : 'border-red-500'}`}>
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    {isCorrect ? 
                      <CheckCircle className="text-emerald-500" size={24} /> : 
                      <XCircle className="text-red-500" size={24} />
                    }
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-800 text-lg mb-3">
                      {index + 1}. {q.text}
                    </h4>
                    
                    <div className="space-y-2 mb-4">
                      {q.options.map((opt, optIdx) => {
                        let optionClass = "p-3 rounded-lg border text-sm flex justify-between items-center ";
                        if (optIdx === q.correctIndex) {
                          optionClass += "bg-emerald-50 border-emerald-200 text-emerald-800 font-bold";
                        } else if (optIdx === userAnswer && !isCorrect) {
                          optionClass += "bg-red-50 border-red-200 text-red-800 font-medium";
                        } else {
                          optionClass += "bg-white border-slate-200 text-slate-500 opacity-60";
                        }
                        return (
                          <div key={optIdx} className={optionClass}>
                            {opt}
                            {optIdx === q.correctIndex && <CheckCircle size={16} />}
                            {optIdx === userAnswer && !isCorrect && <XCircle size={16} />}
                          </div>
                        );
                      })}
                      {isUnanswered && <p className="text-red-500 text-sm font-bold italic">Bu soruyu boş bıraktınız.</p>}
                    </div>

                    <div className="bg-indigo-50 p-4 rounded-lg text-sm text-indigo-900 flex gap-3">
                       <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                       <div>
                         <span className="font-bold block mb-1">Açıklama:</span>
                         {q.explanation}
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Playing Screen
  const currentQ = questions[currentQuestionIndex];
  return (
    <div className="max-w-3xl mx-auto py-8 px-4 h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Soru</span>
          <div className="text-xl font-bold text-slate-800">
            {currentQuestionIndex + 1} <span className="text-slate-400 text-base">/ {questions.length}</span>
          </div>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono font-bold text-lg ${timeLeft < 10 ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-700'}`}>
          <Timer size={20} />
          {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 h-2 rounded-full mb-8 overflow-hidden">
        <div 
          className="bg-indigo-600 h-full transition-all duration-300 ease-out"
          style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
        ></div>
      </div>

      {/* Question Card */}
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-slate-200 flex-1 flex flex-col">
        <h3 className="text-2xl font-bold text-slate-800 mb-8 leading-relaxed">
          {currentQ.text}
        </h3>

        <div className="space-y-3 flex-1">
          {currentQ.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleOptionSelect(idx)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center group ${
                selectedAnswers[currentQ.id] === idx 
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-900' 
                  : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50 text-slate-600'
              }`}
            >
              <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center flex-shrink-0 transition-colors ${
                selectedAnswers[currentQ.id] === idx 
                  ? 'border-indigo-600 bg-indigo-600' 
                  : 'border-slate-300 group-hover:border-indigo-400'
              }`}>
                {selectedAnswers[currentQ.id] === idx && <div className="w-2 h-2 bg-white rounded-full"></div>}
              </div>
              <span className="font-medium text-lg">{option}</span>
            </button>
          ))}
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={() => handleNextQuestion(false)}
            disabled={selectedAnswers[currentQ.id] === undefined}
            className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg hover:translate-x-1"
          >
            {currentQuestionIndex === questions.length - 1 ? "Sınavı Bitir" : "Sonraki Soru"}
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Quiz;
