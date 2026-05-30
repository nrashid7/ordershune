export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 prose prose-slate">
      <h1>Privacy Policy</h1>
      <p className="text-muted-foreground">Last updated: May 30, 2026</p>
      <p>
        OrderShune (&quot;we&quot;) helps Bangladeshi sellers process customer orders from WhatsApp,
        Messenger, Instagram, and the web dashboard. This policy describes what we collect and how we use it.
      </p>
      <h2>Data we collect</h2>
      <ul>
        <li>Account email, shop profile, and pickup address</li>
        <li>Customer order details (names, phones, addresses, products, COD amounts)</li>
        <li>Courier API credentials (encrypted at rest when configured)</li>
        <li>Messages and media processed to extract orders (text, screenshots, voice transcripts)</li>
      </ul>
      <h2>How we use data</h2>
      <p>
        We use your data only to provide order extraction, courier formatting, booking, notifications,
        and billing. We do not sell personal data.
      </p>
      <h2>Third parties</h2>
      <p>
        We may send data to Supabase (hosting/database), OpenAI (extraction/transcription), Meta
        (WhatsApp/Messenger/Instagram), Stripe (payments), and courier partners you connect.
      </p>
      <h2>Your rights</h2>
      <p>
        Contact <a href="mailto:support@ordershune.com">support@ordershune.com</a> to request export or
        deletion of your account data.
      </p>
    </div>
  );
}
