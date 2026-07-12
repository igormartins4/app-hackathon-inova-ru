import { AccessibilityInfo, PixelRatio, type AccessibilityChangeEvent } from 'react-native';
import { useEffect, useState } from 'react';

interface AccessibilityState {
  isReduceMotionEnabled: boolean;
  fontScale: number;
}

export function useAccessibility(): AccessibilityState {
  const [isReduceMotionEnabled, setIsReduceMotionEnabled] = useState(false);
  const [fontScale, setFontScale] = useState(() => PixelRatio.getFontScale());

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setIsReduceMotionEnabled);
    const sub = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      (event: AccessibilityChangeEvent) => setIsReduceMotionEnabled(event),
    );
    return () => sub.remove();
  }, []);

  // fontScale doesn't change at runtime without app restart, but read it on mount
  useEffect(() => {
    setFontScale(PixelRatio.getFontScale());
  }, []);

  return { isReduceMotionEnabled, fontScale };
}
