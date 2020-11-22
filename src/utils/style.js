/**
 * Convert a px string to a number
 */
export const pxToNum = px => Number(px.replace('px', ''));

/**
 * Convert a number to a px string
 */
export const numToPx = num => `${num}px`;

/**
 * Convert pixel values to rem for a11y
 */
export const pxToRem = px => `${px / 16}rem`;

/**
 * Convert ms token values to a raw numbers for ReactTransitionGroup
 * Transition delay props
 */
export const msToNum = msString => Number(msString.replace('ms', ''));

/**
 * Convert a number to an ms string
 */
export const numToMs = num => `${num}ms`;
