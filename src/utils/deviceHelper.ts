/**
 * Device and Browser Compatibility Utilities
 * Handles iOS Safari, Fullscreen API differences, and mobile anti-cheat nuances.
 */

export const isIOSDevice = (): boolean => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || navigator.vendor || (window as unknown as { opera?: string }).opera || '';
  const isIOSPlatform = /iPad|iPhone|iPod/.test(ua);
  const isIPadOS = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
  return isIOSPlatform || isIPadOS;
};

export const isFullscreenSupported = (): boolean => {
  if (typeof document === 'undefined') return false;
  // iOS Safari on iPhone does not support HTML5 document-level Fullscreen API
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
