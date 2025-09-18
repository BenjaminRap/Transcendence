import { Range } from "./Range";

export function randomFromRange(range : Range) : number
{
  return Math.random() * (range.max - range.min) + range.min;
}

