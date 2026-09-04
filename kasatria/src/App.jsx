import React, { useState, useEffect, useRef } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import * as THREE from 'three';
import * as TWEEN from 'tween.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { CSS3DRenderer, CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer';
import './App.css'; // Add basic resets and full-width/height styles here

// Read from .env (see .env.example) so real keys never get committed to git
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const GOOGLE_SHEETS_API_KEY = import.meta.env.VITE_GOOGLE_SHEETS_API_KEY;
const SPREADSHEET_ID = import.meta.env.VITE_SPREADSHEET_ID;
const RANGE = 'Data Template!A2:F'; // Adjust based on your CSV columns (e.g., Name, Image, NetWorth, etc.)

const GRADIENT_STOPS = ['#EF3022', '#F6C242', '#3A5F48'];

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function rgbToHex([r, g, b]) {
  return '#' + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
}
function mixColors(hexA, hexB, t) {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  return rgbToHex(a.map((v, i) => v + (b[i] - v) * t));
}
// t=0 -> first stop, t=0.5 -> middle stop, t=1 -> last stop, smoothly in between
function getGradientColor(t) {
  const clamped = Math.min(1, Math.max(0, t));
  return clamped < 0.5
    ? mixColors(GRADIENT_STOPS[0], GRADIENT_STOPS[1], clamped * 2)
    : mixColors(GRADIENT_STOPS[1], GRADIENT_STOPS[2], (clamped - 0.5) * 2);
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false); // TEMP: auth disabled for testing
  const [sheetData, setSheetData] = useState([]);

  useEffect(() => {
    if (isAuthenticated) {
      // Fetch data from Google Sheets API
      fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE}?key=${GOOGLE_SHEETS_API_KEY}`)
        .then(response => response.json())
        .then(data => {
          if (data.values) {
            console.log("Found data!");
            // Map rows to structured objects
            const formattedData = data.values.map(row => ({
              name: row[0],
              image: row[1], // Assuming URL
              netWorth: parseFloat(row[2].replace(/[^0-9.-]+/g,"")), // Clean currency string
              details: row[3]
            }));
            setSheetData(formattedData);
          } else {
            console.log("Did not find data!");
          }
        })
        .catch(error => console.error('Error fetching data:', error));
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="login-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
          <div style={{ textAlign: 'center', padding: '40px', border: '1px solid #ccc', borderRadius: '8px' }}>
            <h2>Welcome :)</h2>
            <p>Please sign in to view the visualization.</p>
            <br/>
            
            <GoogleLogin
              onSuccess={() => setIsAuthenticated(true)}
              onError={() => console.error('Login Failed')}
            />
          </div>
        </GoogleOAuthProvider>
      </div>
    );
  }

  return <Visualization data={sheetData} />;
}

function Visualization({ data }) {
  const mountRef = useRef(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    let camera, scene, renderer, controls;
    const objects = [];
    const targets = { table: [], sphere: [], helix: [], grid: [] };

    init();
    animate();

    function init() {
      camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 10000);
      camera.position.z = 3000;
      scene = new THREE.Scene();

      const vector = new THREE.Vector3();
      const cylindrical = new THREE.Cylindrical();

      // Range used to place each card's netWorth on the low->high gradient
      const netWorths = data.map((d) => d.netWorth);
      const minNetWorth = Math.min(...netWorths);
      const maxNetWorth = Math.max(...netWorths);

      data.forEach((item, i) => {
        // 1. Determine color from the continuous gradient, based on where this
        // item's netWorth falls between the dataset's min and max
        const t = maxNetWorth > minNetWorth
          ? (item.netWorth - minNetWorth) / (maxNetWorth - minNetWorth)
          : 0.0;
        const borderColor = getGradientColor(t);
        const bgColor = mixColors(borderColor, '#000000', 0.55); // darker fill so text stays readable

        // 2. Create DOM Element
        const element = document.createElement('div');
        element.className = 'element';
        element.style.backgroundColor = bgColor;
        element.style.border = `3px solid ${borderColor}`;
        element.style.boxSizing = 'border-box';
        element.style.width = '120px';
        element.style.height = '160px';
        element.style.borderRadius = '14px';
        element.style.overflow = 'hidden';
        element.style.textAlign = 'center';
        element.style.cursor = 'default';
        element.style.fontFamily = "'Aleo', serif";
        element.style.pointerEvents = 'none';
        element.style.lineHeight = "10px";

        element.innerHTML = `
          <img src="${item.image}" style="width:80%; margin-top:10px; border-radius:8px; draggable="false";" />
          <div style="font-size:12px; font-weight:bold; color:white; margin-top:10px;">${item.name}</div>
        `;

        const objectCSS = new CSS3DObject(element);
        objectCSS.position.x = Math.random() * 4000 - 2000;
        objectCSS.position.y = Math.random() * 4000 - 2000;
        objectCSS.position.z = Math.random() * 4000 - 2000;
        scene.add(objectCSS);
        objects.push(objectCSS);

        // --- Calculate Layout Targets ---

        // TABLE Layout: 20x10 arrangement
        const tableObj = new THREE.Object3D();
        const col = (i % 20) + 1;
        const row = Math.floor(i / 20) + 1;
        tableObj.position.x = (col * 140) - 1470;
        tableObj.position.y = - (row * 180) + 990;
        targets.table.push(tableObj);

        // SPHERE Layout
        const sphereObj = new THREE.Object3D();
        const phi = Math.acos(-1 + (2 * i) / data.length);
        const thetaSphere = Math.sqrt(data.length * Math.PI) * phi;
        sphereObj.position.setFromSphericalCoords(800, phi, thetaSphere);
        vector.copy(sphereObj.position).multiplyScalar(2);
        sphereObj.lookAt(vector);
        targets.sphere.push(sphereObj);

        // DOUBLE HELIX Layout: even indices form strand A, odd indices form strand B.
        // strandIndex is each card's own position along its strand (0, 1, 2, ...),
        // independent of the other strand, so both wind at the same steady rate.
        const helixObj = new THREE.Object3D();
        const strand = i % 2;
        const strandIndex = Math.floor(i / 2);
        const strandRadius = strand === 0 ? 450 : 500; // slightly different radii per strand
        const phase = strand === 0 ? 0 : Math.PI; // strand B is offset 180 degrees: anti-phase
        const thetaHelix = (strandIndex * 0.35) + phase;
        const y = - (strandIndex * 40) + 850;
        cylindrical.set(strandRadius, thetaHelix, y);
        helixObj.position.setFromCylindrical(cylindrical);
        vector.x = helixObj.position.x * 2;
        vector.y = helixObj.position.y;
        vector.z = helixObj.position.z * 2;
        helixObj.lookAt(vector);
        targets.helix.push(helixObj);

        // GRID Layout: 5x4x10 arrangement
        const gridObj = new THREE.Object3D();
        gridObj.position.x = ((i % 5) * 400) - 800;
        gridObj.position.y = (-(Math.floor(i / 5) % 4) * 400) + 800;
        gridObj.position.z = (Math.floor(i / 20) * 1000) - 2000;
        targets.grid.push(gridObj);
      });

      // Keep every arrangement centered on the origin regardless of data length
      Object.values(targets).forEach((group) => {
        if (!group.length) return;
        const centroid = new THREE.Vector3();
        group.forEach((o) => centroid.add(o.position));
        centroid.divideScalar(group.length);
        group.forEach((o) => o.position.sub(centroid));
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

      transform(targets.table, 2000);

      window.addEventListener('resize', onWindowResize);
      // Re-measure once layout has settled, in case the initial size was captured too early
      requestAnimationFrame(onWindowResize);
    }

    function transform(targets, duration) {
      TWEEN.removeAll();
      for (let i = 0; i < objects.length; i++) {
        const object = objects[i];
        const target = targets[i];
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

    // Expose transform globally for buttons
    window.transformTo = (shape) => transform(targets[shape], 2000);

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
      <div className="about-bubble">
        <div className="about-icon">i</div>
        <div className="about-content">
          <h3>About</h3>
          <p>This is an internship preliminary assignment task result, created using React and Three.js. <br/><br/> Made by Aiham Ammar. <br/><br/> I tried to follow the requirements as closely as possible, while ensuring that the prototype is easy to understand, navigate, and is easily scalable in cases where new entries are added to the sheet. <br/><br/> Hope you like it 😇</p>
          <a
            className="about-link"
            href="https://github.com/Splazey/kasatria-assignment"
            target="_blank"
            rel="noopener noreferrer"
          >
            Get the source code here 💻
          </a>
        </div>
      </div>

      <div className="instructions">
        <div className="instructions-row">
          <OrbitIcon />
          <span>Drag to orbit</span>
        </div>
        <div className="instructions-row">
          <ZoomIcon />
          <span>Scroll to zoom</span>
        </div>
        <div className="instructions-row">
          <PanIcon />
          <span>Right-click drag to pan</span>
        </div>
      </div>

      <div className="legend">
        <span>Low</span>
        <div className="legend-bar" />
        <span>High</span>
      </div>
      <div className="menu-bar">
        <button className="menu-btn" onClick={() => window.transformTo('table')}>Table</button>
        <button className="menu-btn" onClick={() => window.transformTo('sphere')}>Sphere</button>
        <button className="menu-btn" onClick={() => window.transformTo('helix')}>Helix</button>
        <button className="menu-btn" onClick={() => window.transformTo('grid')}>Grid</button>
      </div>
      <div ref={mountRef} className="viz-mount" />
    </div>
  );
}

// instruction panel icons:

const iconProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  width: 16,
  height: 16,
};

function OrbitIcon() {
  return (
    <svg {...iconProps}>
      <path d="M21 12a9 9 0 1 1-3-6.7" />
      <polyline points="21 3 21 9 15 9" />
    </svg>
  );
}

function ZoomIcon() {
  return (
    <svg {...iconProps}>
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
      <line x1="11" y1="8" x2="11" y2="14" />
      <line x1="8" y1="11" x2="14" y2="11" />
    </svg>
  );
}

function PanIcon() {
  return (
    <svg {...iconProps}>
      <polyline points="5 9 2 12 5 15" />
      <polyline points="9 5 12 2 15 5" />
      <polyline points="15 19 12 22 9 19" />
      <polyline points="19 9 22 12 19 15" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <line x1="12" y1="2" x2="12" y2="22" />
    </svg>
  );
}