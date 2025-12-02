export class UnionFind {
  parent: Map<string, string>;
  rank: Map<string, number>;

  constructor(elements: string[]) {
    this.parent = new Map();
    this.rank = new Map();
    elements.forEach(e => {
      this.parent.set(e, e);
      this.rank.set(e, 0);
    });
  }

  find(i: string): string {
    if (this.parent.get(i) !== i) {
      this.parent.set(i, this.find(this.parent.get(i)!));
    }
    return this.parent.get(i)!;
  }

  union(i: string, j: string): boolean {
    const rootI = this.find(i);
    const rootJ = this.find(j);

    if (rootI !== rootJ) {
      const rankI = this.rank.get(rootI)!;
      const rankJ = this.rank.get(rootJ)!;

      if (rankI < rankJ) {
        this.parent.set(rootI, rootJ);
      } else if (rankI > rankJ) {
        this.parent.set(rootJ, rootI);
      } else {
        this.parent.set(rootJ, rootI);
        this.rank.set(rootI, rankI + 1);
      }
      return true;
    }
    return false;
  }
}