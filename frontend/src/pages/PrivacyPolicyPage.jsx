import { Link } from "react-router-dom";
import { ShieldCheck, ArrowLeft } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50" data-testid="privacy-policy-page">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 text-sm font-medium" data-testid="privacy-back-home">
            <ArrowLeft size={16} /> Back to Home
          </Link>
          <div className="inline-flex items-center gap-2 text-blue-600 font-bold">
            <ShieldCheck size={18} /> VisaXpert
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2">Privacy Policy</h1>
        <p className="text-slate-500 mb-10">Last updated: January 2026</p>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-10 space-y-8 text-slate-700 leading-relaxed">

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">1. About VisaXpert</h2>
            <p>
              VisaXpert International is a private overseas-education consultancy operated from India with branch
              offices in Ludhiana, Amritsar, Pathankot and Jammu, and a representative office in Berlin, Germany.
              We are an independent consulting firm and are <strong>not affiliated with any government body, embassy,
              consulate, or university</strong>. We provide guidance, documentation support, and counselling services
              for students applying for higher education and study visas abroad.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">2. What information we collect</h2>
            <p className="mb-2">When you submit a form on our website, we collect only the data you voluntarily provide:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Full name</li>
              <li>Email address</li>
              <li>Mobile / phone number</li>
              <li>City and country of interest</li>
              <li>Preferred counselling mode and any additional details you choose to share</li>
            </ul>
            <p className="mt-3">
              We do not collect government IDs, passwords, payment details, or any sensitive personal data on this
              website. We do not run keystroke loggers or hidden trackers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">3. How we use your information</h2>
            <p className="mb-2">Your information is used strictly for:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Contacting you to schedule a counselling session</li>
              <li>Sending you information about your study-abroad query</li>
              <li>Sending event reminders (e.g., Germany Education Fair) you registered for</li>
              <li>Improving our services and counselling quality</li>
            </ul>
            <p className="mt-3">
              We will never sell, rent or trade your personal data. We do not share your information with third
              parties for marketing purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">4. Communication consent</h2>
            <p>
              By submitting a form on our website, you consent to be contacted by VisaXpert via phone call, SMS,
              email and/or WhatsApp regarding your enquiry. You can opt out at any time by replying
              &quot;STOP&quot; to a WhatsApp/SMS message or by emailing
              <a href="mailto:info@visaxpertinternational.co.in" className="text-blue-600 underline ml-1">info@visaxpertinternational.co.in</a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">5. Cookies and analytics</h2>
            <p>
              We use Google Tag Manager, Google Analytics and Google Ads conversion tracking to understand how
              visitors use our site and to measure ad performance. These tools may set cookies in your browser.
              You can disable cookies in your browser settings; doing so will not prevent you from submitting our
              forms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">6. Data retention and security</h2>
            <p>
              Your data is stored securely on encrypted databases. We retain enquiry data for as long as is
              necessary to serve your application and for legitimate business / legal record-keeping purposes
              (typically up to 5 years), after which it is deleted on request.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">7. Your rights</h2>
            <p className="mb-2">You have the right to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Request a copy of the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data (&quot;right to be forgotten&quot;)</li>
              <li>Withdraw consent for further communication</li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, email
              <a href="mailto:info@visaxpertinternational.co.in" className="text-blue-600 underline ml-1">info@visaxpertinternational.co.in</a>
              with the subject line &quot;Privacy Request&quot;. We respond within 7 business days.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">8. Important disclaimer</h2>
            <p>
              <strong>VisaXpert does not guarantee visa approvals or university admissions.</strong> Visa decisions
              are made solely by the destination country&apos;s embassy/consulate. Admission decisions are made
              solely by the respective university. Any discounts, scholarships or fee waivers mentioned on our
              promotional pages (e.g., &ldquo;up to &euro;1000 discount&rdquo;, &ldquo;up to 50% processing-fee
              waiver&rdquo;) are <strong>indicative offers from participating universities at our education fairs,
              subject to the university&apos;s own evaluation and approval</strong>. They are not guaranteed.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">9. Contact us</h2>
            <p>
              <strong>VisaXpert International</strong><br />
              Email: <a href="mailto:info@visaxpertinternational.co.in" className="text-blue-600 underline">info@visaxpertinternational.co.in</a><br />
              Phone (India): <a href="tel:9875985641" className="text-blue-600 underline">+91 9875985641</a><br />
              Berlin Office: Belziger Strasse 69-71, 10823, Berlin, Germany
            </p>
          </section>

          <section className="pt-4 border-t border-slate-200">
            <p className="text-sm text-slate-500">
              See also our <Link to="/terms" className="text-blue-600 underline">Terms of Service</Link>.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
