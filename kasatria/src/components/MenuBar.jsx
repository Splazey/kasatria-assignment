const ARRANGEMENTS = ['table', 'sphere', 'double-Helix', 'grid'];

export default function MenuBar({ onSelect }) {
  return (
    <div className="menu-bar">
      {ARRANGEMENTS.map((name) => (
        <button key={name} className="menu-btn" onClick={() => onSelect(name)}>
          {name[0].toUpperCase() + name.slice(1)}
        </button>
      ))}
    </div>
  );
}
