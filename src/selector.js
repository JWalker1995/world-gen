export default class Selector {
  constructor(values, weights) {
    if (typeof values === 'number') {
      values = [...Array(values).keys()];
    }

    if (typeof weights === 'undefined') {
      const scale = 1 / values.length;
      weights = values.map(() => scale);
    } else {
      const scale = 1 / weights.reduce((a, b) => (a + b), 0);
      weights = weights.map(weight => weight * scale);
    }

    if (!(values instanceof Array && weights instanceof Array && values.length === weights.length)) {
      throw new Error('Invalid arguments');
    }

    this.values = values;
    this.weights = weights;
    this.len = values.length;
  }

  selectRandom() {
    let rand = Math.random();
    for (let i = 0; i < this.len; i++) {
      rand -= this.weights[i];
      if (rand < 0) {
        return this.values[i];
      }
    }
  }

  mean() {
    let res = 0;
    for (let i = 0; i < this.len; i++) {
      res += this.values[i] * this.weights[i];
    }
    return res;
  }

  mode() {
    const counts = [];
    for (let i = 0; i < this.len; i++) {
      const val = this.values[i];
      if (typeof counts[val] === 'undefined') {
        counts[val] = this.weights[i];
      } else {
        counts[val] += this.weights[i];
      }
    }

    let maxCount = -Infinity;
    let maxKey;
    for (let key = 0; key < counts.length; key++) {
      if (counts[key] > maxCount || (counts[key] === maxCount && Math.random() < 0.5)) {
        maxCount = counts[key];
        maxKey = key;
      }
    }

    return maxKey;
  }
};
