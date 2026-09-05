// --- Continuous low -> mid -> high color gradient ---
// Same three hex stops used here and in the CSS legend gradient (App.css .legend-bar),
// so the cards and the legend always show the same colors.
// Exact reference colors at gradient positions 0, 0.5 and 1.
export const GRADIENT_STOPS = ['#EF3022', '#FDCA35', '#3A9F48'];

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex([r, g, b]) {
  return '#' + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
}

export function mixColors(hexA, hexB, t) {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  return rgbToHex(a.map((v, i) => v + (b[i] - v) * t));
}

export function hexToRgba(hex, alpha) {
  return `rgba(${hexToRgb(hex).join(', ')}, ${alpha})`;
}

// t=0 -> first stop, t=0.5 -> middle stop, t=1 -> last stop, smoothly in between
export function getGradientColor(t) {
  const clamped = Math.min(1, Math.max(0, t));
  return clamped < 0.5
    ? mixColors(GRADIENT_STOPS[0], GRADIENT_STOPS[1], clamped * 2)
    : mixColors(GRADIENT_STOPS[1], GRADIENT_STOPS[2], (clamped - 0.5) * 2);
}
