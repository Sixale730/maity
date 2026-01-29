import { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';
import { MountainMapRendererProps, ENEMIES, NODE_COLORS, THEME, parseSVGPathToPoints } from '../mountain-map-types';
import { MountainNode } from '../../../hooks/useGamifiedDashboardData';
import {
  VOLCANO_PATH, CRATER_PATH, STARS, BG_MOUNTAINS, PIXEL_BLOCKS,
  STRATA, LEFT_LAVA, RIGHT_LAVA, EMBERS, BASE_ROCKS, SMOKE_CLOUDS, VOLCANIC_CRACKS,
} from '../mountain-data';

const VIEW = 100; // coordinate space

function hex(color: string): number {
  return parseInt(color.replace('#', ''), 16);
}

function createGradientTexture(
  renderer: PIXI.IRenderer,
  w: number, h: number,
  stops: { offset: number; color: string }[]
): PIXI.Texture {
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
  return PIXI.Texture.from(canvas);
}

function drawPolygonFromPoints(g: PIXI.Graphics, pts: number[][], sx: number, sy: number, color: number, alpha: number) {
  if (pts.length < 2) return;
  g.beginFill(color, alpha);
  g.moveTo(pts[0][0] * sx, pts[0][1] * sy);
  for (let i = 1; i < pts.length; i++) {
    g.lineTo(pts[i][0] * sx, pts[i][1] * sy);
  }
  g.closePath();
  g.endFill();
}

function drawQuadraticPath(g: PIXI.Graphics, nodes: MountainNode[], sx: number, sy: number) {
  if (nodes.length < 2) return;
  g.moveTo(nodes[0].x * sx, nodes[0].y * sy);
  for (let i = 1; i < nodes.length; i++) {
    const prev = nodes[i - 1];
    const curr = nodes[i];
    const cpX = ((prev.x + curr.x) / 2) * sx;
    g.quadraticCurveTo(cpX, prev.y * sy, curr.x * sx, curr.y * sy);
  }
}

export default function MountainMapPixi({ nodes, completedNodes }: MountainMapRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const size = Math.min(rect.width, rect.height) || 600;

    const app = new PIXI.Application({
      width: size,
      height: size,
      backgroundAlpha: 0,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });
    container.appendChild(app.view as HTMLCanvasElement);
    appRef.current = app;

    const sx = size / VIEW;
    const sy = size / VIEW;

    // === SKY BACKGROUND ===
    const skyTexture = createGradientTexture(app.renderer, size, size, [
      { offset: 0, color: THEME.skyTop },
      { offset: 0.6, color: THEME.skyMid },
      { offset: 1, color: THEME.skyBottom },
    ]);
    const sky = new PIXI.Sprite(skyTexture);
    sky.width = size;
    sky.height = size;
    app.stage.addChild(sky);

    // === STARS with halos for twinkle stars ===
    const starsG = new PIXI.Graphics();
    for (const star of STARS) {
      // Halo for twinkle stars
      if (star.twinkle) {
        const halo = new PIXI.Graphics();
        halo.beginFill(0xffffff, star.opacity * 0.15);
        halo.drawCircle(star.x * sx + star.size * sx / 2, star.y * sy + star.size * sy / 2, star.size * sx * 3);
        halo.endFill();
        halo.filters = [new PIXI.BlurFilter(3)];
        app.stage.addChild(halo);
      }
      starsG.beginFill(0xffffff, star.opacity);
      starsG.drawRect(star.x * sx, star.y * sy, star.size * sx, star.size * sy);
      starsG.endFill();
    }
    app.stage.addChild(starsG);

    // === BG MOUNTAINS ===
    const bgG = new PIXI.Graphics();
    for (const mt of BG_MOUNTAINS) {
      const coords = mt.points.split(' ').map(p => {
        const [x, y] = p.split(',').map(Number);
        return [x, y];
      });
      drawPolygonFromPoints(bgG, coords, sx, sy, hex(mt.fill), mt.opacity);
    }
    app.stage.addChild(bgG);

    // === SUMMIT GLOW ===
    const glowG = new PIXI.Graphics();
    glowG.beginFill(hex(THEME.lavaOrange), 0.2);
    glowG.drawEllipse(50 * sx, 5 * sy, 18 * sx, 14 * sy);
    glowG.endFill();
    app.stage.addChild(glowG);

    // === CRATER INTERIOR ===
    const craterPts = parseSVGPathToPoints(CRATER_PATH);
    const craterG = new PIXI.Graphics();
    drawPolygonFromPoints(craterG, craterPts, sx, sy, hex(THEME.craterMid), 1);
    // Lava pool
    craterG.beginFill(hex(THEME.lavaYellow), 0.9);
    craterG.drawRect(47 * sx, 9 * sy, 6 * sx, 2.5 * sy);
    craterG.endFill();
    // Lava bubbles
    craterG.beginFill(hex(THEME.bubbleColor), 0.7);
    craterG.drawCircle(48.5 * sx, 10 * sy, 0.5 * sx);
    craterG.endFill();
    craterG.beginFill(hex(THEME.bubbleColor), 0.6);
    craterG.drawCircle(52 * sx, 10.5 * sy, 0.4 * sx);
    craterG.endFill();
    app.stage.addChild(craterG);

    // === VOLCANO BODY ===
    const volcPts = parseSVGPathToPoints(VOLCANO_PATH);
    const volcG = new PIXI.Graphics();
    const mtTexture = createGradientTexture(app.renderer, size, size, [
      { offset: 0, color: THEME.mountainTop },
      { offset: 0.15, color: THEME.mountainUpper },
      { offset: 0.4, color: THEME.mountainMid },
      { offset: 1, color: THEME.mountainBottom },
    ]);
    volcG.beginTextureFill({ texture: mtTexture });
    if (volcPts.length > 1) {
      volcG.moveTo(volcPts[0][0] * sx, volcPts[0][1] * sy);
      for (let i = 1; i < volcPts.length; i++) {
        volcG.lineTo(volcPts[i][0] * sx, volcPts[i][1] * sy);
      }
      volcG.closePath();
    }
    volcG.endFill();
    volcG.lineStyle(0.3 * sx, hex('#2a2a4e'), 1);
    if (volcPts.length > 1) {
      volcG.moveTo(volcPts[0][0] * sx, volcPts[0][1] * sy);
      for (let i = 1; i < volcPts.length; i++) {
        volcG.lineTo(volcPts[i][0] * sx, volcPts[i][1] * sy);
      }
      volcG.closePath();
    }
    app.stage.addChild(volcG);

    // === STRATA ===
    const strataG = new PIXI.Graphics();
    for (const s of STRATA) {
      strataG.lineStyle(0.3 * sx, hex(s.color), 0.4);
      const dx = s.x2 - s.x1;
      const steps = Math.ceil(Math.abs(dx) / 3);
      for (let i = 0; i < steps; i++) {
        const t0 = i / steps;
        const t1 = (i + 0.6) / steps;
        strataG.moveTo((s.x1 + dx * t0) * sx, s.y1 * sy);
        strataG.lineTo((s.x1 + dx * Math.min(t1, 1)) * sx, s.y2 * sy);
      }
    }
    app.stage.addChild(strataG);

    // === PIXEL BLOCKS ===
    const pixelG = new PIXI.Graphics();
    for (const b of PIXEL_BLOCKS) {
      pixelG.beginFill(hex(b.color), b.opacity);
      pixelG.drawRect(b.x * sx, b.y * sy, b.w * sx, b.h * sy);
      pixelG.endFill();
    }
    app.stage.addChild(pixelG);

    // === VOLCANIC CRACKS ===
    const cracksG = new PIXI.Graphics();
    for (const crack of VOLCANIC_CRACKS) {
      const pts = parseSVGPathToPoints(crack.d);
      if (pts.length < 2) continue;
      cracksG.lineStyle(0.3 * sx, hex(crack.color), crack.opacity);
      cracksG.moveTo(pts[0][0] * sx, pts[0][1] * sy);
      for (let i = 1; i < pts.length; i++) {
        cracksG.lineTo(pts[i][0] * sx, pts[i][1] * sy);
      }
    }
    app.stage.addChild(cracksG);

    // === LAVA GLOW with blur + additive blend ===
    const lavaGlowG = new PIXI.Graphics();
    lavaGlowG.beginFill(hex(THEME.lavaOrange), 0.3);
    lavaGlowG.drawEllipse(50 * sx, 5 * sy, 10 * sx, 8 * sy);
    lavaGlowG.endFill();
    lavaGlowG.beginFill(hex('#5a2a2a'), 0.8);
    lavaGlowG.drawRect(40 * sx, 4.5 * sy, 2 * sx, 1 * sy);
    lavaGlowG.drawRect(58 * sx, 4.5 * sy, 2 * sx, 1 * sy);
    lavaGlowG.endFill();
    lavaGlowG.filters = [new PIXI.BlurFilter(4)];
    lavaGlowG.blendMode = PIXI.BLEND_MODES.ADD;
    app.stage.addChild(lavaGlowG);

    // === LAVA STREAMS ===
    const lavaG = new PIXI.Graphics();
    for (const lv of [...LEFT_LAVA, ...RIGHT_LAVA]) {
      lavaG.beginFill(hex(THEME.lavaStreamTop), 0.8);
      lavaG.drawRect(lv.x * sx, lv.y * sy, lv.w * sx, lv.h * sy);
      lavaG.endFill();
    }
    app.stage.addChild(lavaG);

    // === EMBERS with additive blend ===
    interface EmberObj { gfx: PIXI.Graphics; baseX: number; baseY: number }
    const emberObjects: EmberObj[] = [];
    const embersContainer = new PIXI.Container();
    embersContainer.blendMode = PIXI.BLEND_MODES.ADD;
    for (const e of EMBERS) {
      const eg = new PIXI.Graphics();
      eg.beginFill(hex(THEME.emberColor), 0.9);
      eg.drawCircle(0, 0, e.r * sx);
      eg.endFill();
      eg.position.set(e.cx * sx, e.cy * sy);
      embersContainer.addChild(eg);
      emberObjects.push({ gfx: eg, baseX: e.cx * sx, baseY: e.cy * sy });
    }
    app.stage.addChild(embersContainer);

    // === SMOKE with blur ===
    const smokeG = new PIXI.Graphics();
    for (const cloud of SMOKE_CLOUDS) {
      smokeG.beginFill(hex(THEME.smoke), cloud.opacity);
      smokeG.drawEllipse(cloud.cx * sx, cloud.cy * sy, cloud.rx * sx, cloud.ry * sy);
      smokeG.endFill();
    }
    smokeG.filters = [new PIXI.AlphaFilter(0.5), new PIXI.BlurFilter(6)];
    app.stage.addChild(smokeG);

    // === GROUND ===
    const groundG = new PIXI.Graphics();
    const groundPts = [
      [5,96],[8,96],[8,95],[15,95],[15,96],[30,96],[30,95.5],[45,95.5],
      [45,96],[60,96],[60,95],[75,95],[75,96],[88,96],[88,95.5],[95,95.5],[95,96],
    ];
    groundG.lineStyle(0.3 * sx, hex(THEME.ground), 0.6);
    groundG.moveTo(groundPts[0][0] * sx, groundPts[0][1] * sy);
    for (let i = 1; i < groundPts.length; i++) {
      groundG.lineTo(groundPts[i][0] * sx, groundPts[i][1] * sy);
    }
    groundG.beginFill(hex(THEME.lavaOrange), 0.08);
    groundG.drawEllipse(50 * sx, 96 * sy, 40 * sx, 6 * sy);
    groundG.endFill();
    app.stage.addChild(groundG);

    // === BASE ROCKS ===
    const rocksG = new PIXI.Graphics();
    for (const r of BASE_ROCKS) {
      rocksG.beginFill(hex(THEME.baseRock), 0.7);
      rocksG.drawRect(r.x * sx, r.y * sy, r.w * sx, r.h * sy);
      rocksG.endFill();
      rocksG.lineStyle(0.15 * sx, hex(THEME.baseRockStroke), 0.7);
      rocksG.drawRect(r.x * sx, r.y * sy, r.w * sx, r.h * sy);
    }
    app.stage.addChild(rocksG);

    // === PATHS ===
    const pathsG = new PIXI.Graphics();
    if (nodes.length >= 2) {
      pathsG.lineStyle(0.4 * sx, hex(THEME.pathSkeleton), 0.4);
      drawQuadraticPath(pathsG, nodes, sx, sy);
    }
    const completed = nodes.filter(n => n.status === 'completed' || n.status === 'current');
    if (completed.length >= 2) {
      pathsG.lineStyle(0.5 * sx, hex(NODE_COLORS.completed), 0.7);
      drawQuadraticPath(pathsG, completed, sx, sy);
    }
    app.stage.addChild(pathsG);

    // === ENEMIES ===
    for (const enemy of ENEMIES) {
      const node = nodes[enemy.nodeIndex];
      if (!node) continue;
      const xPos = node.x > 50 ? (node.x - 12) * sx : (node.x + 5) * sx;
      const yPos = (node.y - 4) * sy;
      const text = new PIXI.Text(`${enemy.icon} ${enemy.name}`, {
        fontSize: Math.round(2 * sy),
        fill: THEME.lavaOrange,
        fontWeight: 'bold',
      });
      text.position.set(xPos, yPos);
      text.alpha = 0.9;
      app.stage.addChild(text);
    }

    // === NODES with glow blur ===
    let currentNodeGfx: PIXI.Container | null = null;
    for (const node of nodes) {
      const cx = node.x * sx;
      const cy = node.y * sy;
      const r = 1.8 * sx;
      const nodeContainer = new PIXI.Container();

      // Node glow with blur for completed/current
      if (node.status !== 'locked') {
        const nodeGlow = new PIXI.Graphics();
        nodeGlow.beginFill(hex(NODE_COLORS[node.status]), 0.25);
        nodeGlow.drawCircle(cx, cy, r * 2);
        nodeGlow.endFill();
        nodeGlow.filters = [new PIXI.BlurFilter(2)];
        nodeContainer.addChild(nodeGlow);
      }

      // Current node outer glow
      if (node.status === 'current') {
        const outerGlow = new PIXI.Graphics();
        outerGlow.beginFill(hex(NODE_COLORS.current), 0.15);
        outerGlow.drawCircle(cx, cy, 3.5 * sx);
        outerGlow.endFill();
        nodeContainer.addChild(outerGlow);
      }

      // Glow ring
      if (node.status !== 'locked') {
        const glowRing = new PIXI.Graphics();
        glowRing.beginFill(hex(NODE_COLORS[node.status]), 0.2);
        glowRing.drawCircle(cx, cy, r * 1.6);
        glowRing.endFill();
        nodeContainer.addChild(glowRing);
      }

      // Node body
      const ng = new PIXI.Graphics();
      const fillColor = node.status === 'completed'
        ? NODE_COLORS.completed
        : node.status === 'current'
          ? NODE_COLORS.current
          : '#1a1a2e';
      ng.beginFill(hex(fillColor), 1);
      ng.drawCircle(cx, cy, r);
      ng.endFill();
      ng.lineStyle(0.4 * sx, hex(NODE_COLORS[node.status]), 1);
      ng.drawCircle(cx, cy, r);
      nodeContainer.addChild(ng);

      app.stage.addChild(nodeContainer);

      // Track current node for animation
      if (node.status === 'current') {
        currentNodeGfx = nodeContainer;
      }

      // Node number
      const numText = new PIXI.Text(`${node.index + 1}`, {
        fontSize: Math.round(1.8 * sy),
        fill: node.status === 'locked' ? '#666666' : '#ffffff',
        fontWeight: 'bold',
      });
      numText.anchor.set(0.5, 0.5);
      numText.position.set(cx, cy);
      app.stage.addChild(numText);
    }

    // === TICKER ANIMATIONS ===
    app.ticker.add(() => {
      const t = Date.now() / 1000;

      // Lava pulse
      lavaG.alpha = 0.5 + Math.sin(t) * 0.2;

      // Smoke drift Y
      smokeG.y = Math.sin(t * 0.5) * 2 * sy;

      // Ember drift
      EMBERS.forEach((e, i) => {
        const obj = emberObjects[i];
        if (!obj) return;
        const phase = t / e.dur * Math.PI * 2;
        obj.gfx.position.x = obj.baseX + Math.sin(phase) * e.driftX * sx;
        obj.gfx.position.y = obj.baseY + Math.sin(phase) * Math.abs(e.driftY) * sy;
        obj.gfx.alpha = 0.5 + Math.sin(phase) * 0.4;
      });

      // Current node scale pulse
      if (currentNodeGfx) {
        const s = 1 + Math.sin(t * 2) * 0.15;
        currentNodeGfx.scale.set(s, s);
      }
    });

    return () => {
      app.destroy(true, { children: true, texture: true });
      appRef.current = null;
    };
  }, [nodes, completedNodes]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full min-h-[400px] flex items-center justify-center"
      style={{ background: 'transparent' }}
    />
  );
}
