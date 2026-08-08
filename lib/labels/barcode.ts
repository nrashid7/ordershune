/**
 * Dependency-free Code 128 Subset B encoder.
 * Encodes printable ASCII (32–126) with START_B, checksum, and STOP.
 */

/** Standard Code 128 patterns: six digits = bar/space module widths. */
const PATTERNS: string[] = [
  "212222", // 0
  "222122", // 1
  "222221", // 2
  "121223", // 3
  "121322", // 4
  "131222", // 5
  "122213", // 6
  "122312", // 7
  "132212", // 8
  "221213", // 9
  "221312", // 10
  "231212", // 11
  "112232", // 12
  "122132", // 13
  "122231", // 14
  "113222", // 15
  "123122", // 16
  "123221", // 17
  "223211", // 18
  "221132", // 19
  "221231", // 20
  "213212", // 21
  "223112", // 22
  "312131", // 23
  "311222", // 24
  "321122", // 25
  "321221", // 26
  "312212", // 27
  "322112", // 28
  "322211", // 29
  "212123", // 30
  "212321", // 31
  "232121", // 32
  "111323", // 33
  "131123", // 34
  "131321", // 35
  "112313", // 36
  "132113", // 37
  "132311", // 38
  "211313", // 39
  "231113", // 40
  "231311", // 41
  "112133", // 42
  "112331", // 43
  "132131", // 44
  "113123", // 45
  "113321", // 46
  "133121", // 47
  "313121", // 48
  "211331", // 49
  "231131", // 50
  "213113", // 51
  "213311", // 52
  "213131", // 53
  "311123", // 54
  "311321", // 55
  "331121", // 56
  "312113", // 57
  "312311", // 58
  "332111", // 59
  "314111", // 60
  "221411", // 61
  "431111", // 62
  "111224", // 63
  "111422", // 64
  "121124", // 65
  "121421", // 66
  "141122", // 67
  "141221", // 68
  "112214", // 69
  "112412", // 70
  "122114", // 71
  "122411", // 72
  "142112", // 73
  "142211", // 74
  "241211", // 75
  "221114", // 76
  "413111", // 77
  "241112", // 78
  "134111", // 79
  "111242", // 80
  "121142", // 81
  "121241", // 82
  "114212", // 83
  "124112", // 84
  "124211", // 85
  "411212", // 86
  "421112", // 87
  "421211", // 88
  "212141", // 89
  "214121", // 90
  "412121", // 91
  "111143", // 92
  "111341", // 93
  "131141", // 94
  "114113", // 95
  "114311", // 96
  "411113", // 97
  "411311", // 98
  "113141", // 99
  "114131", // 100
  "311141", // 101
  "411131", // 102
  "211412", // 103 START_A
  "211214", // 104 START_B
  "211232", // 105 START_C
  "2331112", // 106 STOP (includes termination bar)
];

const START_B = 104;
const STOP = 106;

function charToCode(ch: string): number {
  const code = ch.charCodeAt(0);
  if (code < 32 || code > 126) {
    throw new Error(`Code128-B cannot encode character: ${JSON.stringify(ch)}`);
  }
  return code - 32;
}

/** Encode value as Code128-B symbol values including START_B, checksum, STOP. */
export function encodeCode128B(value: string): number[] {
  const data = Array.from(value, charToCode);
  let checksum = START_B;
  for (let i = 0; i < data.length; i++) {
    checksum += data[i] * (i + 1);
  }
  checksum %= 103;
  return [START_B, ...data, checksum, STOP];
}

function patternsToBars(codes: number[]): { widths: number[]; modules: number } {
  const widths: number[] = [];
  let modules = 0;
  for (const code of codes) {
    const pattern = PATTERNS[code];
    for (const digit of pattern) {
      const w = Number(digit);
      widths.push(w);
      modules += w;
    }
  }
  return { widths, modules };
}

/**
 * Returns an SVG string for a Code128-B barcode of `value`.
 * @param value Printable ASCII string
 * @param height Bar height in SVG units (default 48)
 */
export function code128Svg(value: string, height = 48): string {
  const safe = value.length > 0 ? value : " ";
  const codes = encodeCode128B(safe);
  const { widths, modules } = patternsToBars(codes);
  const moduleWidth = 2;
  const quiet = 10 * moduleWidth;
  const width = quiet * 2 + modules * moduleWidth;
  const barHeight = height;

  let x = quiet;
  const rects: string[] = [];
  let isBar = true;
  for (const w of widths) {
    const rw = w * moduleWidth;
    if (isBar) {
      rects.push(
        `<rect x="${x}" y="0" width="${rw}" height="${barHeight}" fill="#000"/>`
      );
    }
    x += rw;
    isBar = !isBar;
  }

  const labelY = barHeight + 14;
  const totalHeight = barHeight + 20;
  const escaped = safe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${totalHeight}" viewBox="0 0 ${width} ${totalHeight}" role="img" aria-label="Barcode ${escaped}"><rect width="100%" height="100%" fill="#fff"/>${rects.join("")}<text x="${width / 2}" y="${labelY}" text-anchor="middle" font-family="monospace" font-size="12" fill="#000">${escaped}</text></svg>`;
}
