// https://www.shadertoy.com/view/4td3Ws
// https://experilous.com/1/project/planet-generator/2015-04-07/version-2
// Random-walk brush across surface
// https://en.wikipedia.org/wiki/Lloyd%27s_algorithm
// https://en.wikipedia.org/wiki/Halton_sequence

import * as THREE from 'three';
import Selector from './selector';
import SimplexNoise from 'simplex-noise';


const simplex = new SimplexNoise(Math.random);

const BIOME_OCEAN = 0;
const BIOME_PLAIN = 1;
const BIOME_FOREST = 2;
const NUM_BIOMES = 3;

const biomeWeights = [
  1,
  0.5,
  1,
];

const biomeColors = [
  0x0000AA,
  0x88DD88,
  0x008800,
];

const shuffleArr = arr => {
  for (let i = arr.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    let x = arr[i];
    arr[i] = arr[j];
    arr[j] = x;
  }
};


export default class World {
  constructor(geometry, radius) {
    // Prepare vertices
    const points = geometry.vertices.map(vert => {
      let height = 1;
      height *= simplex.noise3D(...vert.clone().addScalar(0) .multiplyScalar(radius / 1000).toArray());
      height *= simplex.noise3D(...vert.clone().addScalar(10).multiplyScalar(radius / 2000).toArray()) + 1.0;
      const biome = new Selector(NUM_BIOMES, biomeWeights).selectRandom();
      return {
        ...vert,
        neighbors: [],
        height: height,
        biome: biome,
        //color: new THREE.Color(Math.random() * 0xFFFFFF),
        color: undefined,
      }
    });

    // Collect neighbors
    geometry.faces.forEach(face => {
      points[face.a].neighbors.push(points[face.b]);
      points[face.a].neighbors.push(points[face.c]);
      points[face.b].neighbors.push(points[face.a]);
      points[face.b].neighbors.push(points[face.c]);
      points[face.c].neighbors.push(points[face.a]);
      points[face.c].neighbors.push(points[face.b]);
    });

    // Finalize vertives
    points.forEach(point => {
      point.neighbors = point.neighbors.filter((value, index, self) => self.indexOf(value) === index);
    });

    console.log('Sample edge distance: ' + geometry.vertices[geometry.faces[0].a].distanceTo(geometry.vertices[geometry.faces[0].b]) * radius);

    this.geometry = geometry;
    this.points = points;
    this.radius = radius;
  }


  advance = () => {
    const shuffledPts = this.points.concat();
    shuffleArr(shuffledPts);
    shuffledPts.forEach(point => {
      point.biome = new Selector(point.neighbors.map(neighbor => neighbor.biome).concat(point.biome)).mode();
    });
  };


  update = () => {
    this.points.forEach((point, index) => {
      //point.color = biomeColors[point.biome];
      point.color = point.height > 0 ? (Math.floor(point.height * 0xFF) << 8) : 0x0000FF;

      if (Math.random() < 0.001) {
        point.color = 0xFF0000;
      }

      this.geometry.vertices[index].copy(point).multiplyScalar(1.0 + point.height * 0.025);
    });

    this.geometry.faces.forEach(face => {
      const cs = [
        new THREE.Color(this.points[face.a].color),
        new THREE.Color(this.points[face.b].color),
        new THREE.Color(this.points[face.c].color),
      ];

      //face.color.set(new THREE.Color().add(cs[0]).add(cs[1]).add(cs[2]).multiplyScalar(1/3));
      face.vertexColors = cs;
    });

    this.geometry.colorsNeedUpdate = true;
    this.geometry.elementsNeedUpdate = true;
  };
}
