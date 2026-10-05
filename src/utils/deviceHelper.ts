/**
 * Device and Browser Compatibility Utilities
 * Handles iOS Safari, Android Chrome, Fullscreen API differences, and mobile anti-cheat nuances.
 */

export const isIOSDevice = (): boolean => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || navigator.vendor || (window as unknown as { opera?: string }).opera || '';
  const isIOSPlatform = /iPad|iPhone|iPod/.test(ua);
  const isIPadOS = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
  return isIOSPlatform || isIPadOS;
};

export const isAndroidDevice = (): boolean => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  return /Android/i.test(ua);
};

export const isMobileDevice = (): boolean => {
  return isIOSDevice() || isAndroidDevice() || (typeof window !== 'undefined' && window.innerWidth <= 768);
};

/**
 * Checks if iOS Safari is running in Standalone (Add to Home Screen / PWA) mode.
 * In standalone mode, iOS Safari provides 100% full screen with no browser chrome.
 */
export const isIOSStandalone = (): boolean => {
  if (typeof window === 'undefined') return false;
  const nav = window.navigator as unknown as { standalone?: boolean };
  return Boolean(
    nav.standalone ||
    (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches)
  );
};

export const getDeviceCategory = (): 'Android' | 'iPhone' | 'iPad' | 'Desktop/PC' => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return 'Desktop/PC';
  const ua = navigator.userAgent || '';
  if (/iPad/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) return 'iPad';
  if (/iPhone|iPod/.test(ua)) return 'iPhone';
  if (/Android/i.test(ua)) return 'Android';
  return 'Desktop/PC';
};

export const getDeviceInfoString = (): string => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return 'Desktop Browser';
  const cat = getDeviceCategory();
  const ua = navigator.userAgent;
  let browser = 'Browser';
  if (/Chrome|CriOS/i.test(ua)) browser = 'Chrome';
  else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = 'Safari';
  else if (/Firefox/i.test(ua)) browser = 'Firefox';
  else if (/Edg/i.test(ua)) browser = 'Edge';

  return `${cat} (${browser})`;
};

export const isFullscreenSupported = (): boolean => {
  if (typeof document === 'undefined') return false;
  // iOS Safari on iPhone does not support HTML5 document-level Fullscreen API,
  // but it does support simulated viewport fullscreen lock & standalone mode.
  if (isIOSDevice()) {
    const docEl = document.documentElement as unknown as {
      webkitRequestFullscreen?: () => Promise<void>;
      requestFullscreen?: () => Promise<void>;
    };
    return typeof docEl.requestFullscreen === 'function' || typeof docEl.webkitRequestFullscreen === 'function';
  }

  const docEl = document.documentElement as unknown as {
    requestFullscreen?: () => Promise<void>;
    webkitRequestFullscreen?: () => Promise<void>;
    mozRequestFullScreen?: () => Promise<void>;
    msRequestFullscreen?: () => Promise<void>;
  };

  return !!(
    docEl.requestFullscreen ||
    docEl.webkitRequestFullscreen ||
    docEl.mozRequestFullScreen ||
    docEl.msRequestFullscreen
  );
};

export const isCurrentlyFullscreen = (): boolean => {
  if (typeof document === 'undefined') return false;
  
  // On iOS Safari, if running standalone (Add to Home Screen), it is always true fullscreen
  if (isIOSDevice()) {
    if (isIOSStandalone()) return true;
    // For standard iOS Safari, check if the lock overlay class is active
    return document.documentElement.classList.contains('cbt-ios-fullscreen');
  }

  const doc = document as unknown as {
    fullscreenElement?: Element | null;
    webkitFullscreenElement?: Element | null;
    mozFullScreenElement?: Element | null;
    msFullscreenElement?: Element | null;
  };

  return !!(
    doc.fullscreenElement ||
    doc.webkitFullscreenElement ||
    doc.mozFullScreenElement ||
    doc.msFullscreenElement
  );
};

export const requestAppFullscreen = async (): Promise<boolean> => {
  if (typeof document === 'undefined') return false;

  // iOS Safari simulated full-screen
  if (isIOSDevice()) {
    try {
      document.documentElement.classList.add('cbt-ios-fullscreen');
      window.scrollTo(0, 1);
      return true;
    } catch {
      return false;
    }
  }

  const docEl = document.documentElement as unknown as {
    requestFullscreen?: () => Promise<void>;
    webkitRequestFullscreen?: () => Promise<void>;
    mozRequestFullScreen?: () => Promise<void>;
    msRequestFullscreen?: () => Promise<void>;
  };

  try {
    if (typeof docEl.requestFullscreen === 'function') {
      await docEl.requestFullscreen();
      return true;
    }
    if (typeof docEl.webkitRequestFullscreen === 'function') {
      await docEl.webkitRequestFullscreen();
      return true;
    }
    if (typeof docEl.mozRequestFullScreen === 'function') {
      await docEl.mozRequestFullScreen();
      return true;
    }
    if (typeof docEl.msRequestFullscreen === 'function') {
      await docEl.msRequestFullscreen();
      return true;
    }
  } catch {
    // Graceful fallback for rejected promises or permissions
  }
  return false;
};

export const exitAppFullscreen = async (): Promise<boolean> => {
  if (typeof document === 'undefined') return false;

  if (isIOSDevice()) {
    try {
      document.documentElement.classList.remove('cbt-ios-fullscreen');
      return true;
    } catch {
      return false;
    }
  }

  const doc = document as unknown as {
    exitFullscreen?: () => Promise<void>;
    webkitExitFullscreen?: () => Promise<void>;
    mozCancelFullScreen?: () => Promise<void>;
    msExitFullscreen?: () => Promise<void>;
  };

  try {
    if (typeof doc.exitFullscreen === 'function') {
      await doc.exitFullscreen();
      return true;
    }
    if (typeof doc.webkitExitFullscreen === 'function') {
      await doc.webkitExitFullscreen();
      return true;
    }
    if (typeof doc.mozCancelFullScreen === 'function') {
      await doc.mozCancelFullScreen();
      return true;
    }
    if (typeof doc.msExitFullscreen === 'function') {
      await doc.msExitFullscreen();
      return true;
    }
  } catch {
    // Ignore error
  }
  return false;
};

