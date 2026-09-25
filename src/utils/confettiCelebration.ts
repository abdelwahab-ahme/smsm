import confetti from 'canvas-confetti';

/**
 * Fires a dual-cannon celebration for solving the daily challenge!
 * Launches colorful bursts from both sides towards the center.
 */
export function fireDailySuccessConfetti() {
  const count = 200;
  const defaults = {
    origin: { y: 0.7 },
    zIndex: 9999,
  };

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  }

  // Realistic celebration blast sequence
  fire(0.25, {
    spread: 26,
    startVelocity: 55,
    colors: ['#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'],
  });
  fire(0.2, {
    spread: 60,
    colors: ['#fbbf24', '#f43f5e', '#06b6d4'],
  });
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  });

  // Second burst from the corners after 250ms
  setTimeout(() => {
    confetti({
      particleCount: 80,
      angle: 60,
      spread: 60,
      origin: { x: 0, y: 0.65 },
      colors: ['#f43f5e', '#ec4899', '#f59e0b', '#fbbf24'],
      zIndex: 9999,
    });
    confetti({
      particleCount: 80,
      angle: 120,
      spread: 60,
      origin: { x: 1, y: 0.65 },
      colors: ['#06b6d4', '#3b82f6', '#10b981', '#fbbf24'],
      zIndex: 9999,
    });
  }, 250);
}

/**
 * Fires a golden royal firework burst for unlocking a new badge!
 */
export function fireBadgeUnlockConfetti() {
  const duration = 2.5 * 1000;
  const end = Date.now() + duration;

  // Immediate big explosion
  confetti({
    particleCount: 120,
    spread: 90,
    origin: { y: 0.4 },
    colors: ['#fbbf24', '#f59e0b', '#d97706', '#f43f5e', '#ec4899', '#ffffff'],
    zIndex: 9999,
  });

  // Shimmering stars and sparkles falling
  const interval: ReturnType<typeof setInterval> = setInterval(() => {
    if (Date.now() > end) {
      clearInterval(interval);
      return;
    }

    confetti({
      startVelocity: 30,
      spread: 360,
      ticks: 60,
      origin: {
        x: Math.random(),
        y: Math.random() * 0.4,
      },
      colors: ['#f59e0b', '#fbbf24', '#ec4899', '#3b82f6'],
      zIndex: 9999,
    });
  }, 300);
}
