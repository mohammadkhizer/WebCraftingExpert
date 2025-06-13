
"use client";

import { useState, useEffect, useRef } from 'react';

function parseValue(valueString: string): { target: number; suffix: string } {
  if (!valueString) {
    return { target: 0, suffix: '' };
  }
  const match = valueString.match(/^(\d+)(.*)$/);
  if (match && match[1]) {
    return { target: parseInt(match[1], 10), suffix: match[2] || '' };
  }
  const numericPart = parseInt(valueString, 10);
  if (!isNaN(numericPart)) {
    return { target: numericPart, suffix: valueString.replace(String(numericPart), '') };
  }
  return { target: 0, suffix: valueString };
}

export function useAnimatedCounter(endValueString: string, duration: number = 2000, startAnimation: boolean = false) {
  const [count, setCount] = useState(0);
  const parsedRef = useRef(parseValue(endValueString));

  useEffect(() => {
    // Update parsed value if endValueString changes, which might happen if props change.
    parsedRef.current = parseValue(endValueString);
    // If the animation is not supposed to be active (e.g. component re-rendered with startAnimation=false), reset count.
    if (!startAnimation) {
      setCount(0);
    }
  }, [endValueString, startAnimation]);
  
  const targetValue = parsedRef.current.target;
  const frameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!startAnimation) {
      // Ensure count is 0 if animation shouldn't be running.
      // This also handles the case where startAnimation becomes false after being true.
      setCount(0); 
      return;
    }

    // Reset start time and count for a fresh animation when startAnimation becomes true.
    startTimeRef.current = null;
    setCount(0); 

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const progress = timestamp - startTimeRef.current;
      const percentage = Math.min(progress / duration, 1);
      const currentVal = Math.floor(percentage * targetValue);

      setCount(currentVal);

      if (percentage < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    if (targetValue > 0 && duration > 0) { // Only animate if there's a positive target and duration
        frameRef.current = requestAnimationFrame(animate);
    } else {
        // If target is 0 or duration is 0, set directly only if animation is meant to start.
        // Otherwise, count remains 0 from the initial reset.
        setCount(targetValue); 
    }

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [targetValue, duration, startAnimation]); // Rerun effect if targetValue, duration or startAnimation changes

  return { animatedValue: count, suffix: parsedRef.current.suffix };
}
