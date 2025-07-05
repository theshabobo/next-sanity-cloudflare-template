import './globals.css';
import SiteSettingsLayout from './components/siteSettings/siteSettingsLayout';
import { sanityFetch } from '@/lib/sanity';
import Script from 'next/script';
import Link from 'next/link';

export const metadata = {
  title: 'Your Project',
  description: 'Project Description'
};

export default async function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Cloudflare Turnstile */}
        <script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js"
          async
          defer
        ></script>

        {/* Google Analytics */}
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-xxxxxxxxxx"
          strategy="afterInteractive"
        />
        <Script
          id="gtag-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-xxxxxxxxxx');
            `,
          }}
        />
      </head>
      <body>
        <SiteSettingsLayout>{children}</SiteSettingsLayout>
      </body>
    </html>
  );
}
