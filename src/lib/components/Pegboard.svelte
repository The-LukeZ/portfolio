<!--
  Perforated steel backdrop: the wall the parts cabinet hangs on.
  A slow raking light crosses the sheet diagonally; holes catch it as it passes,
  a few of them glint. On fine pointers a faint work lamp follows the cursor.
  Reduced motion: one still frame, no loop. Pauses while the tab is hidden.
-->
<script lang="ts">
  import { onMount } from "svelte";

  let canvas: HTMLCanvasElement;

  const PITCH = 26; // px between hole centers
  const RADIUS = 1.5; // hole radius, css px
  const SWEEP_MS = 9000; // one pass of the raking light
  const BAND = 260; // width of the light band, px
  const LAMP = 170; // cursor lamp radius, px
  const LEVELS = 24; // quantized brightness steps, one path per step
  const FRAME_MS = 1000 / 30;

  // Hole colors (linear interpolation in sRGB, close to the steel ramp)
  const DARK = [33, 35, 39];
  const LIT = [104, 108, 116];

  onMount(() => {
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(pointer: fine)");

    let w = 0;
    let h = 0;
    let cols = 0;
    let rows = 0;
    let glint = new Float32Array(0); // per-hole sparkle weight, fixed per hole
    let raf = 0;
    let last = 0;
    let start = performance.now();

    const lamp = { x: -9999, y: -9999, tx: -9999, ty: -9999, a: 0, ta: 0 };

    const fills = Array.from({ length: LEVELS }, (_, i) => {
      const t = i / (LEVELS - 1);
      const c = DARK.map((d, k) => Math.round(d + (LIT[k] - d) * t));
      return `rgb(${c[0]} ${c[1]} ${c[2]})`;
    });

    // Cheap deterministic hash so every reload shows the same sheet
    const hash = (x: number, y: number) => {
      let n = (x * 374761393 + y * 668265263) | 0;
      n = Math.imul(n ^ (n >>> 13), 1274126177);
      return ((n ^ (n >>> 16)) >>> 0) / 4294967295;
    };

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(w / PITCH) + 1;
      rows = Math.ceil(h / PITCH) + 1;
      glint = new Float32Array(cols * rows);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const v = hash(c, r);
          // most holes are plain; roughly one in nine catches the light hard
          glint[r * cols + c] = v > 0.89 ? 1 : 0.35 + v * 0.25;
        }
      }
    }

    function draw(now: number) {
      // Diagonal light position, travelling top-left to bottom-right, off-screen at both ends
      const span = w * 0.8 + h * 0.6 + BAND * 4;
      const phase = ((now - start) % SWEEP_MS) / SWEEP_MS;
      const pos = reduced.matches ? span * 0.42 - BAND * 2 : phase * span - BAND * 2;

      lamp.x += (lamp.tx - lamp.x) * 0.12;
      lamp.y += (lamp.ty - lamp.y) * 0.12;
      lamp.a += (lamp.ta - lamp.a) * 0.08;

      ctx!.fillStyle = "rgb(22 23 26)";
      ctx!.fillRect(0, 0, w, h);

      const paths: Path2D[] = Array.from({ length: LEVELS }, () => new Path2D());
      const offX = (w % PITCH) / 2;
      const offY = (h % PITCH) / 2;
      const invBand = 1 / BAND;
      const invLamp2 = 1 / (LAMP * LAMP);

      for (let r = 0; r < rows; r++) {
        const y = offY + r * PITCH;
        for (let c = 0; c < cols; c++) {
          const x = offX + c * PITCH;
          const d = (x * 0.8 + y * 0.6 - pos) * invBand;
          const band = Math.exp(-d * d);
          let light = band * glint[r * cols + c];

          if (lamp.a > 0.01) {
            const dx = x - lamp.x;
            const dy = y - lamp.y;
            const q = (dx * dx + dy * dy) * invLamp2;
            if (q < 1) light += (1 - q) * (1 - q) * 0.45 * lamp.a;
          }

          const lvl = Math.min(LEVELS - 1, Math.round(light * (LEVELS - 1)));
          paths[lvl].moveTo(x + RADIUS, y);
          paths[lvl].arc(x, y, RADIUS, 0, Math.PI * 2);
        }
      }

      for (let i = 0; i < LEVELS; i++) {
        ctx!.fillStyle = fills[i];
        ctx!.fill(paths[i]);
      }
    }

    function loop(now: number) {
      raf = requestAnimationFrame(loop);
      if (now - last < FRAME_MS) return;
      last = now;
      draw(now);
    }

    function startLoop() {
      cancelAnimationFrame(raf);
      if (reduced.matches) {
        draw(performance.now());
      } else {
        raf = requestAnimationFrame(loop);
      }
    }

    function onResize() {
      resize();
      draw(performance.now());
    }

    function onPointerMove(e: PointerEvent) {
      if (!finePointer.matches || reduced.matches) return;
      if (lamp.a < 0.01) {
        lamp.x = e.clientX;
        lamp.y = e.clientY;
      }
      lamp.tx = e.clientX;
      lamp.ty = e.clientY;
      lamp.ta = 1;
    }

    function onPointerLeave() {
      lamp.ta = 0;
    }

    function onVisibility() {
      if (document.hidden) {
        cancelAnimationFrame(raf);
      } else {
        startLoop();
      }
    }

    resize();
    startLoop();

    window.addEventListener("resize", onResize);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onPointerLeave);
    document.addEventListener("visibilitychange", onVisibility);
    reduced.addEventListener("change", startLoop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener("pointerleave", onPointerLeave);
      document.removeEventListener("visibilitychange", onVisibility);
      reduced.removeEventListener("change", startLoop);
    };
  });
</script>

<canvas bind:this={canvas} class="pegboard" aria-hidden="true"></canvas>

<style>
  .pegboard {
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100%;
    z-index: -1;
    pointer-events: none;
    display: block;
  }
</style>
