// The bar's gradient lives in App.css (.legend-bar) and uses the same three
// stops as GRADIENT_STOPS in lib/colors.js
export default function Legend() {
  return (
    <div className="legend">
      <span>Low</span>
      <div className="legend-bar" />
      <span>High</span>
    </div>
  );
}
