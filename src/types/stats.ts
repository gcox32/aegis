export type Gender = "male" | "female";

export type LengthUnit = "in" | "cm";
export type WeightUnit = "lb" | "kg";

export interface BodyFatInput {
    gender: Gender;
    age: number;

    height: number;
    heightUnit: LengthUnit;

    weight: number;
    weightUnit: WeightUnit;

    neck: number;
    waist: number;
    hip?: number;

    circumferenceUnit: LengthUnit;

    composite?: CompositeOptions;
}

export type CompositeStrategy =
    | "median"
    | "trimmed_mean"
    | "mean"
    | "weighted_mean";

export interface CompositeOptions {
    strategy: CompositeStrategy;

    /**
     * Only used when strategy === "weighted_mean"
     * Weights do not need to sum to 1; they will be normalized.
     */
    weights?: Partial<Record<MethodKey, number>>;
}

export type MethodKey = "navy" | "bmi" | "ymca";

export interface MethodEstimate {
    method: MethodKey;
    bf: number; // body fat percentage (0–60 typical)
}

export interface SanityFlag {
    code:
    | "MISSING_HIP_FOR_FEMALE_NAVY"
    | "INVALID_NUMERIC"
    | "OUT_OF_RANGE"
    | "WAIST_LESS_THAN_NECK"
    | "NAVY_LOG_DOMAIN_ERROR"
    | "UNREALISTIC_WH_RATIO"
    | "EXTREME_METHOD_DISAGREEMENT";
    message: string;
    severity: "info" | "warn" | "error";
}

export interface BodyFatResult {
    inputsNormalized: {
        heightCm: number;
        weightKg: number;
        neckCm: number;
        waistCm: number;
        hipCm?: number;
        bmi: number;
        waistToHeight: number;
    };

    estimates: MethodEstimate[];

    composite: {
        bf: number; // final composite estimate
        strategy: CompositeStrategy;
        ci68: [number, number]; // roughly “one-sigma” band
        ci95: [number, number]; // rough 95% band
    };

    flags: SanityFlag[];
}
