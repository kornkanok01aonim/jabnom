'use client';

import { useEffect } from 'react';

export default function TiktokEmbedLoader() {
  useEffect(() => {
    const scriptId = 'tiktok-embed-script';
    
    // Remove the old script if we navigated to a new page to force re-evaluation
    const oldScript = document.getElementById(scriptId);
    if (oldScript) {
      oldScript.remove();
    }
    
    // Inject a new script
    const script = document.createElement('script');
    script.id = scriptId;
    script.src = 'https://www.tiktok.com/embed.js';
    script.async = true;
    document.body.appendChild(script);

    // Cleanup not strictly necessary but keeps DOM clean
    return () => {
      const existing = document.getElementById(scriptId);
      if (existing) {
        existing.remove();
      }
    };
  }, []);

  return null;
}
