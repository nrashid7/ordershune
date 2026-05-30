export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 prose prose-slate">
      <h1>Terms of Service</h1>
      <p className="text-muted-foreground">Last updated: May 30, 2026</p>
      <p>
        By using OrderShune you agree to these terms. OrderShune is provided as-is for order
        management assistance; you remain responsible for accurate customer data and courier bookings.
      </p>
      <h2>Accounts</h2>
      <p>You must provide accurate shop information and keep login credentials secure.</p>
      <h2>Acceptable use</h2>
      <p>Do not use the service for unlawful sales, spam, or harassment. We may suspend accounts that abuse the platform.</p>
      <h2>Payments</h2>
      <p>Paid plans renew monthly via Stripe unless canceled. Refunds are handled case-by-case.</p>
      <h2>Limitation of liability</h2>
      <p>
        We are not liable for courier delays, lost parcels, or incorrect AI extractions. Always verify
        orders before dispatch.
      </p>
      <p>
        Questions: <a href="mailto:support@ordershune.com">support@ordershune.com</a>
      </p>
    </div>
  );
}
