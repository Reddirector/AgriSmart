// ============================================================
// AgriSmart — Legal Pages (Privacy Policy & Terms of Service)
// ============================================================
import { Card } from '@/components/ui';
import { FileText,Shield } from 'lucide-react';

export function LegalPage({ type }: { type: 'privacy' | 'terms' }) {
  const isPrivacy = type === 'privacy';

  const privacySections = [
    { title: '1. Information We Collect', body: 'AgriSmart collects account information (name, phone, email), farm data (location, crop details, sensor readings), verification status tokens, and transaction records. We do not store complete Aadhaar numbers, raw identity documents, or OTP secrets. Sensitive data is masked and encrypted at rest.' },
    { title: '2. How We Use Your Information', body: 'Your information is used to provide farm monitoring, marketplace listings, trade agreements, payment processing, and verification services. We use verification tokens (not raw identity data) to confirm identity status. Sensor data is used for real-time monitoring, trust scoring, and contract condition validation.' },
    { title: '3. Data Storage & Security', body: 'Data is stored in encrypted PostgreSQL databases with TimescaleDB for time-series sensor data. Authentication tokens are stored in HTTP-only secure cookies — never in localStorage. Blockchain stores only agreement hashes, document hashes, transaction states, and timestamps — never personal information.' },
    { title: '4. Data Retention', body: 'Verification tokens and consent records are retained per regulatory requirements. Sensor data is retained for the duration of active farm monitoring plus a configurable retention period. Users may request data deletion subject to legal and contractual obligations.' },
    { title: '5. Consent Records', body: 'Every verification action requires explicit user consent. Consent records include what was verified, when, by which provider, and the verification result (token only). Users may withdraw consent and request deletion of associated verification records.' },
    { title: '6. Third-Party Sharing', body: 'We do not sell user data. Verification is performed through authorized providers who return only verification tokens and status. Payment processing uses regulated providers with their own privacy policies. Blockchain transaction data is publicly visible on the Polygon network but contains only hashes and wallet references — no personal data.' },
    { title: '7. Your Rights', body: 'You have the right to access your data, request corrections, withdraw consent, request deletion (subject to legal requirements), and export your data. Contact privacy@agrismart.demo to exercise these rights.' },
    { title: '8. Sandbox Disclaimer', body: 'This is a development sandbox. All identity verification (Aadhaar, KCC), payment processing, and government integrations use mock data. No real connections to UIDAI, banks, or government systems exist in this demo.' },
  ];

  const termsSections = [
    { title: '1. Acceptance of Terms', body: 'By accessing AgriSmart, you agree to these Terms of Service and all applicable laws and regulations. This is a sandbox demo platform — no real financial transactions, identity verification, or government integrations are active.' },
    { title: '2. User Roles & Responsibilities', body: 'Farmers are responsible for accurate farm data and produce listings. Buyers are responsible for legitimate offers and timely payments. Field verifiers are responsible for honest inspections. Administrators manage platform integrity. All users must comply with verification requirements.' },
    { title: '3. Trade Agreements', body: 'Agreements created on AgriSmart are recorded with on-chain hashes for immutability. In the sandbox, agreements use Polygon Amoy testnet with mock ERC-20 tokens. In production, agreements would be enforced through regulated escrow providers and applicable contract law.' },
    { title: '4. Payment Terms', body: 'Sandbox payments use testnet tokens with no real value. Production payments would use regulated Indian payment providers (UPI, bank transfer) with compliant escrow. The platform never claims that blockchain tokens represent real Indian rupees. Payment release requires multi-source verification — never a single unverified sensor reading.' },
    { title: '5. Data Integrity & Oracle Risk', body: 'The platform implements a 17-layer data trust system to prevent oracle manipulation. Users acknowledge that sensor data is validated through device signatures, multi-sensor comparison, weather cross-referencing, and human verification. Tampering with sensor data is prohibited and may result in account suspension.' },
    { title: '6. Verification & Identity', body: 'Sandbox verification uses mock data clearly labeled as such. Production verification would use authorized UIDAI-compatible providers and DigiLocker. The platform stores only verification tokens — never complete identity numbers. Misrepresentation of identity is prohibited.' },
    { title: '7. Dispute Resolution', body: 'Trade disputes are resolved through evidence-based review including sensor data, verifier attestations, inspection reports, and delivery confirmation. The platform provides dispute management tools but does not replace legal remedies available under applicable law.' },
    { title: '8. Limitation of Liability', body: 'AgriSmart is provided "as is" without warranties. The platform is not liable for sensor failures, data anomalies, payment provider issues, or third-party verification results. Liability is limited to the extent permitted by applicable law.' },
    { title: '9. Account Suspension', body: 'Accounts may be suspended for fraud, data tampering, identity misrepresentation, violation of terms, or suspicious activity. Administrators review cases before action. Suspended users may appeal through the support system.' },
    { title: '10. Sandbox Disclaimer', body: 'This platform is a development sandbox. No real financial services, government integrations, or identity verification connections are active. All data is simulated for demonstration purposes.' },
  ];

  const sections = isPrivacy ? privacySections : termsSections;

  return (
    <div className="animate-fade-in">
      <section className="bg-gradient-to-br from-brand-soft to-brand-cream py-12">
        <div className="section text-center max-w-3xl mx-auto">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-primary text-white mx-auto mb-4">
            {isPrivacy ? <Shield className="w-7 h-7" /> : <FileText className="w-7 h-7" />}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-brand-text mb-2">
            {isPrivacy ? 'Privacy Policy' : 'Terms of Service'}
          </h1>
          <p className="text-sm text-brand-muted">Last updated: July 2026 · Sandbox demo version</p>
        </div>
      </section>

      <section className="py-12">
        <div className="section max-w-3xl mx-auto">
          <Card className="p-6 sm:p-8 space-y-6">
            {sections.map(s => (
              <div key={s.title}>
                <h2 className="text-base font-semibold text-brand-text mb-2">{s.title}</h2>
                <p className="text-sm text-brand-muted leading-relaxed">{s.body}</p>
              </div>
            ))}
          </Card>
        </div>
      </section>
    </div>
  );
}
