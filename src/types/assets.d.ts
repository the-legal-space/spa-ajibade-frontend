// Ambient declarations for global (side-effect) stylesheet imports.
//
// Next.js only ships type declarations for CSS *modules* (`*.module.css`, etc.)
// in `next/types/global.d.ts`. Plain global stylesheets imported purely for their
// side effects (e.g. `import "./globals.css"` in `src/app/layout.tsx`) have no
// declaration, so TypeScript reports:
//   TS2307 / TS2882: Cannot find module or type declarations for side-effect import.
// when `noUncheckedSideEffectImports` is enabled.
//
// These shorthand module declarations tell TypeScript such imports are valid and
// intentionally untyped.

declare module "*.css";
declare module "*.scss";
declare module "*.sass";
declare module "*.less";
declare module "*.styl";
