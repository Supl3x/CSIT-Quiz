// Performance utility to detect device capabilities and optimize animations
export const getPerformanceLevel = () => {
  // Check device capabilities
  const cores = navigator.hardwareConcurrency || 4;
  const memory = navigator.deviceMemory || 4;
  const connection = navigator.connection?.effectiveType || '4g';
  
  // Determine performance level
  if (cores >= 8 && memory >= 8) {
    return 'high';
  } else if (cores >= 4 && memory >= 4) {
    return 'medium';
  } else {
    return 'low';
  }
};

export const shouldReduceAnimations = () => {
  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  // Check performance level
  const performanceLevel = getPerformanceLevel();
  
  return prefersReducedMotion || performanceLevel === 'low';
};

export const getOptimalParticleCount = () => {
  const level = getPerformanceLevel();
  
  switch (level) {
    case 'high': return 20;
    case 'medium': return 12;
    case 'low': return 6;
    default: return 12;
  }
};

export const getOptimalAnimationDuration = (baseDuration) => {
  const level = getPerformanceLevel();
  
  switch (level) {
    case 'high': return baseDuration;
    case 'medium': return baseDuration * 1.5;
    case 'low': return baseDuration * 2;
    default: return baseDuration * 1.5;
  }
};