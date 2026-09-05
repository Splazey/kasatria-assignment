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

// Matches the OrbitControls button mapping used in Visualization.jsx
export default function Instructions() {
  return (
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
  );
}
