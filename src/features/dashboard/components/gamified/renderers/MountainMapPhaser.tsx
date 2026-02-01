import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { MountainMapRendererProps, ENEMIES, NODE_COLORS, THEME, parseSVGPathToPoints } from '../mountain-map-types';
import { MountainNode } from '../../../hooks/useGamifiedDashboardData';
import {
  VOLCANO_PATH, CRATER_PATH, STARS, BG_MOUNTAINS, PIXEL_BLOCKS,
  STRATA, LEFT_LAVA, RIGHT_LAVA, EMBERS, BASE_ROCKS, SMOKE_CLOUDS, VOLCANIC_CRACKS,
} from '../mountain-data';

const W = 800;
const H = 800;

class VolcanoScene extends Phaser.Scene {
  private nodes: MountainNode[] = [];
  private completedNodes = 0;

  init(data: { nodes: MountainNode[]; completedNodes: number }) {
    this.nodes = data.nodes;
    this.completedNodes = data.completedNodes;
  }

  create() {
    const sx = W / 100;
    const sy = H / 100;

    this.drawSky(sx, sy);
    this.drawStarsAnimated(sx, sy);
    this.drawBgMountains(sx, sy);
    this.drawCraterInterior(sx, sy);
    this.drawVolcanoBody(sx, sy);
    this.drawStrata(sx, sy);
    this.drawPixelBlocks(sx, sy);
    this.drawVolcanicCracks(sx, sy);
    this.drawLavaGlow(sx, sy);
    this.drawLavaStreamsAnimated(sx, sy);
    this.drawEmbersAnimated(sx, sy);
    this.drawSmokeClouds(sx, sy);
    this.drawGround(sx, sy);
    this.drawBaseRocks(sx, sy);
    this.drawPaths(sx, sy);
    this.drawEnemies(sx, sy);
    this.drawNodesAnimated(sx, sy);
    this.drawCRTOverlay();
  }

  private drawSky(sx: number, sy: number) {
    const g = this.add.graphics();
    const bands = 20;
    for (let i = 0; i < bands; i++) {
      const t = i / bands;
      const color = t < 0.6
        ? lerpColor(THEME.skyTop, THEME.skyMid, t / 0.6)
        : lerpColor(THEME.skyMid, THEME.skyBottom, (t - 0.6) / 0.4);
      g.fillStyle(hexToNum(color), 1);
      g.fillRect(0, (i / bands) * H, W, H / bands + 1);
    }
  }

  private drawStarsAnimated(sx: number, sy: number) {
    for (let i = 0; i < STARS.length; i++) {
      const star = STARS[i];
      const starGfx = this.add.graphics();
      starGfx.fillStyle(0xffffff, star.opacity);
      starGfx.fillRect(star.x * sx, star.y * sy, star.size * sx, star.size * sy);

      if (star.twinkle) {
        this.tweens.add({
          targets: starGfx,
          alpha: { from: star.opacity, to: star.opacity * 0.2 },
          yoyo: true,
          repeat: -1,
          duration: 2000 + (i % 3) * 1000,
          ease: 'Sine.easeInOut',
        });
      }
    }
  }

  private drawBgMountains(sx: number, sy: number) {
    const g = this.add.graphics();
    for (const mt of BG_MOUNTAINS) {
      const coords = mt.points.split(' ').map(p => {
        const [x, y] = p.split(',').map(Number);
        return { x: x * sx, y: y * sy };
      });
      g.fillStyle(hexToNum(mt.fill), mt.opacity);
      g.beginPath();
      g.moveTo(coords[0].x, coords[0].y);
      for (let i = 1; i < coords.length; i++) {
        g.lineTo(coords[i].x, coords[i].y);
      }
      g.closePath();
      g.fillPath();
    }
  }

  private drawCraterInterior(sx: number, sy: number) {
    const g = this.add.graphics();
    const pts = parseSVGPathToPoints(CRATER_PATH);
    if (pts.length < 2) return;
    g.fillStyle(hexToNum(THEME.craterMid), 1);
    g.beginPath();
    g.moveTo(pts[0][0] * sx, pts[0][1] * sy);
    for (let i = 1; i < pts.length; i++) {
      g.lineTo(pts[i][0] * sx, pts[i][1] * sy);
    }
    g.closePath();
    g.fillPath();

    // Lava pool
    g.fillStyle(hexToNum(THEME.lavaYellow), 0.9);
    g.fillRect(47 * sx, 9 * sy, 6 * sx, 2.5 * sy);
  }

