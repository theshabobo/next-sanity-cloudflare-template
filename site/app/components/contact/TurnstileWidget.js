'use client';
import { useEffect } from 'react';

export default function TurnstileWidget() {
  useEffect(() => {
    const scriptId = 'cf-turnstile-script';

    // Load the Turnstile script only once
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  return (
    <div
      className="cf-turnstile"
      data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
    />
  );
}
