export const PUTER_WORKER_URL = import.meta.env.VITE_PUTER_WORKER_URL || "";

// Storage Paths
export const STORAGE_PATHS = {
    ROOT: "roomify",
    SOURCES: "roomify/sources",
    RENDERS: "roomify/renders",
} as const;

// Timing Constants (in milliseconds)
export const SHARE_STATUS_RESET_DELAY_MS = 1500;
export const PROGRESS_INCREMENT = 15;
export const REDIRECT_DELAY_MS = 600;
export const PROGRESS_INTERVAL_MS = 100;
export const PROGRESS_STEP = 5;

// UI Constants
export const GRID_OVERLAY_SIZE = "60px 60px";
export const GRID_COLOR = "#3B82F6";

// HTTP Status Codes
export const UNAUTHORIZED_STATUSES = [401, 403];

// Image Dimensions
export const IMAGE_RENDER_DIMENSION = 512;

export const ROOMIFY_RENDER_PROMPT = `
TASK: Convert the input 2D floor plan into a **photorealistic angled 3D architectural render** showing full spatial depth, walls, and realistic interiors.

STRICT REQUIREMENTS (do not violate):
1) **REMOVE ALL TEXT**: Do not render any letters, numbers, labels, or dimensions. Floors must be clean.
2) **GEOMETRY MUST MATCH**: Walls, rooms, doors, and windows must follow the plan layout exactly. Do not move or resize structural elements.
3) **ANGLED PERSPECTIVE VIEW**: Render from a slightly elevated 3/4 angle (not top-down), showing depth and spatial relationships.
4) **REALISTIC INTERIOR VISUALIZATION**: Include walls, ceilings (partially visible), realistic lighting, and materials.
5) **PROFESSIONAL QUALITY**: Clean, sharp, photorealistic architectural visualization. No sketch style.

STRUCTURE:
- Walls extruded to realistic height with correct thickness.
- Visible room depth and spatial volume.
- Doors placed correctly and shown realistically.
- Windows with glass and light interaction.

FURNITURE & INTERIOR (infer logically based on room type):
- Bedrooms → bed, side tables, lamps.
- Living areas → sofa, coffee table, TV unit.
- Dining → table with chairs.
- Kitchen → cabinets, counters, appliances.
- Bathroom → toilet, sink, shower/tub.
- Office → desk and chair.
- Circulation areas → minimal decor.

STYLE & LIGHTING:
- Soft natural daylight entering through windows.
- Warm interior lighting accents.
- Realistic materials: wood floors, tiles, painted walls.
- Subtle shadows and global illumination.

OUTPUT:
High-quality interior visualization that feels like a real apartment walkthrough snapshot, maintaining the exact layout of the floor plan.
`.trim();