  private drawVolcanoBody(sx: number, sy: number) {
    const g = this.add.graphics();
    const pts = parseSVGPathToPoints(VOLCANO_PATH);
    if (pts.length < 2) return;

    g.fillStyle(hexToNum(THEME.mountainMid), 1);
    g.beginPath();
    g.moveTo(pts[0][0] * sx, pts[0][1] * sy);
    for (let i = 1; i < pts.length; i++) {
      g.lineTo(pts[i][0] * sx, pts[i][1] * sy);
    }
    g.closePath();
    g.fillPath();

    const upperG = this.add.graphics();
    upperG.fillStyle(hexToNum(THEME.mountainTop), 0.5);
    upperG.beginPath();
    upperG.moveTo(pts[0][0] * sx, pts[0][1] * sy);
    for (let i = 1; i < pts.length; i++) {
      const py = pts[i][1];
      if (py < 40) {
        upperG.lineTo(pts[i][0] * sx, pts[i][1] * sy);
      }
    }
    upperG.lineTo(74 * sx, 40 * sy);
    upperG.lineTo(26 * sx, 40 * sy);
    upperG.closePath();
    upperG.fillPath();

    g.lineStyle(0.3 * sx, hexToNum('#2a2a4e'), 1);
    g.beginPath();
    g.moveTo(pts[0][0] * sx, pts[0][1] * sy);
    for (let i = 1; i < pts.length; i++) {
      g.lineTo(pts[i][0] * sx, pts[i][1] * sy);
    }
    g.closePath();
    g.strokePath();
  }

  private drawStrata(sx: number, sy: number) {
    const g = this.add.graphics();
    for (const s of STRATA) {
      g.lineStyle(0.3 * sx, hexToNum(s.color), 0.4);
      const dx = s.x2 - s.x1;
      const steps = Math.ceil(Math.abs(dx) / 3);
      for (let i = 0; i < steps; i++) {
        const t0 = i / steps;
        const t1 = (i + 0.6) / steps;
        g.beginPath();
        g.moveTo((s.x1 + dx * t0) * sx, s.y1 * sy);
        g.lineTo((s.x1 + dx * Math.min(t1, 1)) * sx, s.y2 * sy);
        g.strokePath();
      }
    }
  }

  private drawPixelBlocks(sx: number, sy: number) {
    const g = this.add.graphics();
    for (const b of PIXEL_BLOCKS) {
      g.fillStyle(hexToNum(b.color), b.opacity);
      g.fillRect(b.x * sx, b.y * sy, b.w * sx, b.h * sy);
    }
  }

  private drawVolcanicCracks(sx: number, sy: number) {
    const g = this.add.graphics();
    for (const crack of VOLCANIC_CRACKS) {
      const pts = parseSVGPathToPoints(crack.d);
      if (pts.length < 2) continue;
      g.lineStyle(0.3 * sx, hexToNum(crack.color), crack.opacity);
      g.beginPath();
      g.moveTo(pts[0][0] * sx, pts[0][1] * sy);
      for (let i = 1; i < pts.length; i++) {
        g.lineTo(pts[i][0] * sx, pts[i][1] * sy);
      }
      g.strokePath();
    }
  }

  private drawLavaGlow(sx: number, sy: number) {
    const g = this.add.graphics();
    g.fillStyle(hexToNum(THEME.lavaOrange), 0.3);
    g.fillEllipse(50 * sx, 5 * sy, 20 * sx, 16 * sy);
    g.fillStyle(hexToNum(THEME.lavaRed), 0.15);
    g.fillEllipse(50 * sx, 5 * sy, 14 * sx, 10 * sy);

    g.fillStyle(hexToNum('#5a2a2a'), 0.8);
    g.fillRect(40 * sx, 4.5 * sy, 2 * sx, 1 * sy);
    g.fillRect(58 * sx, 4.5 * sy, 2 * sx, 1 * sy);
  }

  private drawLavaStreamsAnimated(sx: number, sy: number) {
    const allLava = [...LEFT_LAVA, ...RIGHT_LAVA];
    for (const lv of allLava) {
      const lavaGfx = this.add.graphics();
      lavaGfx.fillStyle(hexToNum(THEME.lavaStreamTop), 0.8);
      lavaGfx.fillRect(lv.x * sx, lv.y * sy, lv.w * sx, lv.h * sy);

      this.tweens.add({
        targets: lavaGfx,
        alpha: { from: 0.5, to: 0.9 },
        yoyo: true,
        repeat: -1,
        delay: lv.delay * 1000,
        duration: 2500,
        ease: 'Sine.easeInOut',
      });
    }
  }

