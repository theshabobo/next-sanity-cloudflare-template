import React from 'react';
import { client } from '../../lib/sanity';
import { contactPageWithSocialQuery } from '../../lib/queries';
import styles from './Contact.module.css';
import ContactPageClient from './ContactPageClient';

export default async function ContactPage() {
  const data = await client.fetch(contactPageWithSocialQuery);
  const contact = data?.contact || {};
  const socialLinks = data?.socialLinks || [];
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;


  return (
    <main className={styles.contactPage}>
      <section className={styles.hero}>
        <h1>{contact.title}</h1>
        <p>{contact.subtitle}</p>
      </section>

      <ContactPageClient
        contact={contact}
        socialLinks={socialLinks}
        siteKey={siteKey}
      />

      <section className={styles.mapSection}>
        <h2>{contact.mapTitle}</h2>
        <iframe
          src={contact.mapEmbedLink}
          width="100%"
          height="350"
          style={{ border: 0 }}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
        />
        {contact.mapButtonUrl && (
          <a
            href={contact.mapButtonUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.mapButton}
          >
            {contact.mapButtonText}
          </a>
        )}
      </section>
    </main>
  );
}
