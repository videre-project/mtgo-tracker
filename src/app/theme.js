import { pxToRem } from 'utils/style';

const systemFontStack =
  'system-ui, -apple-system, BlinkMacSystemFont, San Francisco, Roboto, Segoe UI, Ubuntu, Helvetica Neue, sans-serif';

// Full list of tokens
export const tokens = {
  rgbBlack: '0 0 0',
  rgbWhite: '255 255 255',
  bezierFastoutSlowin: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
  durationXS: '200ms',
  durationS: '300ms',
  durationM: '400ms',
  durationL: '600ms',
  durationXL: '800ms',
  systemFontStack,
  fontStack: `Roboto, ${systemFontStack}`,
  monoFontStack:
    'SFMono Regular, Roboto Mono, Consolas, Liberation Mono, Menlo, Courier, monospace',
  fontWeightRegular: 400,
  fontWeightMedium: 500,
  fontWeightBold: 700,
  fontSizeH1: pxToRem(28),
  fontSizeH2: pxToRem(21),
  fontSizeH3: pxToRem(16),
  fontSizeBodyL: pxToRem(16),
  fontSizeBodyM: pxToRem(14),
  fontSizeBodyS: pxToRem(12),
  lineHeightTitle: '1.1',
  lineHeightBody: '1.5',
  maxWidthS: '540px',
  maxWidthM: '720px',
  maxWidthL: '1096px',
  maxWidthXL: '1680px',
  spaceOuter: '48px',
  spaceXS: '4px',
  spaceS: '8px',
  spaceM: '16px',
  spaceL: '24px',
  spaceXL: '32px',
  space2XL: '48px',
  space3XL: '64px',
  space4XL: '96px',
  space5XL: '128px',
};

export const theme = {
  rgbBackground: '238 242 246',
  rgbAccent: '32 60 75',
  rgbText: '32 60 75',
  colorTextTitle: 'rgb(var(--rgbText) / 1)',
  colorTextBody: 'rgb(var(--rgbText) / 0.7)',
  colorTextLight: 'rgb(var(--rgbText) / 0.6)',
};

export const tokenStyles = `
  :root {
    ${createThemeProperties(tokens)}
  }

  body {
    ${createThemeProperties(theme)}
  }
`;

/**
 * Transform theme token objects into CSS custom property strings
 */
export function createThemeProperties(theme) {
  return Object.keys(theme)
    .map(key => `--${key}: ${theme[key]};`)
    .join('\n');
}

/**
 * Transform theme tokens into a React CSSProperties object
 */
export function createThemeStyleObject(theme) {
  let style = {};

  for (const key of Object.keys(theme)) {
    style[`--${key}`] = theme[key];
  }

  return style;
}
