// [key, label] — key must match a layout name in lib/layouts.js
const ARRANGEMENTS = [
  ['table', 'Table'],
  ['sphere', 'Sphere'],
  ['helix', 'Double Helix'],
  ['grid', 'Grid'],
];

export default function MenuBar({ onSelect }) {
  return (
    <div className="menu-bar">
      {ARRANGEMENTS.map(([key, label]) => (
        <button key={key} className="menu-btn" onClick={() => onSelect(key)}>
          {label}
        </button>
      ))}
    </div>
  );
}
