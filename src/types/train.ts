import { MuscleGroup } from "./anatomy";
import { User } from "./user";

// helpers
type PlaneOfMotion = 'sagittal' | 'frontal' | 'transverse';

type Equipment = 'barbell' | 'dumbbell' | 'kettlebell' | 'machine' | 'bodyweight' | 'other';

type Difficulty = 'beginner' | 'intermediate' | 'advanced';

type RPE = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

type RestTimer = 0 | 15 | 30 | 45 | 60 | 90 | 120 | 180 | 240 | 300;

type WorkoutType = 'strength' | 'hypertrophy' | 'endurance' | 'power' | 'skill' | 'other';

type WorkoutBlockType = 'warm-up' | 'main' | 'accessory' | 'finisher' | 'other'; 

type DistanceMeasurement = { value: number; unit: 'meters' | 'feet' | 'yards' | 'miles' };
type TimeMeasurement     = { value: number; unit: 'seconds' | 'minutes' | 'hours' };
type WeightMeasurement   = { value: number; unit: 'kg' | 'lbs' };
type CaloriesMeasurement = { value: number; unit: 'calories' };
type PaceMeasurement     = { value: number; unit: 'mph' | 'kph' | 'min/km' | 'min/mile' };
type LongTimeMeasurement = { value: number; unit: 'days' | 'weeks' | 'months' | 'years' };

interface MovementPattern {
    name: string;
    description: string;
}

interface ExerciseMeasures {
    externalLoad?:      WeightMeasurement;
    includeBodyweight?: boolean;
    reps?:              number;
    distance?:          DistanceMeasurement;
    time?:              TimeMeasurement;
    pace?:              PaceMeasurement;
    calories?:          CaloriesMeasurement;
}


// primary types
interface Protocol {
    id: string;
    name: string;
    description?: string;
    workouts?: Workout[];
    duration: LongTimeMeasurement;
    daysPerWeek: number;
    sessionsPerDay: number;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

interface Workout {
    id: string;
    userId: User['id'];
    workoutType: WorkoutType;
    name?: string;
    blocks: WorkoutBlock[];
    description?: string;
    estimatedDuration?: number; // in minutes
    createdAt: Date;
    updatedAt: Date;
}

interface WorkoutBlock {
    id: string;
    workoutId: Workout['id'];
    workoutBlockType: WorkoutBlockType;
    name?: string;
    description?: string;
    order: number;
    exercises: WorkoutBlockExercise[];
    circuit?: boolean;
    estimatedDuration?: number; // in minutes
    createdAt: Date;
    updatedAt: Date;
}

interface WorkoutBlockExercise {
    id: string;
    exercise: Exercise;
    order: number;
    sets: number;
    measures: ExerciseMeasures;
    tempo?: {
        eccentric:  TimeMeasurement;
        bottom:     TimeMeasurement;
        concentric: TimeMeasurement;
        top:        TimeMeasurement;
    };
    restTime?: RestTimer;
    rpe?: RPE;
    notes?: string;
}

interface Exercise {
    name: string;
    description: string;
    movementPattern: MovementPattern;
    muscleGroups: {
        primary: MuscleGroup;
        secondary?: MuscleGroup;
        tertiary?: MuscleGroup;
    };
    planeOfMotion?: PlaneOfMotion;
    bilateral?: boolean;
    equipment?: Equipment;
    imageUrl?: string;
    videoUrl?: string;
    difficulty?: Difficulty;
}

// instances
interface ProtocolInstance {
    id: string;
    userId: User['id'];
    protocolId: Protocol['id'];
    startDate: Date;
    endDate?: Date | null;
    complete: boolean;
    duration?: number; // in minutes
    notes?: string;

}

export interface WorkoutInstance {
    id: string;
    userId: User['id'];
    workoutId: Workout['id'];
    date: Date;
    complete: boolean;
    duration?: number; // in minutes
    volume?: WeightMeasurement;
    loadVolume?: WeightMeasurement;
    notes?: string;
}

export interface WorkoutBlockInstance {
    id: string;
    userId: User['id'];
    workoutInstanceId: WorkoutInstance['id'];
    workoutBlockId: WorkoutBlock['id'];
    date: Date;
    complete: boolean;
    duration?: number; // in minutes
    volume?: WeightMeasurement;
    loadVolume?: WeightMeasurement;
    notes?: string;
}

export interface WorkoutBlockExerciseInstance {
    id: string;
    userId: User['id'];
    workoutBlockInstanceId: WorkoutBlockInstance['id'];
    workoutBlockExerciseId: WorkoutBlockExercise['id'];
    date: Date;
    complete: boolean;
    duration?: number; // in minutes
    measures: ExerciseMeasures;
    notes?: string;
}