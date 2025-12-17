import { UserStats } from "@/types/user";
import { WorkPowerConstants } from "@/types/train";
import { defaultWorkPowerConstants } from "@/components/train/build/exercises/options";

export const calculateOutput = (userStats: UserStats, measuresArray: any[], time = null, constantsArray = [], acceleration = 9.81) => {
    // Validate required inputs
    if (!userStats?.weight || !userStats?.armLength || !userStats?.legLength) {
      throw new Error('User stats are required to calculate work power');
    }
  
    let totalWork = 0;
  
    // Process each measure with its corresponding constants
    measuresArray.forEach((measures, index) => {
      let constants: WorkPowerConstants = constantsArray[index] || defaultWorkPowerConstants;
  
      // If using calories (for cardio machines)
      if (constants.useCalories) {
        if (measures.calories) {
          const work = measures.calories * 4184; // 1 calorie = ~4184 Joules
          totalWork += work;
        }
      } else {
        // Simplified weight calculation - always consider bodyweight with factor
        const weight = ((userStats.weight?.value || 0) * constants.bodyweightFactor) + (measures.externalLoad || 0);
        const force = weight * (acceleration / 9.81); // Normalize to gravity
  
        // Calculate distance to use (in meters)
        let distanceMeters = constants.defaultDistance?.value || 0;
        
        // Convert default distance to meters if needed
        if (constants.defaultDistance?.unit) {
          const unit = constants.defaultDistance.unit;
          if (unit === 'cm') distanceMeters = distanceMeters / 100;
          else if (unit === 'ft') distanceMeters = distanceMeters * 0.3048;
          else if (unit === 'in') distanceMeters = distanceMeters * 0.0254;
          else if (unit === 'km') distanceMeters = distanceMeters * 1000;
          else if (unit === 'mi') distanceMeters = distanceMeters * 1609.34;
          // 'm' is already in meters, no conversion needed
        }

        // Calculate limb-based distance adjustments (in meters)
        let limbBasedDistanceMeters = 0;
        if (constants.armLengthFactor && userStats.armLength) {
          let armLengthMeters = userStats.armLength.value;
          const armUnit = userStats.armLength.unit;
          if (armUnit === 'cm') armLengthMeters = armLengthMeters / 100;
          else if (armUnit === 'ft') armLengthMeters = armLengthMeters * 0.3048;
          else if (armUnit === 'in') armLengthMeters = armLengthMeters * 0.0254;
          // 'm' is already in meters
          limbBasedDistanceMeters += armLengthMeters * constants.armLengthFactor;
        }
        if (constants.legLengthFactor && userStats.legLength) {
          let legLengthMeters = userStats.legLength.value;
          const legUnit = userStats.legLength.unit;
          if (legUnit === 'cm') legLengthMeters = legLengthMeters / 100;
          else if (legUnit === 'ft') legLengthMeters = legLengthMeters * 0.3048;
          else if (legUnit === 'in') legLengthMeters = legLengthMeters * 0.0254;
          // 'm' is already in meters
          limbBasedDistanceMeters += legLengthMeters * constants.legLengthFactor;
        }

        // Use the limb-based distance if any limb factors were applied
        if (limbBasedDistanceMeters !== 0) {
          distanceMeters = limbBasedDistanceMeters;
        }

        // For continuous movement (like running), use distance directly if provided
        if (measures.distance) {
          let distMeters = measures.distance.value;
          const distUnit = measures.distance.unit;
          if (distUnit === 'cm') distMeters = distMeters / 100;
          else if (distUnit === 'ft') distMeters = distMeters * 0.3048;
          else if (distUnit === 'in') distMeters = distMeters * 0.0254;
          else if (distUnit === 'km') distMeters = distMeters * 1000;
          else if (distUnit === 'mi' || distUnit === 'miles') distMeters = distMeters * 1609.34;
          // 'm' or 'meters' is already in meters
          distanceMeters = distMeters;
        }

        // Ensure we have reps (default to 1 for continuous movements)
        const reps = measures.reps || 1;

        // Calculate work for this measure (force in N, distance in m, work in J)
        const work = force * distanceMeters * reps;
        totalWork += work;
      }
    });
  
    // Calculate power if time is provided
    if (time) {
      const power = totalWork / time; // kW
      return { work: totalWork, power };
    }
    return { work: totalWork };
  }