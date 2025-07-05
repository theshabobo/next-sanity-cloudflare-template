'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import styles from './siteSettingsFallback.module.css';
import { client } from '@/lib/sanity';

export default function SiteSettingsFallback() {
  const [data, setData] = useState(null);

  const query = `
    *[_type == "siteDisabledSettings"][0]{
      title,
      message,
      contactEmail,
      contactPhone,
      logo {
        asset -> { url }
      }
    }
  `;

  useEffect(() => {
    const cacheKey = 'siteDisabledData';
    const cacheExpiryKey = 'siteDisabledDataExpiry';
    const now = Date.now();

    const cached = localStorage.getItem(cacheKey);
    const cachedExpiry = localStorage.getItem(cacheExpiryKey);

    if (cached && cachedExpiry && now < Number(cachedExpiry)) {
      setData(JSON.parse(cached));
    } else {
      async function fetchData() {
        try {
          const result = await client.fetch(query);
          setData(result);
          localStorage.setItem(cacheKey, JSON.stringify(result));
          localStorage.setItem(cacheExpiryKey, (now + 5 * 60 * 60 * 1000).toString());
        } catch (error) {
          console.error('Secure fetch failed:', error);
        }
      }

      fetchData();
    }
  }, []);

  if (!data) return null;

  const { title, message, contactEmail, contactPhone, logo } = data;

  return (
    <div className={styles.disabledWrapper}>
      <div className={styles.content}>
        {logo?.asset?.url && (
          <div className={styles.logoImageWrapper}>
            <Image
              src={logo.asset.url}
              alt="Site Logo"
              width={120}
              height={120}
              className={styles.logoImage}
              priority
            />
          </div>
        )}
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.message}>{message}</p>
        <div className={styles.contactBox}>
          <p>📧 <a href={`mailto:${contactEmail}`}>{contactEmail}</a></p>
          <p>📞 <a href={`tel:${contactPhone}`}>{contactPhone}</a></p>
        </div>
      </div>
    </div>
  );
}
