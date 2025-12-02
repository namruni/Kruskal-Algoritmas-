import React, { useState } from 'react';

const CodeExamples: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'python' | 'c'>('python');

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-center space-x-4 mb-6">
        <button
          onClick={() => setActiveTab('python')}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            activeTab === 'python'
              ? 'bg-yellow-400 text-yellow-900 shadow-lg scale-105'
              : 'bg-white text-slate-600 hover:bg-slate-50'
          }`}
        >
          Python Kodu
        </button>
        <button
          onClick={() => setActiveTab('c')}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            activeTab === 'c'
              ? 'bg-blue-600 text-white shadow-lg scale-105'
              : 'bg-white text-slate-600 hover:bg-slate-50'
          }`}
        >
          C Kodu
        </button>
      </div>

      <div className="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-2xl border border-slate-800">
        <div className="flex items-center px-4 py-2 bg-[#2d2d2d] border-b border-slate-700">
          <div className="flex space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <span className="ml-4 text-xs text-slate-400 font-mono">
            {activeTab === 'python' ? 'kruskal.py' : 'kruskal.c'}
          </span>
        </div>
        
        <div className="p-6 overflow-x-auto">
          {activeTab === 'python' ? (
            <pre className="text-sm font-mono leading-relaxed text-gray-300">
{`# Union-Find Veri Yapısı Sınıfı
class Graph:
    def __init__(self, vertices):
        self.V = vertices
        self.graph = []

    def add_edge(self, u, v, w):
        self.graph.append([u, v, w])

    # Elemanın kökünü bulma (Path Compression ile)
    def find(self, parent, i):
        if parent[i] == i:
            return i
        return self.find(parent, parent[i])

    # İki kümeyi birleştirme (Union by Rank ile)
    def union(self, parent, rank, x, y):
        xroot = self.find(parent, x)
        yroot = self.find(parent, y)

        if rank[xroot] < rank[yroot]:
            parent[xroot] = yroot
        elif rank[xroot] > rank[yroot]:
            parent[yroot] = xroot
        else:
            parent[yroot] = xroot
            rank[xroot] += 1

    def kruskal_mst(self):
        result = []  # Sonuç MST'yi saklayacak
        i = 0  # Sıralı kenarlar için sayaç
        e = 0  # Sonuç dizisi için sayaç

        # Adım 1: Kenarları ağırlıklarına göre sırala
        self.graph = sorted(self.graph, key=lambda item: item[2])

        parent = []
        rank = []

        # V adet alt küme oluştur
        for node in range(self.V):
            parent.append(node)
            rank.append(0)

        # V-1 kenar olana kadar döngü
        while e < self.V - 1 and i < len(self.graph):
            # En küçük ağırlıklı kenarı al
            u, v, w = self.graph[i]
            i = i + 1

            x = self.find(parent, u)
            y = self.find(parent, v)

            # Eğer döngü oluşturmuyorsa (farklı kümelerdelerse)
            if x != y:
                e = e + 1
                result.append([u, v, w])
                self.union(parent, rank, x, y)

        print("Minimum Tarama Ağacı Kenarları:")
        mst_weight = 0
        for u, v, weight in result:
            mst_weight += weight
            print(f"{u} -- {v} == {weight}")
        print(f"Toplam Ağırlık: {mst_weight}")

# Kullanım Örneği
g = Graph(4)
g.add_edge(0, 1, 10)
g.add_edge(0, 2, 6)
g.add_edge(0, 3, 5)
g.add_edge(1, 3, 15)
g.add_edge(2, 3, 4)

g.kruskal_mst()`}
            </pre>
          ) : (
            <pre className="text-sm font-mono leading-relaxed text-gray-300">
{`#include <stdio.h>
#include <stdlib.h>

// Kenar yapısı
struct Edge {
    int src, dest, weight;
};

// Çizge yapısı
struct Graph {
    int V, E;
    struct Edge* edge;
};

struct Graph* createGraph(int V, int E) {
    struct Graph* graph = (struct Graph*)malloc(sizeof(struct Graph));
    graph->V = V;
    graph->E = E;
    graph->edge = (struct Edge*)malloc(graph->E * sizeof(struct Edge));
    return graph;
}

// Subset yapısı (Union-Find için)
struct subset {
    int parent;
    int rank;
};

// Find fonksiyonu (Path compression ile)
int find(struct subset subsets[], int i) {
    if (subsets[i].parent != i)
        subsets[i].parent = find(subsets, subsets[i].parent);
    return subsets[i].parent;
}

// Union fonksiyonu (Rank ile)
void Union(struct subset subsets[], int x, int y) {
    int xroot = find(subsets, x);
    int yroot = find(subsets, y);

    if (subsets[xroot].rank < subsets[yroot].rank)
        subsets[xroot].parent = yroot;
    else if (subsets[xroot].rank > subsets[yroot].rank)
        subsets[yroot].parent = xroot;
    else {
        subsets[yroot].parent = xroot;
        subsets[xroot].rank++;
    }
}

// qsort için karşılaştırma fonksiyonu
int myComp(const void* a, const void* b) {
    struct Edge* a1 = (struct Edge*)a;
    struct Edge* b1 = (struct Edge*)b;
    return a1->weight > b1->weight;
}

void KruskalMST(struct Graph* graph) {
    int V = graph->V;
    struct Edge result[V]; 
    int e = 0; 
    int i = 0; 

    // Adım 1: Kenarları ağırlığa göre sırala
    qsort(graph->edge, graph->E, sizeof(graph->edge[0]), myComp);

    struct subset* subsets = (struct subset*)malloc(V * sizeof(struct subset));

    for (int v = 0; v < V; ++v) {
        subsets[v].parent = v;
        subsets[v].rank = 0;
    }

    while (e < V - 1 && i < graph->E) {
        struct Edge next_edge = graph->edge[i++];

        int x = find(subsets, next_edge.src);
        int y = find(subsets, next_edge.dest);

        // Eğer döngü yoksa (kökleri farklıysa)
        if (x != y) {
            result[e++] = next_edge;
            Union(subsets, x, y);
        }
    }

    printf("MST Kenarları:\\n");
    int minimumCost = 0;
    for (i = 0; i < e; ++i) {
        printf("%d -- %d == %d\\n", result[i].src, result[i].dest, result[i].weight);
        minimumCost += result[i].weight;
    }
    printf("Toplam Maliyet: %d\\n", minimumCost);
}

int main() {
    int V = 4; // Düğüm Sayısı
    int E = 5; // Kenar Sayısı
    struct Graph* graph = createGraph(V, E);

    // Kenar 0-1
    graph->edge[0].src = 0;
    graph->edge[0].dest = 1;
    graph->edge[0].weight = 10;

    // ... diğer kenarlar ...
    // Basitlik için sadece fonksiyonları gösteriyoruz
    
    KruskalMST(graph);

    return 0;
}`}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
};

export default CodeExamples;