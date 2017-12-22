import React, { Component } from 'react';
import * as THREE from 'three';
import World from './world';

const OrbitControls = require('three-orbit-controls')(THREE);

let advances = 0;
document.addEventListener('keydown', event => {
  if (event.which === 32) {
    advances++;
  }
}, false);

class App extends Component {
  renderCanvas = container => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 4);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    const controls = new OrbitControls(camera);

    const light1 = new THREE.AmbientLight( 0xffffff, 2.0 );
    scene.add( light1 );

    // const light2 = new THREE.DirectionalLight( 0xffffff, 0.5 );
    // light2.position.set(10, 10, 0);
    // scene.add( light2 );

    const geometry = new THREE.IcosahedronGeometry( 1, 5 );
    const material = new THREE.MeshStandardMaterial( { vertexColors: THREE.FaceColors } );
    const sphere = new THREE.Mesh( geometry, material );
    scene.add( sphere );

/*
    const wireframe = new THREE.WireframeGeometry( geometry );
    const line = new THREE.LineSegments( wireframe );
    line.scale.set(1.01, 1.01, 1.01);
    scene.add( line );
*/

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( renderer.domElement );

    const world = new World(geometry);
    world.update();

    const animate = () => {
      if (advances) {
        advances--;
        world.advance();
        world.update();
      }

      requestAnimationFrame( animate );
      renderer.render( scene, camera );
    };
    animate();
  };

  render() {
    return (
      <div>
        <span ref={this.renderCanvas}></span>
      </div>
    );
  }
}

export default App;
