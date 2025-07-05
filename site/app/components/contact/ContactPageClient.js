'use client';

import React, { useEffect, useRef, useState } from 'react';
import styles from './Contact.module.css';

export default function ContactPageClient({ contact, siteKey }) {
  const [turnstileToken, setTurnstileToken] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const formRef = useRef(null);
  const turnstileRef = useRef(null);

  useEffect(() => {
    if (window.turnstile && turnstileRef.current) {
      window.turnstile.render(turnstileRef.current, {
        sitekey: siteKey,
        theme: 'dark',
        callback: (token) => setTurnstileToken(token),
      });
    }
  }, [siteKey]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = formRef.current;
    const rawFormData = new FormData(form);
    rawFormData.set('cf-turnstile-response', turnstileToken); // ✅ ensure token is included

    const formData = new URLSearchParams(rawFormData); // ✅ format for form handler

    const name = rawFormData.get('name');
    const email = rawFormData.get('email');
    const phone = rawFormData.get('phone');

    try {
      // First: Submit to your internal contact handler
      const res = await fetch('/api/contact', {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();

      if (res.ok) {
        setSuccessMessage('✅ Your message has been sent!');
        form.reset();
        setTurnstileToken('');
        setTimeout(() => setSuccessMessage(''), 30000);
      } else {
        setSuccessMessage(`❌ ${result.error || 'Something went wrong.'}`);
        setTimeout(() => setSuccessMessage(''), 30000);
      }
    } catch (err) {
      setSuccessMessage('❌ Submission failed. Please try again.');
      setTimeout(() => setSuccessMessage(''), 30000);
    }
  };

  return (
    <section className={styles.gridSection}>
      {/* LEFT COLUMN — Contact Form */}
      <div className={styles.leftColumn}>
        <h2>{contact.formTitle}</h2>

        <form ref={formRef} onSubmit={handleSubmit} className={styles.form}>
          <label>
            Name*<input type="text" name="name" required className={styles.input} />
          </label>
          <label>
            Email*<input type="email" name="email" required className={styles.input} />
          </label>
          <label>
            Phone<input type="tel" name="phone" className={styles.input} />
          </label>

          <fieldset className={styles.fieldset}>
            <legend>Preferred Contact Method</legend>
            <label>
              <input type="radio" name="contactMethod" value="email" defaultChecked />
              <span>Email</span>
            </label>
            <label>
              <input type="radio" name="contactMethod" value="phone" />
              <span>Phone</span>
            </label>
            <label>
              <input type="radio" name="contactMethod" value="text" />
              <span>Text</span>
            </label>
          </fieldset>

          <label>
            Message*
            <textarea name="message" rows="5" required className={styles.textarea}></textarea>
          </label>

          <div className={styles.turnstile}>
            <div ref={turnstileRef} className="cf-turnstile" />
            <input type="hidden" name="cf-turnstile-response" value={turnstileToken} />
          </div>

          <button type="submit" className={styles.button}>
            {contact.submitButtonLabel}
          </button>

          {successMessage && (
            <div className={styles.successMessage}>
              {successMessage}
            </div>
          )}
        </form>
      </div>

      {/* RIGHT COLUMN — Info */}
      <div className={styles.rightColumn}>
        {contact.contactImage?.asset?.url && (
          <div className={styles.profileImageWrapper}>
            <img
              src={contact.contactImage.asset.url}
              alt="Profile"
              className={styles.profileImage}
            />
          </div>
        )}

        <div className={styles.contactInfo}>
          <h3>Contact Info</h3>
          {contact.contactEmail && (
            <p>
              Email: <a href={`mailto:${contact.contactEmail}`}>{contact.contactEmail}</a>
            </p>
          )}
          {contact.contactPhone && (
            <p>
              Phone: <a href={`tel:${contact.contactPhone}`}>{contact.contactPhone}</a>
            </p>
          )}
        </div>

        <div className={styles.socialIcons}>
          {socialLinks.map((item, idx) => {
            const Icon = iconMap[item.platform];
            return (
              Icon && (
                <a
                  key={idx}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={item.platform}
                >
                  <Icon />
                </a>
              )
            );
          })}
        </div>
      </div>
    </section>
  );
}
