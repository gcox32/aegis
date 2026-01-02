import TodaySessions from "@/components/today/TodaySessions";
import LatestSleep from "@/components/today/LatestSleep";
import TodayFuel from "@/components/today/TodayFuel";
import TodayBodyCheckIn from "@/components/today/TodayBodyCheckIn";
import TodayGreeting from "@/components/today/TodayGreeting";

export default function Today() {
  return (
    <div className="pb-24 min-h-screen">
      {/* Hero Section */}
      <TodayGreeting />

      {/* Bento Grid */}
      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="gap-3 sm:gap-4 grid grid-cols-2">
          {/* Workout - Full width on mobile, takes prominence */}
          <div className="z-10 col-span-2">
            <TodaySessions />
          </div>

          {/* Body Check-In - Square card */}
          <div className="z-9 col-span-1 aspect-square">
            <TodayBodyCheckIn />
          </div>

          {/* Sleep - Square card */}
          <div className="z-9 col-span-1 aspect-square">
            <LatestSleep />
          </div>

          {/* Fuel - Full width */}
          <div className="col-span-2">
            <TodayFuel />
          </div>
        </div>
      </div>
    </div>
  );
}
