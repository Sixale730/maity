import * as THREE from 'three';
import { MountainNode } from '../../../hooks/useGamifiedDashboardData';

const VIEW = 100;

export function createGradientTexture(
  w: number, h: number,
  stops: { offset: number; color: string }[]
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  for (const s of stops) {
    grad.addColorStop(s.offset, s.color);
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

export function shapeFromPoints(pts: number[][]): THREE.Shape {
  const shape = new THREE.Shape();
  if (pts.length < 2) return shape;
  shape.moveTo(pts[0][0], VIEW - pts[0][1]);
  for (let i = 1; i < pts.length; i++) {
    shape.lineTo(pts[i][0], VIEW - pts[i][1]);
  }
  shape.closePath();
  return shape;
}

export function polygonStringToShape(pointsStr: string): THREE.Shape {
  const coords = pointsStr.split(' ').map(p => {
    const [x, y] = p.split(',').map(Number);
    return [x, y];
  });
  return shapeFromPoints(coords);
}

export function getQuadraticCurvePoints(nodes: MountainNode[]): THREE.Vector3[] {
  const result: THREE.Vector3[] = [];
  if (nodes.length < 2) return result;
  result.push(new THREE.Vector3(nodes[0].x, VIEW - nodes[0].y, 0));
  for (let i = 1; i < nodes.length; i++) {
    const prev = nodes[i - 1];
    const curr = nodes[i];
    const cpX = (prev.x + curr.x) / 2;
    const steps = 10;
    for (let s = 1; s <= steps; s++) {
      const t = s / steps;
      const x = (1-t)*(1-t)*prev.x + 2*(1-t)*t*cpX + t*t*curr.x;
      const y = (1-t)*(1-t)*prev.y + 2*(1-t)*t*prev.y + t*t*curr.y;
      result.push(new THREE.Vector3(x, VIEW - y, 0));
    }
  }
  return result;
}
