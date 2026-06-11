import { motion } from "motion/react";

export function LiveIndicator() {
  return (
    <div className="flex items-center gap-2">
      <motion.div
        className="relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          className="w-2 h-2 rounded-full bg-green-500"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [1, 0.8, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute inset-0 w-2 h-2 rounded-full bg-green-500"
          animate={{
            scale: [1, 1.5, 2],
            opacity: [0.5, 0.2, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
      </motion.div>
      <span className="text-xs font-medium text-muted-foreground">Live</span>
    </div>
  );
}
