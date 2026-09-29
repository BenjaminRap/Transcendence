export interface IAnimationCurve {
    length: number;
    preWrapMode: string;
    postWrapMode: string;
    keyframes: IAnimationKeyframe[];
}
export interface IAnimationKeyframe {
    time: number;
    value: number;
    inTangent: number;
    outTangent: number;
    tangentMode: number;
}
//# sourceMappingURL=ianimationcurve.d.ts.map