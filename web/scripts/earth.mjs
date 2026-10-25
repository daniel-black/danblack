// Rotating pixel-art Earth for SpaceScene.astro, written as a PNG sprite strip.
//
// Continents are rough lon/lat outlines rasterized onto an orthographic sphere tilted to show
// more of the northern hemisphere. Each pixel is lit from the upper left with ordered dithering
// across the day/night line, so the shading reads as smooth pixel art. The night side shows
// city lights; clouds are streaky bands fixed to the surface, so they turn with the planet.
import { deflateSync } from 'node:zlib';

export const FRAMES = 60;
export const SIZE = 100; // px per frame (planet radius 46 plus atmosphere)
const R = 46;
const TILT = (18 * Math.PI) / 180; // view from slightly above the equator
const START_LON = -95; // the Americas face the viewer in frame 0

// Rough outlines as [lon, lat] points. Accurate enough to read as Earth at this size.
const land = [
  // North America
  [[-168, 65], [-160, 71], [-140, 70], [-120, 74], [-95, 72], [-80, 73], [-75, 68], [-62, 60], [-56, 52],
    [-60, 47], [-66, 44], [-70, 42], [-75, 38], [-76, 35], [-81, 31], [-80, 26], [-82, 26], [-83, 29],
    [-90, 30], [-97, 28], [-97, 22], [-95, 18], [-90, 16], [-87, 13], [-84, 10], [-80, 8], [-78, 8],
    [-86, 12], [-92, 15], [-105, 20], [-110, 24], [-112, 30], [-117, 33], [-121, 37], [-124, 42],
    [-124, 48], [-130, 54], [-137, 58], [-148, 60], [-155, 58], [-162, 56], [-165, 60]],
  // Greenland
  [[-55, 82], [-30, 83], [-20, 78], [-22, 70], [-40, 65], [-48, 61], [-52, 66], [-58, 76], [-70, 78]],
  // South America
  [[-80, 9], [-75, 11], [-62, 11], [-52, 5], [-50, 0], [-35, -6], [-37, -12], [-40, -22], [-48, -28],
    [-55, -35], [-58, -38], [-65, -42], [-68, -50], [-70, -55], [-74, -52], [-75, -46], [-73, -38],
    [-71, -30], [-70, -18], [-76, -14], [-81, -6], [-80, 0], [-78, 3]],
  // Eurasia (with Arabia and India)
  [[-10, 36], [-9, 43], [-2, 44], [-5, 48], [0, 50], [5, 53], [8, 57], [5, 62], [12, 66], [20, 70],
    [30, 71], [42, 68], [60, 70], [70, 73], [80, 73], [100, 78], [115, 74], [130, 72], [150, 72],
    [170, 70], [180, 67], [178, 64], [165, 60], [160, 55], [156, 51], [142, 48], [140, 40], [135, 35],
    [130, 34], [126, 38], [121, 40], [122, 31], [120, 25], [110, 20], [108, 16], [109, 11], [105, 9],
    [103, 1], [101, 3], [100, 7], [98, 8], [98, 16], [94, 17], [91, 22], [87, 21], [80, 15], [78, 8],
    [76, 10], [73, 20], [70, 22], [66, 25], [60, 25], [57, 23], [59, 22], [55, 17], [52, 16], [43, 12],
    [39, 20], [35, 28], [34, 31], [36, 36], [30, 37], [27, 40], [24, 38], [20, 40], [19, 42], [16, 41],
    [18, 40], [15, 38], [12, 42], [8, 44], [4, 43], [3, 42], [0, 39], [-2, 37], [-6, 36]],
  // Africa
  [[-17, 21], [-16, 28], [-10, 30], [-6, 36], [10, 37], [11, 33], [20, 31], [32, 31], [34, 28], [38, 18],
    [43, 12], [51, 11], [48, 4], [41, -2], [40, -11], [35, -20], [33, -26], [27, -34], [18, -34],
    [15, -27], [12, -17], [13, -6], [9, -1], [9, 4], [5, 6], [-4, 5], [-8, 4], [-13, 8], [-17, 14]],
  // Madagascar, Australia, New Zealand
  [[44, -25], [47, -25], [50, -15], [49, -12], [44, -17]],
  [[114, -22], [114, -34], [118, -35], [130, -32], [137, -35], [141, -38], [147, -38], [150, -37],
    [153, -30], [153, -25], [146, -19], [142, -11], [140, -17], [136, -12], [130, -11], [126, -14], [122, -17]],
  [[172, -35], [178, -38], [174, -41], [171, -44], [167, -46], [170, -43], [173, -40]],
  // Islands: Britain, Japan, Borneo, Sumatra, New Guinea
  [[-5, 50], [1, 51], [2, 53], [-3, 56], [-5, 58], [-6, 56], [-3, 54], [-5, 52]],
  [[130, 31], [135, 34], [140, 36], [142, 40], [141, 45], [140, 42], [136, 36], [132, 34]],
  [[109, 1], [110, -2], [116, -4], [119, 1], [117, 7], [113, 3]],
  [[95, 5], [98, 4], [106, -6], [104, -6], [100, -2]],
  [[131, -1], [141, -3], [150, -10], [143, -9], [138, -8], [134, -4]],
];
const deserts = [
  [[-18, 15], [40, 15], [60, 22], [58, 30], [30, 33], [-10, 32], [-18, 28]], // Sahara and Arabia
  [[-118, 36], [-104, 36], [-100, 24], [-112, 24]], // American Southwest
  [[117, -18], [142, -18], [142, -32], [117, -32]], // Australian outback
];

const inside = (poly, lon, lat) => {
  let hit = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
};

