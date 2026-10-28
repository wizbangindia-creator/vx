import React from "react";
import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Clock, MessageCircle, ChevronRight, ArrowRight } from "lucide-react";

import PageShell from "../components/site/PageShell";
import Seo from "../components/site/Seo";
import VxStyleTag, { SectionHeader } from "../components/site/VxStyle";
import LeadForm from "../components/site/LeadForm";
import { BRANCHES } from "../data/branches";

const PHONE_DISPLAY = "+91 98759 85641";
const PHONE_DIAL = "+919875985641";
const EMAIL = "info@visaxpert.in";

export default function ContactPage() {
  return (
    <PageShell>
      <Seo
        title="Contact VisaXpert · Free consultation · 5 branches"
        description="Get in touch with VisaXpert via phone, email or WhatsApp. Visit our 5 branches across Punjab, Jammu and Berlin. Free 15-minute consultation."
        path="/contact"
      />
      <VxStyleTag />

      <section className="relative overflow-hidden bg-white">
        <div className="absolute inset-0 vx-grid-bg pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-12 lg:pt-20 lg:pb-16">
          <nav className="text-xs text-slate-500 mb-6 flex items-center gap-1.5" aria-label="breadcrumb">
            <Link to="/" className="hover:text-blue-700">Home</Link>
            <ChevronRight size={12} />
            <span className="text-slate-700 font-medium">Contact</span>
          </nav>
          <p className="text-xs uppercase tracking-wider font-semibold text-blue-700">Contact VisaXpert</p>
          <h1 className="mt-4 text-[44px] sm:text-[58px] lg:text-[72px] leading-[1.04] tracking-tight font-display text-slate-900">
            Talk to a counsellor.<br /><span className="font-display italic text-slate-500">Today.</span>
          </h1>
          <p className="mt-5 text-lg text-slate-600 max-w-2xl">
            Walk in, call, WhatsApp or email — whichever you prefer. We respond within one working day.
          </p>
        </div>
      </section>

      {/* Contact options + form */}
      <section className="pb-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 space-y-4">
            <ContactCard Icon={Phone} title="Call us" body={PHONE_DISPLAY} href={`tel:${PHONE_DIAL}`} hint="Mon–Sat · 10 AM – 7 PM IST" testId="contact-phone" />
            <ContactCard Icon={MessageCircle} title="WhatsApp" body="Chat instantly" href="https://wa.me/919875985641" hint="Usually replies within minutes" testId="contact-whatsapp" external />
            <ContactCard Icon={Mail} title="Email" body={EMAIL} href={`mailto:${EMAIL}`} hint="For documents, queries, partnerships" testId="contact-email" />
            <ContactCard Icon={MapPin} title="Visit a branch" body="5 walk-in offices · Punjab, Jammu, Berlin" href="/branches" hint="See addresses + opening hours" testId="contact-visit" />
          </div>
          <div className="lg:col-span-5">
            <LeadForm
              source="contact_page"
              campaign="contact_page_form"
              testId="contact-form"
              title="Send us a message"
              sub="Fill this in and your counsellor will call you back."
            />
          </div>
        </div>
      </section>

      {/* Branches list */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Our branches"
            title={<>Five offices.<br /><span className="font-display italic text-slate-500">One reliable team.</span></>}
          />
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {BRANCHES.map((b) => (
              <Link
                key={b.slug}
                to={`/branches/${b.slug}`}
                className="group p-7 rounded-3xl bg-white border border-slate-100 hover:border-blue-200 hover:shadow-xl hover:-translate-y-1 transition-all"
                data-testid={`contact-branch-${b.slug}`}
              >
                <span className="inline-block text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">{b.tagline}</span>
                <h3 className="mt-4 text-2xl font-display text-slate-900 group-hover:text-blue-700 transition-colors">VisaXpert · {b.city} {b.flag}</h3>
                <p className="text-sm text-slate-500 mt-1">{b.region}</p>
                <div className="mt-5 pt-5 border-t border-slate-100 space-y-2.5 text-sm">
                  <p className="flex items-center gap-2 text-slate-700"><Phone size={14} className="text-blue-600" /> {b.phone}</p>
                  <p className="flex items-center gap-2 text-slate-700"><Clock size={14} className="text-blue-600" /> {b.hours[0]?.time || "Mon–Sat"}</p>
                </div>
                <span className="inline-flex items-center gap-1 text-sm text-blue-700 font-semibold mt-5 group-hover:gap-2 transition-all">
                  Open branch page <ArrowRight size={13} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Berlin map (Berlin = our flagship overseas office) */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader eyebrow="On-ground in Germany" title="Our Berlin office" intro="Belziger Strasse 69-71, 10823 Berlin · supporting students after they land." />
          <div className="mt-8 rounded-3xl overflow-hidden border border-slate-100 shadow-lg" style={{ height: 420 }}>
            <iframe
              title="VisaXpert Berlin office map"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2429.45!2d13.346!3d52.488!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0!2sBelziger+Strasse+69-71+10823+Berlin!5e0!3m2!1sen!2sde!4v1700000000004"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
            />
          </div>
        </div>
      </section>
    </PageShell>
  );
}

function ContactCard({ Icon, title, body, href, hint, testId, external }) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="flex items-center gap-5 p-6 rounded-3xl bg-white border border-slate-100 hover:border-blue-200 hover:shadow-xl transition-all group"
      data-testid={testId}
    >
      <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-700 grid place-items-center shrink-0 group-hover:bg-blue-700 group-hover:text-white transition-colors">
        <Icon size={22} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs uppercase tracking-wider font-bold text-slate-500">{title}</p>
        <p className="text-lg font-semibold text-slate-900 mt-0.5 truncate">{body}</p>
        <p className="text-xs text-slate-500 mt-0.5">{hint}</p>
      </div>
      <ArrowRight size={18} className="text-slate-400 group-hover:text-blue-700 group-hover:translate-x-1 transition-all shrink-0" />
    </a>
  );
}
