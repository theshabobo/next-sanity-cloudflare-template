'use client';

import { useEffect, useState } from 'react';
import { checkSitePayment } from './checkSitePayment';
// import Header from '../Header'; // If there is a header
// import Footer from '../Footer'; // If there is a footer
import SiteSettingsFallback from './siteSettingsFallback';

export default function SiteSettingsLayout({ children }) {
  const [isPaid, setIsPaid] = useState(true);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    async function verify() {
      const paid = await checkSitePayment('your-project.com');
      setIsPaid(paid !== false);
      setChecked(true);
    }
    verify();
  }, []);

  if (!checked) return null;
  if (!isPaid) return <SiteSettingsFallback />;

  return (
    <div className="site-wrapper">
{/*      <Header />     */}
      {children}
{/*      <Footer />        */}
    </div>
  );
}
