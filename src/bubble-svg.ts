export const bubbleVisualStyles = Object.freeze([
  "NORMAL",
  "THINKING",
  "DREAMING",
  "YELLING",
  "OFF_PANEL",
  "WAVY",
  "WHISPERING",
  "ANNOUNCEMENT",
  "NARRATION",
  "NO_BUBBLE",
] as const);

export type BubbleVisualStyle = (typeof bubbleVisualStyles)[number];

export interface RenderBubbleSvgInput {
  readonly style: BubbleVisualStyle;
  readonly lines: readonly string[];
  readonly width?: number;
  readonly height?: number;
  /** Scratch direction: 0 is up, 90 is right. */
  readonly tailDirection?: number | null;
  readonly fillColor?: string;
  readonly borderColor?: string;
  readonly textColor?: string;
  readonly fontFamily?: string;
  readonly fontSize?: number;
  readonly title?: string;
}

interface Point {
  readonly x: number;
  readonly y: number;
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function requireDimension(value: number | undefined, fallback: number): number {
  const normalized = value ?? fallback;
  if (!Number.isFinite(normalized) || normalized <= 0) {
    throw new TypeError("Bubble SVG dimensions must be positive and finite.");
  }
  return normalized;
}

function normalizeDirection(value: number | null | undefined): number | null {
  if (value === null) return null;
  const direction = value ?? 180;
  if (!Number.isFinite(direction)) {
    throw new TypeError("tailDirection must be finite.");
  }
  return ((direction % 360) + 360) % 360;
}

function pointList(points: readonly Point[]): string {
  return points.map(({ x, y }) => `${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
}

function tailGeometry(
  width: number,
  height: number,
  direction: number,
): { readonly base: readonly [Point, Point]; readonly tip: Point } {
  const centerX = width / 2;
  const centerY = height / 2;
  const radians = (direction * Math.PI) / 180;
  const dx = Math.sin(radians);
  const dy = -Math.cos(radians);
  const halfWidth = width / 2 - 25;
  const halfHeight = height / 2 - 25;
  const horizontalScale =
    Math.abs(dx) < 1e-9 ? Infinity : halfWidth / Math.abs(dx);
  const verticalScale =
    Math.abs(dy) < 1e-9 ? Infinity : halfHeight / Math.abs(dy);
  const bodyScale = Math.min(horizontalScale, verticalScale);
  const baseCenter = {
    x: centerX + dx * bodyScale,
    y: centerY + dy * bodyScale,
  };
  const perpendicular = { x: -dy, y: dx };
  const halfBase = 8;
  return {
    base: [
      {
        x: baseCenter.x + perpendicular.x * halfBase,
        y: baseCenter.y + perpendicular.y * halfBase,
      },
      {
        x: baseCenter.x - perpendicular.x * halfBase,
        y: baseCenter.y - perpendicular.y * halfBase,
      },
    ],
    tip: {
      x: centerX + dx * (bodyScale + 18),
      y: centerY + dy * (bodyScale + 18),
    },
  };
}

function roundedBody(
  width: number,
  height: number,
  fill: string,
  border: string,
  extra = "",
): string {
  return `<rect x="24" y="24" width="${width - 48}" height="${height - 48}" rx="18" fill="${fill}" stroke="${border}" stroke-width="3" ${extra}/>`;
}

function tailPolygon(
  width: number,
  height: number,
  direction: number,
  fill: string,
  border: string,
): string {
  const geometry = tailGeometry(width, height, direction);
  return `<polygon points="${pointList([geometry.base[0], geometry.tip, geometry.base[1]])}" fill="${fill}" stroke="${border}" stroke-width="3" stroke-linejoin="round"/>`;
}

function cloudBody(
  width: number,
  height: number,
  fill: string,
  border: string,
): string {
  const x = 24;
  const y = 24;
  const right = width - 24;
  const bottom = height - 24;
  const midX = width / 2;
  const midY = height / 2;
  return `<path d="M ${x + 18} ${midY}
    C ${x - 2} ${midY - 20}, ${x + 8} ${y + 18}, ${x + 36} ${y + 20}
    C ${x + 44} ${y - 2}, ${midX - 18} ${y - 5}, ${midX} ${y + 13}
    C ${midX + 24} ${y - 8}, ${right - 28} ${y}, ${right - 30} ${y + 24}
    C ${right + 2} ${y + 18}, ${right + 7} ${midY - 3}, ${right - 3} ${midY + 15}
    C ${right + 8} ${bottom - 10}, ${right - 20} ${bottom + 7}, ${right - 42} ${bottom - 7}
    C ${right - 55} ${bottom + 12}, ${midX + 12} ${bottom + 7}, ${midX} ${bottom - 7}
    C ${midX - 24} ${bottom + 12}, ${x + 42} ${bottom + 7}, ${x + 38} ${bottom - 12}
    C ${x + 7} ${bottom + 2}, ${x - 7} ${midY + 20}, ${x + 18} ${midY} Z"
    fill="${fill}" stroke="${border}" stroke-width="3" stroke-linejoin="round"/>`;
}

function thoughtTrail(
  width: number,
  height: number,
  direction: number,
  fill: string,
  border: string,
  dreaming: boolean,
): string {
  const geometry = tailGeometry(width, height, direction);
  const center = {
    x: (geometry.base[0].x + geometry.base[1].x) / 2,
    y: (geometry.base[0].y + geometry.base[1].y) / 2,
  };
  const circles = dreaming
    ? [
        { ratio: 0.45, radius: 7 },
        { ratio: 0.78, radius: 4.5 },
        { ratio: 1, radius: 3 },
      ]
    : [
        { ratio: 0.5, radius: 5 },
        { ratio: 0.82, radius: 3.5 },
      ];
  return circles
    .map(({ ratio, radius }) => {
      const x = center.x + (geometry.tip.x - center.x) * ratio;
      const y = center.y + (geometry.tip.y - center.y) * ratio;
      return `<circle cx="${x}" cy="${y}" r="${radius}" fill="${fill}" stroke="${border}" stroke-width="2"/>`;
    })
    .join("");
}

function burstBody(
  width: number,
  height: number,
  fill: string,
  border: string,
): string {
  const centerX = width / 2;
  const centerY = height / 2;
  const points = Array.from({ length: 28 }, (_, index) => {
    const radians = (index * Math.PI * 2) / 28 - Math.PI / 2;
    const outer = index % 2 === 0;
    const radiusX = outer ? width / 2 - 6 : width / 2 - 22;
    const radiusY = outer ? height / 2 - 6 : height / 2 - 22;
    return {
      x: centerX + Math.cos(radians) * radiusX,
      y: centerY + Math.sin(radians) * radiusY,
    };
  });
  return `<polygon points="${pointList(points)}" fill="${fill}" stroke="${border}" stroke-width="3" stroke-linejoin="round"/>`;
}

function wavyBody(
  width: number,
  height: number,
  fill: string,
  border: string,
): string {
  const left = 24;
  const top = 24;
  const right = width - 24;
  const bottom = height - 24;
  return `<path d="M ${left + 14} ${top}
    Q ${left + 27} ${top + 8} ${left + 40} ${top}
    T ${left + 66} ${top} T ${left + 92} ${top} T ${left + 118} ${top}
    T ${right - 14} ${top} Q ${right} ${top} ${right} ${top + 14}
    Q ${right - 8} ${top + 27} ${right} ${top + 40}
    T ${right} ${bottom - 14} Q ${right} ${bottom} ${right - 14} ${bottom}
    Q ${right - 27} ${bottom - 8} ${right - 40} ${bottom}
    T ${left + 66} ${bottom} T ${left + 40} ${bottom} T ${left + 14} ${bottom}
    Q ${left} ${bottom} ${left} ${bottom - 14}
    Q ${left + 8} ${bottom - 27} ${left} ${bottom - 40}
    T ${left} ${top + 14} Q ${left} ${top} ${left + 14} ${top} Z"
    fill="${fill}" stroke="${border}" stroke-width="3"/>`;
}

function renderBody(
  style: BubbleVisualStyle,
  width: number,
  height: number,
  direction: number | null,
  fill: string,
  border: string,
): string {
  switch (style) {
    case "NO_BUBBLE":
      return "";
    case "THINKING":
      return `${direction === null ? "" : thoughtTrail(width, height, direction, fill, border, false)}${cloudBody(width, height, fill, border)}`;
    case "DREAMING":
      return `${direction === null ? "" : thoughtTrail(width, height, direction, fill, border, true)}${cloudBody(width, height, fill, border)}`;
    case "YELLING":
      return burstBody(width, height, fill, border);
    case "WAVY":
      return `${direction === null ? "" : tailPolygon(width, height, direction, fill, border)}${wavyBody(width, height, fill, border)}`;
    case "WHISPERING":
      return `${direction === null ? "" : tailPolygon(width, height, direction, fill, border)}${roundedBody(width, height, fill, border, 'stroke-dasharray="5 5"')}`;
    case "ANNOUNCEMENT":
      return `${direction === null ? "" : tailPolygon(width, height, direction, fill, border)}${roundedBody(width, height, fill, border)}<rect x="30" y="30" width="${width - 60}" height="${height - 60}" rx="13" fill="none" stroke="${border}" stroke-width="1.5"/>`;
    case "NARRATION":
      return `<rect x="24" y="24" width="${width - 48}" height="${height - 48}" fill="${fill}" stroke="${border}" stroke-width="3"/>`;
    case "OFF_PANEL":
      return `${direction === null ? "" : tailPolygon(width, height, direction, fill, border)}${roundedBody(width, height, fill, border)}`;
    case "NORMAL":
      return `${direction === null ? "" : tailPolygon(width, height, direction, fill, border)}${roundedBody(width, height, fill, border)}`;
  }
}

/**
 * Renders the canonical Bubble body preview as a standalone SVG document.
 * The function is pure so documentation and runtime adapters can share it.
 */
export function renderBubbleSvg(input: RenderBubbleSvgInput): string {
  if (!bubbleVisualStyles.includes(input.style)) {
    throw new TypeError(
      `Unsupported Bubble visual style: ${String(input.style)}`,
    );
  }
  if (
    !Array.isArray(input.lines) ||
    input.lines.some((line) => typeof line !== "string")
  ) {
    throw new TypeError("lines must be an array of strings.");
  }
  const width = requireDimension(input.width, 220);
  const height = requireDimension(input.height, 112);
  const fontSize = requireDimension(input.fontSize, 15);
  const direction = normalizeDirection(input.tailDirection);
  const fill = input.fillColor ?? "#fff4cc";
  const border = input.borderColor ?? "#6f5b45";
  const textColor = input.textColor ?? "#25283a";
  const fontFamily = input.fontFamily ?? "Noto Sans JP, sans-serif";
  const lineHeight = fontSize * 1.35;
  const firstBaseline =
    height / 2 - ((input.lines.length - 1) * lineHeight) / 2 + fontSize * 0.35;
  const text = input.lines
    .map(
      (line, index) =>
        `<text x="${width / 2}" y="${firstBaseline + index * lineHeight}" text-anchor="middle" fill="${escapeXml(textColor)}" font-family="${escapeXml(fontFamily)}" font-size="${fontSize}">${escapeXml(line)}</text>`,
    )
    .join("");
  const title = escapeXml(input.title ?? `${input.style} bubble`);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" data-bubble-renderer="canonical" data-bubble-style="${input.style}"><title>${title}</title>${renderBody(input.style, width, height, direction, fill, border)}${text}</svg>`;
}
