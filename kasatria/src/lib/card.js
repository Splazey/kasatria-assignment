import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer';
import { getGradientColor, mixColors, hexToRgba } from './colors';

// Builds one card as a CSS3DObject.
// `t` is 0..1: where this person's net worth sits between the dataset min and max.
export function createCard(item, t) {
  const borderColor = getGradientColor(t);
  const bgColor = mixColors(borderColor, '#000000', 0.55); // darker fill so text stays readable

  const element = document.createElement('div');
  element.className = 'element';
  element.style.backgroundColor = bgColor;
  element.style.border = `3px solid ${borderColor}`;
  element.style.boxShadow = `0 0 16px ${hexToRgba(borderColor, 0.5)}`; // subtle glow in the card's own color
  element.style.boxSizing = 'border-box';
  element.style.width = '120px';
  element.style.height = '160px';
  element.style.borderRadius = '3px';
  element.style.overflow = 'hidden';
  element.style.textAlign = 'center';
  element.style.cursor = 'default';
  element.style.fontFamily = "'Aleo', serif";
  element.style.pointerEvents = 'none';
  element.style.padding = '6px';
  element.style.color = '#fff';

  element.innerHTML = `
    <div style="display:flex; justify-content:space-between; font-size:9px; line-height:1;">
      <span>${item.country}</span><span>${item.age}</span>
    </div>
    <img src="${item.image}" draggable="false" style="width:100%; height:88px; object-fit:cover; margin-top:5px; display:block;" />
    <div style="font-size:10px; font-weight:bold; line-height:1.2; margin-top:6px;">${item.name}</div>
    <div style="font-size:9px; line-height:1.2; opacity:0.85;">${item.interest}</div>
  `;

  const objectCSS = new CSS3DObject(element);
  objectCSS.position.x = Math.random() * 4000 - 2000;
  objectCSS.position.y = Math.random() * 4000 - 2000;
  objectCSS.position.z = Math.random() * 4000 - 2000;
  return objectCSS;
}
