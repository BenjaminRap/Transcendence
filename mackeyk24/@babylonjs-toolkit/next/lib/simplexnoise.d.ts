import { RandomFn } from './randomfn';
import { NoiseFunction2D } from './noisefunction2d';
import { NoiseFunction3D } from './noisefunction3d';
import { NoiseFunction4D } from './noisefunction4d';
export declare class SimplexNoise {
    private static readonly F2;
    private static readonly G2;
    private static readonly F3;
    private static readonly G3;
    private static readonly F4;
    private static readonly G4;
    private static readonly grad2;
    private static readonly grad3;
    private static readonly grad4;
    private static fastFloor;
    static createNoise2D(random?: RandomFn): NoiseFunction2D;
    static createNoise3D(random?: RandomFn): NoiseFunction3D;
    static createNoise4D(random?: RandomFn): NoiseFunction4D;
    static buildPermutationTable(random: RandomFn): Uint8Array;
}
//# sourceMappingURL=simplexnoise.d.ts.map