export const isPowerOfTwo = (value : number) => value !== 0 && (value & (value - 1)) === 0;
