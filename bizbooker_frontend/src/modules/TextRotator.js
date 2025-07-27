// components/TextRotator.js
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

const TextRotator = ({ phrases, interval = 3000 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % phrases.length);
    }, interval);
    return () => clearInterval(timer);
  }, [phrases.length, interval]);

  return (
    <span className="text-rotator">
      <AnimatePresence mode="wait">
        <motion.span
          key={currentIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ 
            opacity: 1, 
            y: 0,
            transition: { 
              type: "spring",
              stiffness: 300,
              damping: 20
            }
          }}
          exit={{ 
            opacity: 0, 
            y: -10,
            transition: { duration: 0.2 }
          }}
          className="rotating-text"
        >
          {phrases[currentIndex]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
};

export default TextRotator;