import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import * as TWEEN from 'tween.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer';
import { createCard } from '../lib/card';
import { buildTargets } from '../lib/layouts';
import AboutBubble from './AboutBubble';
import Instructions from './Instructions';
import Legend from './Legend';
import MenuBar from './MenuBar';

export default function Visualization({ data }) {
  const mountRef = useRef(null);
  const transformRef = useRef(() => {}); // set once the scene exists, called by MenuBar

  useEffect(() => {
    if (!data || data.length === 0) return;

    let camera, scene, renderer, controls;
    const objects = [];
    const targets = buildTargets(data.length);

    init();
    animate();

    function init() {
      camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 10000);
      camera.position.z = 3000;
      scene = new THREE.Scene();

      // Range used to place each card's netWorth on the low->high gradient
      const netWorths = data.map((d) => d.netWorth);
      const minNetWorth = Math.min(...netWorths);
      const maxNetWorth = Math.max(...netWorths);

      data.forEach((item) => {
        const t = maxNetWorth > minNetWorth
          ? (item.netWorth - minNetWorth) / (maxNetWorth - minNetWorth)
          : 0.0;
        const objectCSS = createCard(item, t);
        scene.add(objectCSS);
        objects.push(objectCSS);
      });

      // Renderer setup
      renderer = new CSS3DRenderer();
      renderer.setSize(window.innerWidth, window.innerHeight);
      if (mountRef.current) {
        mountRef.current.appendChild(renderer.domElement);
      }

      // OrbitControls keeps the up-vector fixed, so the camera never rolls
      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      controls.rotateSpeed = 0.5;
      controls.zoomSpeed = 1.0;
      controls.minDistance = 500;
      controls.maxDistance = 6500;

      transformRef.current = (shape) => transform(targets[shape], 2000);
      transform(targets.table, 2000);

      window.addEventListener('resize', onWindowResize);
      // Re-measure once layout has settled, in case the initial size was captured too early
      requestAnimationFrame(onWindowResize);
    }

    function transform(targetList, duration) {
      TWEEN.removeAll();
      for (let i = 0; i < objects.length; i++) {
        const object = objects[i];
        const target = targetList[i];
        if (!target) continue;

        new TWEEN.Tween(object.position)
          .to({ x: target.position.x, y: target.position.y, z: target.position.z }, Math.random() * duration + duration)
          .easing(TWEEN.Easing.Exponential.InOut)
          .start();

        new TWEEN.Tween(object.rotation)
          .to({ x: target.rotation.x, y: target.rotation.y, z: target.rotation.z }, Math.random() * duration + duration)
          .easing(TWEEN.Easing.Exponential.InOut)
          .start();
      }
    }

    function onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      render();
    }

    function animate() {
      requestAnimationFrame(animate);
      TWEEN.update();
      controls.update();
      render(); // redraw every frame so camera moves are always visible
    }

    function render() {
      renderer.render(scene, camera);
    }

    return () => {
      window.removeEventListener('resize', onWindowResize);
      controls.dispose();
      if (mountRef.current && renderer) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [data]);

  return (
    <div className="viz-container">
      <AboutBubble />
      <Instructions />
      <Legend />
      <MenuBar onSelect={(shape) => transformRef.current(shape)} />
      <div ref={mountRef} className="viz-mount" />
    </div>
  );
}
