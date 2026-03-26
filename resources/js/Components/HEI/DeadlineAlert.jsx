import React, { useEffect, useRef, useState } from 'react';
import { IoTime, IoWarning, IoCheckmarkCircle } from 'react-icons/io5';
import confetti from 'canvas-confetti';

// Quadratic ease-out: fast start, decelerates to target.
// Per Robert Penner's easing equations — the canonical reference for animation easing.
const easeOutQuad = (t) => t * (2 - t);

const DURATION_MS = 1540;

const STATUS_STYLES = {
  complete: {
    wrapper: 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700',
    icon:    'text-green-600 dark:text-green-400',
    percent: 'text-green-600 dark:text-green-400',
    bar:     'bg-gradient-to-r from-green-400 to-green-500',
    Icon:    IoCheckmarkCircle,
  },
  overdue: {
    wrapper: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    icon:    'text-red-600 dark:text-red-400',
    percent: 'text-gray-900 dark:text-white',
    bar:     'bg-gradient-to-r from-red-400 to-red-500',
    Icon:    IoWarning,
  },
  warning: {
    wrapper: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
    icon:    'text-orange-600 dark:text-orange-400',
    percent: 'text-gray-900 dark:text-white',
    bar:     'bg-gradient-to-r from-orange-400 to-orange-500',
    Icon:    IoWarning,
  },
  normal: {
    wrapper: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    icon:    'text-blue-600 dark:text-blue-400',
    percent: 'text-gray-900 dark:text-white',
    bar:     'bg-gradient-to-r from-blue-500 to-blue-600',
    Icon:    IoTime,
  },
};

const DeadlineAlert = ({ deadline, progressPercentage }) => {
  const [displayWidth, setDisplayWidth] = useState(0);
  const [isCelebrating, setIsCelebrating] = useState(false);
  const rafRef = useRef(null);
  const startTimeRef = useRef(null);

  const fireConfetti = () => {
    const shared = {
      particleCount: 60,
      spread: 70,
      startVelocity: 45,
      ticks: 200,
      colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#ffffff'],
      zIndex: 9999,
    };
    confetti({ ...shared, origin: { x: 0.1, y: 0.85 }, angle: 60 });
    confetti({ ...shared, origin: { x: 0.9, y: 0.85 }, angle: 120 });
  };

  useEffect(() => {
    setDisplayWidth(0);
    setIsCelebrating(false);
    startTimeRef.current = null;

    const target = progressPercentage;

    const animate = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const t = Math.min(elapsed / DURATION_MS, 1);
      const current = Math.round(easeOutQuad(t) * target);

      setDisplayWidth(current);

      if (t < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayWidth(target);
        if (target >= 100) {
          setIsCelebrating(true);
          fireConfetti();
        }
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [progressPercentage]);

  const statusKey = (() => {
    if (isCelebrating)                  return 'complete';
    if (deadline.isPastDeadline)        return 'overdue';
    if (deadline.daysRemaining <= 30)   return 'warning';
    return 'normal';
  })();

  const s = STATUS_STYLES[statusKey];

  return (
    <div className={`${s.wrapper} border rounded-xl p-6`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`p-3 bg-white dark:bg-gray-800 rounded-lg ${s.icon}`}>
            <s.Icon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Annual Submission Deadline
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {new Date(deadline.date).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
              <span className="mx-2">•</span>
              <span className={deadline.daysRemaining <= 30 ? 'font-semibold' : ''}>
                {deadline.daysRemaining} days remaining
              </span>
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-2xl font-bold ${s.percent}`}>
            {displayWidth}%
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Complete</div>
        </div>
      </div>

      <div className="mt-4 bg-white dark:bg-gray-700 rounded-lg h-3 overflow-hidden">
        <div
          className={`h-full ${s.bar}`}
          style={{ width: `${displayWidth}%` }}
        />
      </div>
    </div>
  );
};

export default DeadlineAlert;
