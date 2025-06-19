import React, { useEffect, useState } from "react";

interface AnimatedCounterProps {
  from: number;
  to: number;
  duration?: number; // in seconds
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  from,
  to,
  duration = 1,
}) => {
  const [count, setCount] = useState(from);

  useEffect(() => {
    const diff = to - from;
    if (diff === 0) return;
    const steps = Math.ceil(duration * 60);
    let currentStep = 0;

    const step = () => {
      currentStep++;
      const progress = Math.min(currentStep / steps, 1);
      setCount(Math.round(from + diff * progress));
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    step();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to, duration]);

  return <span>{count}</span>;
};

export default AnimatedCounter;
