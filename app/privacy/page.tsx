export default function PrivacyPolicy() {
  return (
    <article style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px', lineHeight: 1.7, color: 'var(--text-primary)' }}>
      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>Privacy Policy</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>Last updated: May 20, 2026</p>

      <section style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>1. Introduction</h2>
        <p style={{ color: 'var(--text-secondary)' }}>All In One Social Media ("we", "our", or "the App") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our social media scheduling application.</p>
      </section>

      <section style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>2. Information We Collect</h2>
        <ul style={{ paddingLeft: 20, color: 'var(--text-secondary)' }}>
          <li style={{ marginBottom: 8 }}><strong style={{ color: 'var(--text-primary)' }}>OAuth Tokens:</strong> When you connect a social media account, we store the access tokens needed to post on your behalf.</li>
          <li style={{ marginBottom: 8 }}><strong style={{ color: 'var(--text-primary)' }}>Content Data:</strong> Text, images, and videos you submit for posting or scheduling.</li>
          <li style={{ marginBottom: 8 }}><strong style={{ color: 'var(--text-primary)' }}>Usage Data:</strong> Basic usage information to improve the App's performance.</li>
        </ul>
      </section>

      <section style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>3. How We Use Your Information</h2>
        <ul style={{ paddingLeft: 20, color: 'var(--text-secondary)' }}>
          <li style={{ marginBottom: 8 }}>To authenticate with connected social media platforms on your behalf</li>
          <li style={{ marginBottom: 8 }}>To publish or schedule content you create</li>
          <li style={{ marginBottom: 8 }}>To provide and improve the App's features</li>
        </ul>
      </section>

      <section style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>4. TikTok Data</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 12 }}>When you connect your TikTok account, we access only the permissions you explicitly grant. Specifically:</p>
        <ul style={{ paddingLeft: 20, color: 'var(--text-secondary)', marginBottom: 12 }}>
          <li style={{ marginBottom: 8 }}><strong style={{ color: 'var(--text-primary)' }}>video.upload</strong> — to upload video content on your behalf</li>
          <li style={{ marginBottom: 8 }}><strong style={{ color: 'var(--text-primary)' }}>video.publish</strong> — to publish videos to your TikTok profile</li>
          <li style={{ marginBottom: 8 }}><strong style={{ color: 'var(--text-primary)' }}>user.info.basic</strong> — to identify your account</li>
        </ul>
        <p style={{ color: 'var(--text-secondary)' }}>We do not sell, share, or transfer your TikTok data to any third parties. TikTok data is used solely to operate the posting features of this App.</p>
      </section>

      <section style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>5. Data Storage and Security</h2>
        <p style={{ color: 'var(--text-secondary)' }}>OAuth tokens are stored securely and encrypted. We implement industry-standard security measures to protect your data from unauthorized access.</p>
      </section>

      <section style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>6. Data Retention</h2>
        <p style={{ color: 'var(--text-secondary)' }}>We retain your data only as long as necessary to provide the service. You can disconnect any social media account at any time, which will delete the associated tokens from our system.</p>
      </section>

      <section style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>7. Third-Party Services</h2>
        <p style={{ color: 'var(--text-secondary)' }}>The App integrates with third-party social media platforms (TikTok, Instagram, YouTube, Facebook, LinkedIn, X). Your use of these platforms is governed by their respective privacy policies.</p>
      </section>

      <section style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>8. Your Rights</h2>
        <p style={{ color: 'var(--text-secondary)' }}>You have the right to access, correct, or delete your personal data at any time. To exercise these rights, disconnect your accounts from the App's Settings page.</p>
      </section>

      <section style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>9. Changes to This Policy</h2>
        <p style={{ color: 'var(--text-secondary)' }}>We may update this Privacy Policy periodically. We will notify you of any significant changes by updating the date at the top of this page.</p>
      </section>

      <section style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>10. Contact Us</h2>
        <p style={{ color: 'var(--text-secondary)' }}>If you have questions about this Privacy Policy, please contact us through the App's support channel.</p>
      </section>
    </article>
  );
}