  private drawEmbersAnimated(sx: number, sy: number) {
    for (const e of EMBERS) {
      const emberGfx = this.add.graphics();
      emberGfx.fillStyle(hexToNum(THEME.emberColor), 0.9);
      emberGfx.fillCircle(e.cx * sx, e.cy * sy, e.r * sx);

      this.tweens.add({
        targets: emberGfx,
        x: e.driftX * sx,
        y: e.driftY * sy,
        alpha: 0,
        yoyo: true,
        repeat: -1,
        duration: e.dur * 1000,
        ease: 'Sine.easeInOut',
      });
    }
  }

  private drawSmokeClouds(sx: number, sy: number) {
    const g = this.add.graphics();
    for (const cloud of SMOKE_CLOUDS) {
      g.fillStyle(hexToNum(THEME.smoke), cloud.opacity);
      g.fillEllipse(cloud.cx * sx, cloud.cy * sy, cloud.rx * 2 * sx, cloud.ry * 2 * sy);
    }
  }

  private drawGround(sx: number, sy: number) {
    const g = this.add.graphics();
    const groundPts = [
      [5,96],[8,96],[8,95],[15,95],[15,96],[30,96],[30,95.5],[45,95.5],
      [45,96],[60,96],[60,95],[75,95],[75,96],[88,96],[88,95.5],[95,95.5],[95,96],
    ];
    g.lineStyle(0.3 * sx, hexToNum(THEME.ground), 0.6);
    g.beginPath();
    g.moveTo(groundPts[0][0] * sx, groundPts[0][1] * sy);
    for (let i = 1; i < groundPts.length; i++) {
      g.lineTo(groundPts[i][0] * sx, groundPts[i][1] * sy);
    }
    g.strokePath();

    g.fillStyle(hexToNum(THEME.lavaOrange), 0.08);
    g.fillEllipse(50 * sx, 96 * sy, 80 * sx, 12 * sy);
  }

  private drawBaseRocks(sx: number, sy: number) {
    const g = this.add.graphics();
    for (const r of BASE_ROCKS) {
      g.fillStyle(hexToNum(THEME.baseRock), 0.7);
      g.fillRect(r.x * sx, r.y * sy, r.w * sx, r.h * sy);
      g.lineStyle(0.15 * sx, hexToNum(THEME.baseRockStroke), 0.7);
      g.strokeRect(r.x * sx, r.y * sy, r.w * sx, r.h * sy);
    }
  }

  private drawPaths(sx: number, sy: number) {
    const nodes = this.nodes;
    if (nodes.length < 2) return;

    const g = this.add.graphics();

    g.lineStyle(0.4 * sx, hexToNum(THEME.pathSkeleton), 0.4);
    this.drawQuadraticPath(g, nodes, sx, sy);

    const completed = nodes.filter(n => n.status === 'completed' || n.status === 'current');
    if (completed.length >= 2) {
      g.lineStyle(0.5 * sx, hexToNum(NODE_COLORS.completed), 0.7);
      this.drawQuadraticPath(g, completed, sx, sy);
    }
  }

  private drawQuadraticPath(g: Phaser.GameObjects.Graphics, pts: MountainNode[], sx: number, sy: number) {
    g.beginPath();
    g.moveTo(pts[0].x * sx, pts[0].y * sy);
    for (let i = 1; i < pts.length; i++) {
      const prev = pts[i - 1];
      const curr = pts[i];
      const cpX = ((prev.x + curr.x) / 2) * sx;
      const steps = 10;
      for (let s = 1; s <= steps; s++) {
        const t = s / steps;
        const x = (1-t)*(1-t)*(prev.x * sx) + 2*(1-t)*t*cpX + t*t*(curr.x * sx);
        const y = (1-t)*(1-t)*(prev.y * sy) + 2*(1-t)*t*(prev.y * sy) + t*t*(curr.y * sy);
        g.lineTo(x, y);
      }
    }
    g.strokePath();
  }

  private drawEnemies(sx: number, sy: number) {
    for (const enemy of ENEMIES) {
      const node = this.nodes[enemy.nodeIndex];
      if (!node) continue;
      const xPos = node.x > 50 ? (node.x - 12) * sx : (node.x + 5) * sx;
      const yPos = (node.y - 4) * sy;
      this.add.text(xPos, yPos, `${enemy.icon} ${enemy.name}`, {
        fontSize: `${Math.round(2 * sy)}px`,
        color: THEME.lavaOrange,
        fontStyle: 'bold',
      }).setAlpha(0.9);
    }
  }

