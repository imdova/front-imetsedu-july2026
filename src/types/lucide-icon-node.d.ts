/**
 * lucide-react ships each icon as its own module, and each exports the raw path
 * data as `__iconNode` alongside the component. The package has no type
 * declarations for those deep paths; this one covers them so the card-icon
 * sprite can read the paths directly.
 */
declare module "lucide-react/dist/esm/icons/*.mjs" {
  export const __iconNode: [tag: string, attrs: Record<string, string>][];
}
