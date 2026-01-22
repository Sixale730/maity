declare module 'imagetracerjs' {
  interface ImageTracerOptions {
    /** Number of colors to use (2-256) */
    numberofcolors?: number;
    /** Color sampling method (0-2) */
    colorsampling?: number;
    /** Minimum ratio for color detection */
    mincolorratio?: number;
    /** Number of color quantization cycles */
    colorquantcycles?: number;
    /** Line threshold for path tracing */
    ltres?: number;
    /** Quadratic spline threshold */
    qtres?: number;
    /** Minimum path size to keep */
    pathomit?: number;
    /** Blur radius for preprocessing */
    blurradius?: number;
    /** Blur delta */
    blurdelta?: number;
    /** Stroke width in output */
    strokewidth?: number;
    /** Enable line filter */
    linefilter?: boolean;
    /** Scale factor for output */
    scale?: number;
    /** Round coordinates to decimal places */
    roundcoords?: number;
    /** Include viewBox attribute */
    viewbox?: boolean;
    /** Include description */
    desc?: boolean;
    /** Line control point radius */
    lcpr?: number;
    /** Quadratic control point radius */
    qcpr?: number;
  }

  interface ImageTracer {
    imagedataToSVG(imageData: ImageData, options?: ImageTracerOptions): string;
    imageToSVG(url: string, callback: (svgStr: string) => void, options?: ImageTracerOptions): void;
  }

  const imageTracer: ImageTracer;
  export default imageTracer;
}