  private drawNodesAnimated(sx: number, sy: number) {
    for (const node of this.nodes) {
      const cx = node.x * sx;
      const cy = node.y * sy;
      const r = 1.8 * sx;

      // Container for bounce-in animation
      const container = this.add.container(cx, cy);
      container.setScale(0, 0);

      const g = this.add.graphics();
      g.setPosition(-cx, -cy); // offset to draw relative to container origin

      // Current node outer ring glow
      if (node.status === 'current') {
        g.fillStyle(hexToNum(NODE_COLORS.current), 0.15);
        g.fillCircle(cx, cy, 3.5 * sx);
      }

      // Node fill
      const fillColor = node.status === 'completed'
        ? NODE_COLORS.completed
        : node.status === 'current'
          ? NODE_COLORS.current
          : '#1a1a2e';
      g.fillStyle(hexToNum(fillColor), 1);
      g.fillCircle(cx, cy, r);

      // Node stroke
      g.lineStyle(0.4 * sx, hexToNum(NODE_COLORS[node.status]), 1);
      g.strokeCircle(cx, cy, r);

      // Glow for completed/current
      if (node.status !== 'locked') {
        const glow = this.add.graphics();
        glow.setPosition(-cx, -cy);
        glow.fillStyle(hexToNum(NODE_COLORS[node.status]), 0.2);
        glow.fillCircle(cx, cy, r * 1.6);
        container.add(glow);
      }

      container.add(g);

      // Node number
      const numText = this.add.text(0, 0, `${node.index + 1}`, {
        fontSize: `${Math.round(1.8 * sy)}px`,
        color: node.status === 'locked' ? '#666666' : '#ffffff',
        fontStyle: 'bold',
      }).setOrigin(0.5, 0.5);
      container.add(numText);

      // Bounce-in tween
      this.tweens.add({
        targets: container,
        scaleX: 1,
        scaleY: 1,
        ease: 'Back.easeOut',
        duration: 400,
        delay: node.index * 80,
      });

      // Current node pulse ring
      if (node.status === 'current') {
        const pulseRing = this.add.graphics();
        pulseRing.setPosition(-cx, -cy);
        pulseRing.lineStyle(0.5 * sx, hexToNum(NODE_COLORS.current), 0.5);
        pulseRing.strokeCircle(cx, cy, r * 1.2);
        container.add(pulseRing);

        this.tweens.add({
          targets: pulseRing,
          scaleX: 1.4,
          scaleY: 1.4,
          alpha: 0,
          repeat: -1,
          duration: 2000,
          ease: 'Sine.easeOut',
        });
      }
    }
  }

  private drawCRTOverlay() {
    const overlay = this.add.graphics();
    overlay.setDepth(999);

    // Scanlines - horizontal lines every 3px
    for (let y = 0; y < H; y += 3) {
      overlay.lineStyle(1, 0x000000, 0.12);
      overlay.beginPath();
      overlay.moveTo(0, y);
      overlay.lineTo(W, y);
      overlay.strokePath();
    }

    // Vignette - darker corners using ellipses
    const vCorners = [
      { x: 0, y: 0 },
      { x: W, y: 0 },
      { x: 0, y: H },
      { x: W, y: H },
    ];
    for (const corner of vCorners) {
      overlay.fillStyle(0x000000, 0.25);
      overlay.fillEllipse(corner.x, corner.y, W * 0.5, H * 0.5);
    }
  }
}

function hexToNum(hex: string): number {
  return parseInt(hex.replace('#', ''), 16);
}

function lerpColor(a: string, b: string, t: number): string {
  const ar = parseInt(a.slice(1, 3), 16);
  const ag = parseInt(a.slice(3, 5), 16);
  const ab = parseInt(a.slice(5, 7), 16);
  const br = parseInt(b.slice(1, 3), 16);
  const bg = parseInt(b.slice(3, 5), 16);
  const bb = parseInt(b.slice(5, 7), 16);
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const bl = Math.round(ab + (bb - ab) * t);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${bl.toString(16).padStart(2, '0')}`;
}

export default function MountainMapPhaser({ nodes, completedNodes }: MountainMapRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const { width, height } = container.getBoundingClientRect();
    const size = Math.max(width, height, 400);

    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: container,
      width: size,
      height: size,
      transparent: true,
      scene: VolcanoScene,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      banner: false,
      audio: { noAudio: true },
    });

    game.scene.start('default', { nodes, completedNodes });
    gameRef.current = game;

    return () => {
      game.destroy(true);
      gameRef.current = null;
    };
  }, [nodes, completedNodes]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full min-h-[400px]"
      style={{ background: 'transparent' }}
    />
  );
}
