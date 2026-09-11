import * as React from "react";
import { motion } from "framer-motion";
import { Plane } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FlightCard1Props {
  imageUrl: string;
  airline: string;
  flightCode: string;
  flightClass: string;
  departureCode: string;
  departureCity: string;
  departureTime: string;
  arrivalCode: string;
  arrivalCity: string;
  arrivalTime: string;
  duration: string;
  className?: string;
}

export const FlightCard1 = React.forwardRef<HTMLDivElement, FlightCard1Props>(
  (
    {
      imageUrl,
      airline,
      flightCode,
      flightClass,
      departureCode,
      departureCity,
      departureTime,
      arrivalCode,
      arrivalCity,
      arrivalTime,
      duration,
      className,
    },
    ref
  ) => {
    const cardVariants = {
      hidden: { opacity: 0, y: 20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.5,
          when: "beforeChildren",
          staggerChildren: 0.1,
        },
      },
    };

    const itemVariants = {
      hidden: { opacity: 0, y: 10 },
      visible: { opacity: 1, y: 0 },
    };

    return (
      <motion.div
        ref={ref}
        className={cn(
          "max-w-sm w-full font-sans overflow-hidden bg-card border border-border shadow-sm h-full flex flex-col",
          className
        )}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover={{ scale: 1.03, transition: { duration: 0.3 } }}
      >
        {/* Flight Image with Overlay */}
        <div className="relative h-48">
          <img
            src={imageUrl}
            alt="View from airplane window"
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 w-full bg-gradient-to-t from-slate-900/90 via-slate-900/50 to-transparent p-5 text-white flex justify-between items-end">
            <div className="text-left">
              <p className="text-3xl font-bold tracking-wider uppercase leading-none drop-shadow-sm">
                {departureCode}
              </p>
              <p className="text-xs text-slate-300 mt-1.5 drop-shadow-sm">{departureCity}</p>
            </div>
            <div className="text-center pb-2">
              <Plane className="h-5 w-5 text-white/80 mx-auto drop-shadow-sm" />
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold tracking-wider uppercase leading-none drop-shadow-sm">
                {arrivalCode}
              </p>
              <p className="text-xs text-slate-300 mt-1.5 drop-shadow-sm">{arrivalCity}</p>
            </div>
          </div>
        </div>

        {/* Flight Details Container */}
        <div className="p-6 pt-5">
          {/* Main Flight Route (Times & Duration) */}
          <motion.div
            variants={itemVariants}
            className="flex items-center justify-between"
          >
            <div className="text-left">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Departure</p>
              <p className="text-lg font-bold text-card-foreground tabular-nums tracking-tight leading-none">{departureTime}</p>
            </div>

            <div className="text-center flex flex-col items-center justify-center pt-2">
              <div className="flex items-center gap-2 mb-1">
                <div className="h-px w-6 bg-border" />
                <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                <div className="h-px w-6 bg-border" />
              </div>
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{duration}</p>
            </div>

            <div className="text-right">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Arrival</p>
              <p className="text-lg font-bold text-card-foreground tabular-nums tracking-tight leading-none">{arrivalTime}</p>
            </div>
          </motion.div>

          {/* Divider */}
          <motion.div
            variants={itemVariants}
            className="border-t border-dashed border-border my-5"
          />

          {/* Additional Details */}
          <motion.div
            variants={itemVariants}
            className="flex justify-between text-center"
          >
            <InfoItem label="Airline" value={airline} />
            <InfoItem label="Flight Code" value={flightCode} />
            <InfoItem label="Class" value={flightClass} />
          </motion.div>
        </div>
      </motion.div>
    );
  }
);

FlightCard1.displayName = "FlightCard1";

const InfoItem = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col items-center">
    <span className="text-xs text-muted-foreground">{label}</span>
    <span className="font-semibold text-card-foreground">{value}</span>
  </div>
);
