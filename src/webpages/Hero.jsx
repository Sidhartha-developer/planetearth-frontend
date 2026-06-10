import { motion } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import ThemeToggle from "./ThemeToggle";

const Hero = () => {
  const { isWater } = useTheme();

  return (
    <section
      id="home"
      className={`
        relative min-h-screen overflow-hidden transition-colors duration-[1200ms]
        ${isWater ? "bg-[#0b221c]" : "bg-[#1c150b]"}
      `}
    >
      {/* ================= CIRCULAR SYSTEM MOTION (RECYCLING FEEL) ================= */}
      <motion.div
        className={`
          absolute -top-1/2 -left-1/2 w-[140vw] h-[140vw] rounded-full
          ${isWater
            ? "bg-[conic-gradient(from_0deg,rgba(34,197,94,0.08),rgba(14,165,233,0.08),rgba(34,197,94,0.08))]"
            : "bg-[conic-gradient(from_0deg,rgba(251,191,36,0.10),rgba(180,83,9,0.10),rgba(251,191,36,0.10))]"}
          blur-3xl
        `}
        animate={{ rotate: 360 }}
        transition={{ duration: 120, ease: "linear", repeat: Infinity }}
      />

      <motion.div
        className={`
          absolute -bottom-1/2 -right-1/2 w-[120vw] h-[120vw] rounded-full
          ${isWater
            ? "bg-[conic-gradient(from_180deg,rgba(14,165,233,0.06),rgba(34,197,94,0.06),rgba(14,165,233,0.06))]"
            : "bg-[conic-gradient(from_180deg,rgba(245,158,11,0.08),rgba(202,138,4,0.08),rgba(245,158,11,0.08))]"}
          blur-3xl
        `}
        animate={{ rotate: -360 }}
        transition={{ duration: 160, ease: "linear", repeat: Infinity }}
      />

      {/* ================= CONTENT ================= */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-32">
        <div className="max-w-4xl">
          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.8, ease: "easeOut" }}
            className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.15] tracking-tight text-foreground"
          >
            <span className="block">The planet is changing.</span>
            <span className="block mt-4 text-foreground/70">
              So must the way we build our future.
            </span>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
            className="mt-12 max-w-2xl text-lg sm:text-xl leading-relaxed text-muted-foreground"
          >
            A green-tech initiative focused on restoring balance between
            energy, water, air, and waste — for people, for communities,
            for Earth.
          </motion.p>

          {/* Toggle */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 1.4 }}
            className="mt-16"
          >
            <ThemeToggle />
          </motion.div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default Hero;
