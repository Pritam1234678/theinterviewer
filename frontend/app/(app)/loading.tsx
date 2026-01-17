"use client";

import { motion } from "framer-motion";

export default function Loading() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-dark">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center gap-6"
      >
        {/* Animated Spinner */}
        <div className="relative h-20 w-20">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="h-full w-full rounded-full border-4 border-white/10 border-t-blue-500"
          />
        </div>

        {/* Loading Text */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center"
        >
          <h2 className="text-2xl font-bold text-white">Loading...</h2>
          <p className="mt-2 text-sm text-light-muted">Please wait while we prepare your content</p>
        </motion.div>

        {/* Animated Dots */}
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
              }}
              className="h-2 w-2 rounded-full bg-blue-500"
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
