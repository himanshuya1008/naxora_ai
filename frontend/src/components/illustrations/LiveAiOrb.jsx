import { Suspense, lazy } from 'react';
import AiFigureArt from './AiFigureArt.jsx';
import Canvas3DBoundary from './Canvas3DBoundary.jsx';

// three.js + @react-three/fiber is a genuinely heavy dependency for what is
// a purely decorative visual — lazy-loaded so it becomes its own async
// chunk and never blocks the initial page bundle/parse. Suspense's
// fallback and Canvas3DBoundary's fallback are the same AiFigureArt: while
// the 3D chunk is downloading AND if WebGL init fails outright, callers
// still show a real illustration, never an empty box.
//
// The one shared home for this lazy-load + fallback boilerplate — both
// HeroFigureScene.jsx (Home hero, with floating metric chips around it)
// and the AI Consultant hero use this directly, so there's exactly one
// place that knows how to mount the 3D scene safely.
const AiCoreScene = lazy(() => import('./AiCoreScene.jsx'));

/**
 * `size`: explicit square box in px (number). Omit to fill the parent
 * instead (e.g. inside an `absolute inset-0` wrapper with its own,
 * possibly responsive, dimensions) — used by HeroFigureScene.
 * `fallbackSize`: the AiFigureArt fallback's own intrinsic size; defaults
 * to `size` when given, otherwise 220 (AiFigureArt needs a real number,
 * not "fill parent", since its aspect ratio is fixed).
 * `fallbackTone`: forwarded to AiFigureArt's `tone` — matters on dark
 * backgrounds (the auth brand panel): the light-tone fallback is nearly
 * invisible there, same contrast bug already fixed once for the static art.
 */
export default function LiveAiOrb({ size, fallbackSize = size ?? 220, fallbackTone = 'light', className = '' }) {
  const style = typeof size === 'number' ? { width: size, height: size } : { width: '100%', height: '100%' };

  return (
    <div className={`flex items-center justify-center ${className}`} style={style}>
      <Canvas3DBoundary fallback={<AiFigureArt tone={fallbackTone} size={fallbackSize} />}>
        <Suspense fallback={<AiFigureArt tone={fallbackTone} size={fallbackSize} />}>
          <AiCoreScene />
        </Suspense>
      </Canvas3DBoundary>
    </div>
  );
}
