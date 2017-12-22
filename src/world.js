import * as THREE from 'three';
import Selector from './selector';

const BIOME_OCEAN = 0;
const BIOME_PLAIN = 1;
const BIOME_FOREST = 2;
const NUM_BIOMES = 3;

const biomeWeights = [
  2,
  1,
  2,
];

const biomeColors = [
  0x0000AA,
  0x88DD88,
  0x008800,
];

export default class World {
  constructor(geometry) {
    // Prepare vertices
    const points = geometry.vertices.map(vert => {
      const biome = new Selector(NUM_BIOMES, biomeWeights).selectRandom();
      return {
        ...vert,
        neighbors: [],
        height: 1,
        biome: biome,
        //color: new THREE.Color(Math.random() * 0xFFFFFF),
        color: biomeColors[biome],
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

    this.geometry = geometry;
    this.points = points;
  }

  advance = () => {
    this.points.forEach(point => {
      point.biome = new Selector(point.neighbors.map(neighbor => neighbor.biome).concat(point.biome)).mode();
      point.color = biomeColors[point.biome];
    });
  };

  update = () => {
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