// Shade ramps: index 0 is brightest, 4 is the night side.
const ramps = {
  ocean: ['#6fb6f0', '#4a92dc', '#2f6ebf', '#1d4b8f', '#0c1c3e'],
  green: ['#9ad870', '#6cb850', '#4a9040', '#2f6632', '#11231a'],
  desert: ['#ecd496', '#cfb070', '#a08650', '#6a5838', '#201d10'],
  ice: ['#ffffff', '#dbe6f2', '#aebed2', '#7e8ea8', '#26304a'],
  cloud: ['#ffffff', '#e2eaf4', '#b4c2d6', '#7e8ea8', '#18233a'],
};
const GLINT = '#a8dcff';
const CITY = ['#ffd860', '#f0a040'];
const RIM = '#9ed4ff';
const GLOW = ['#78b4f0', '#3c64a8'];

const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];
const L = (() => {
  const v = [-0.78, 0.32, 0.55]; // from the upper left, far enough round to show a night side
  const n = Math.hypot(...v);
  return v.map((c) => c / n);
})();
const hash = (a, b) => (((a * 73856093) ^ (b * 19349663)) >>> 0) % 1000;

function frame(f) {
  const rows = Array.from({ length: SIZE }, () => Array(SIZE).fill(null));
  const c = SIZE / 2;
  const centerLon = START_LON - (f / FRAMES) * 360; // Earth turns west to east
  for (let y = 0; y < SIZE; y++)
    for (let x = 0; x < SIZE; x++) {
      const X = (x + 0.5 - c) / R;
      const Y = (y + 0.5 - c) / R;
      const d = Math.hypot(X, Y);
      const litEdge = (X * L[0] - Y * L[1]) / (d || 1) > -0.15;
      if (d > 1) {
        // Atmosphere glow just outside the lit limb.
        if (d <= 1 + 1.2 / R && litEdge) rows[y][x] = GLOW[0];
        else if (d <= 1 + 2.4 / R && litEdge) rows[y][x] = GLOW[1];
        continue;
      }
      const px = X;
      const py = -Y;
      const pz = Math.sqrt(1 - d * d);
      // Earth-fixed coordinates after tilting toward the north pole.
      const ty = py * Math.cos(TILT) + pz * Math.sin(TILT);
      const tz = -py * Math.sin(TILT) + pz * Math.cos(TILT);
      const lat = (Math.asin(Math.max(-1, Math.min(1, ty))) * 180) / Math.PI;
      let lon = centerLon + (Math.atan2(px, tz) * 180) / Math.PI;
      lon = ((((lon + 180) % 360) + 360) % 360) - 180;

      const light = px * L[0] + py * L[1] + pz * L[2];
      const dithered = light + ((BAYER[y % 4][x % 4] + 0.5) / 16 - 0.5) * 0.16;
      let shade = dithered > 0.62 ? 0 : dithered > 0.36 ? 1 : dithered > 0.14 ? 2 : dithered > -0.02 ? 3 : 4;

      const isLand = lat < -68 || land.some((p) => inside(p, lon, lat));
      const latR = (lat * Math.PI) / 180;
      const lonR = (lon * Math.PI) / 180;
      const cloudiness =
        Math.sin(lonR * 2 + Math.sin(latR * 6) * 1.5) * 0.5 +
        Math.sin(latR * 9 + lonR * 0.7) * 0.35 +
        Math.sin(lonR * 7.3 - latR * 4.1 + 1.7) * 0.22;
      const isCloud = cloudiness > 0.6;

      let color;
      if (isCloud) color = ramps.cloud[shade];
      else if (isLand) {
        const icy = Math.abs(lat) > 64 || (lat > 60 && lon > -60 && lon < -20);
        const dry = deserts.some((p) => inside(p, lon, lat));
        const ramp = icy ? ramps.ice : dry ? ramps.desert : ramps.green;
        color = ramp[shade];
        // City lights on the night side.
        if (shade === 4 && !icy && Math.abs(lat) < 58 && hash(Math.round(lon * 2), Math.round(lat * 2)) < 70)
          color = CITY[hash(x, y) % 2];
      } else {
        color = ramps.ocean[shade];
        if (light > 0.985) color = GLINT; // small sun glint
      }
      // Bright rim of atmosphere along the lit edge of the disk.
      if (d > 0.978 && litEdge && shade < 3) color = RIM;
      rows[y][x] = color;
    }
  return rows;
}

/** All frames side by side, as rows of hex colors (null is transparent). */
export function strip() {
  const frames = Array.from({ length: FRAMES }, (_, f) => frame(f));
  return Array.from({ length: SIZE }, (_, y) => frames.flatMap((fr) => fr[y]));
}

/* ---------- PNG output ---------- */

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 = (buf) => {
  let c = 0xffffffff;
  for (const b of buf) c = crcTable[(c ^ b) & 255] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const chunk = (type, data) => {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
};

/** Encodes rows of hex colors (null = transparent) as an RGBA PNG. */
export function png(rows) {
  const h = rows.length;
  const w = rows[0].length;
  const raw = Buffer.alloc((w * 4 + 1) * h);
  rows.forEach((row, y) => {
    const o = y * (w * 4 + 1);
    row.forEach((hex, x) => {
      if (!hex) return;
      const i = o + 1 + x * 4;
      raw[i] = parseInt(hex.slice(1, 3), 16);
      raw[i + 1] = parseInt(hex.slice(3, 5), 16);
      raw[i + 2] = parseInt(hex.slice(5, 7), 16);
      raw[i + 3] = 255;
    });
  });
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr.set([8, 6, 0, 0, 0], 8);
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}
