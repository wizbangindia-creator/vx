import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import {
  GraduationCap,
  MapPin,
  Phone,
  Calendar,
  ArrowRight,
  CheckCircle2,
  X,
  MessageCircle,
  Sparkles,
  Gift,
  Users,
  BadgeCheck,
  Ticket,
  Shield,
  Clock,
  Star,
} from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const DEFAULT_LOGO = "/assets/visaxpert-logo.png";
const WHATSAPP_NUMBER = "918264812231";

const eventSchedule = [
  {
    city: "Jammu",
    date: "25th May 2026",
    day: "Monday",
    targetDate: "2026-05-25T10:00:00",
    address: "83-B/B, adjoining R K Chouhan Jewellers, Gandhi Nagar, Jammu",
    phone: "098788 66657",
    color: "from-rose-500 to-orange-500",
    bgColor: "bg-rose-50",
    textColor: "text-rose-700",
  },
  {
    city: "Pathankot",
    date: "26th May 2026",
    day: "Tuesday",
    targetDate: "2026-05-26T10:00:00",
    address: "Dhangu Rd, opp. Hotel Venice Lane, Jodhamal Colony, Pathankot",
    phone: "080547 78465",
    color: "from-violet-500 to-purple-600",
    bgColor: "bg-violet-50",
    textColor: "text-violet-700",
  },
  {
    city: "Amritsar",
    date: "27th May 2026",
    day: "Wednesday",
    targetDate: "2026-05-27T10:00:00",
    address: "LGF, SCO-21, Block-B, District Shopping Complex, Ranjit Avenue",
    phone: "082848 37654",
    color: "from-blue-500 to-indigo-600",
    bgColor: "bg-blue-50",
    textColor: "text-blue-700",
  },
  {
    city: "Ludhiana",
    date: "28th May 2026",
    day: "Thursday",
    targetDate: "2026-05-28T10:00:00",
    address: "LGF, SCO-17, Model Town Extension Market, Near Krishna Mandir Rd",
    phone: "098881 94266",
    color: "from-emerald-500 to-teal-600",
    bgColor: "bg-emerald-50",
    textColor: "text-emerald-700",
  },
];

const universities = [
  { name: "GISMA University of Applied Sciences", logo: "/assets/universities/germany/gisma.jpg" },
  { name: "Media Design University of Applied Sciences", logo: "/assets/universities/germany/ue.jpg" },
  { name: "Arden University", logo: "/assets/universities/germany/arden.jpg" },
  { name: "BSBI University", logo: "/assets/universities/germany/bsbi.jpg" },
  { name: "Cologne Business School", logo: "/assets/universities/germany/cbs.svg" },
  { name: "SRH University", logo: "/assets/universities/germany/srh.jpg" },
  { name: "University of Europe for Applied Sciences", logo: "/assets/universities/germany/ue.jpg" },
  { name: "UE Amsterdam", logo: "/assets/universities/germany/ue.jpg" },
];

const benefits = [
  { icon: Gift, title: "Upto \u20AC1000 Additional Discount", description: "Exclusive additional discount of up to \u20AC1000 on university tuition fees for all fair attendees", highlight: "Upto \u20AC1000 OFF", sub: "in tuition fee", color: "from-amber-400 to-orange-500" },
  { icon: Sparkles, title: "Upto 50% Fee Waiver", description: "Get upto 50% waiver on processing fees when you register at the fair", highlight: "Upto 50% WAIVER", sub: "in processing fee", color: "from-emerald-400 to-teal-500" },
  { icon: Users, title: "Meet University Reps", description: "Representatives of private universities & specialists of public universities are joining", highlight: "FACE-TO-FACE", sub: "", color: "from-blue-400 to-indigo-500" },
  { icon: BadgeCheck, title: "Spot Admissions", description: "Get on-the-spot admission offers from participating universities", highlight: "INSTANT ADMIT", sub: "", color: "from-violet-400 to-purple-500" },
];

// Countdown Hook
function useCountdown(targetDate) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculate = () => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const diff = target - now;
      if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      };
    };
    setTimeLeft(calculate());
    const timer = setInterval(() => setTimeLeft(calculate()), 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return timeLeft;
}

// Countdown Card for schedule
function CountdownDisplay({ targetDate, color }) {
  const { days, hours, minutes, seconds } = useCountdown(targetDate);
  return (
    <div className="grid grid-cols-4 gap-1.5 mt-4" data-testid="countdown-timer">
      {[
        { val: days, label: "Days" },
        { val: hours, label: "Hrs" },
        { val: minutes, label: "Min" },
        { val: seconds, label: "Sec" },
      ].map((item, i) => (
        <div key={i} className="text-center">
          <div className={`bg-gradient-to-br ${color} text-white rounded-lg py-1.5 text-lg font-black leading-none shadow-sm`}>
            {String(item.val).padStart(2, "0")}
          </div>
          <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-medium">{item.label}</p>
        </div>
      ))}
    </div>
  );
}

export default function GermanyFairPage() {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", city: "", preferred_city: "" });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [imageErrors, setImageErrors] = useState({});
  const [reviews, setReviews] = useState([]);
  const [logoUrl, setLogoUrl] = useState(DEFAULT_LOGO);
  const [partnerLogos, setPartnerLogos] = useState([]);
  const formRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${API}/reviews?page=germany_fair`);
        if (res.data?.reviews?.length > 0) setReviews(res.data.reviews);
      } catch (e) {
        console.error("Failed to fetch reviews:", e);
      }
      try {
        const res = await axios.get(`${API}/page-logos`);
        if (res.data?.germany_fair) setLogoUrl(res.data.germany_fair);
      } catch (e) {
        console.error("Failed to fetch logo:", e);
      }
      try {
        const res = await axios.get(`${API}/partner-logos?page=germany_fair`);
        setPartnerLogos(res.data?.logos || []);
      } catch (e) {
        console.error("Failed to fetch partner logos:", e);
      }
    };
    fetchData();
  }, []);

  const handleImageError = (index) => setImageErrors((prev) => ({ ...prev, [index]: true }));
  const scrollToForm = () => formRef.current?.scrollIntoView({ behavior: "smooth" });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone") {
      const numericValue = value.replace(/\D/g, "").slice(0, 12);
      setFormData((prev) => ({ ...prev, [name]: numericValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const n = {};
    if (!formData.name || formData.name.trim().length < 2) n.name = "Please enter your full name";
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) n.email = "Please enter a valid email";
    if (!formData.phone || !/^(\d{10}|\d{12})$/.test(formData.phone)) n.phone = "Please enter a valid 10 or 12 digit phone number";
    if (!formData.city || formData.city.trim().length < 2) n.city = "Please enter your city";
    if (!formData.preferred_city) n.preferred_city = "Please select a preferred fair city";
    setErrors(n);
    return Object.keys(n).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      await axios.post(`${API}/webhook/lead`, {
        name: formData.name, email: formData.email, phone: formData.phone,
        city: formData.city, country: "Germany", source: "germany_fair",
        campaign: `Germany Fair 2026 - ${formData.preferred_city}`, platform: "germany_fair_landing",
        preferred_city: formData.preferred_city,
      });
      setShowThankYou(true);
      setFormData({ name: "", email: "", phone: "", city: "", preferred_city: "" });
      toast.success("Registration successful!");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white" data-testid="germany-fair-page">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <img src={logoUrl} alt="VisaXpert" className="h-10 md:h-12" onError={(e) => { e.target.src = DEFAULT_LOGO; }} />
            <div className="hidden md:block border-l border-slate-200 pl-3">
              <p className="text-[10px] uppercase tracking-widest text-amber-600 font-bold leading-none">The Germany</p>
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold leading-none">Study Abroad Specialist</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a href="tel:9875985641" className="hidden sm:flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Phone size={16} /> 9875985641
            </a>
            <button onClick={scrollToForm}
              className="px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full text-sm font-bold hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg shadow-amber-500/25"
              data-testid="nav-register-btn">
              Register Free
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16 md:pt-24 md:pb-24 relative overflow-hidden" ref={formRef}>
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-amber-500 rounded-full blur-[150px]"></div>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-red-600 rounded-full blur-[120px]"></div>
        </div>
        <div className="absolute inset-0" style={{ backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIi8+PC9zdmc+')", backgroundSize: "40px 40px" }}></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-300 px-4 py-2 rounded-full text-sm font-bold mb-6 border border-amber-500/30">
                <Ticket size={16} />
                FREE ENTRY — Limited Seats
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-6">
                Germany
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">Education Fair</span>
                <span className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white/80">2026</span>
              </h1>

              <p className="text-lg text-white/70 mb-8 max-w-lg mx-auto lg:mx-0">
                Meet top German universities, get exclusive scholarships & on-the-spot admissions across Punjab & Jammu
              </p>

              <div className="flex flex-wrap gap-3 justify-center lg:justify-start mb-8">
                {eventSchedule.map((event, i) => (
                  <div key={i} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/10">
                    <MapPin size={14} className="text-amber-400" />
                    <span className="text-white text-sm font-medium">{event.city}</span>
                    <span className="text-white/50 text-xs">|</span>
                    <span className="text-amber-300 text-xs font-bold">{event.date.split(" ")[0]} May</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-6 justify-center lg:justify-start">
                <div className="text-center">
                  <p className="text-3xl font-black text-amber-400">Upto {"\u20AC"}1000</p>
                  <p className="text-xs text-white/60 uppercase tracking-wider">Extra Discount</p>
                  <p className="text-[10px] text-white/40">on tuition fee</p>
                </div>
                <div className="w-px bg-white/20"></div>
                <div className="text-center">
                  <p className="text-3xl font-black text-emerald-400">Upto 50%</p>
                  <p className="text-xs text-white/60 uppercase tracking-wider">Fee Waiver</p>
                  <p className="text-[10px] text-white/40">in processing fee</p>
                </div>
                <div className="w-px bg-white/20"></div>
                <div className="text-center max-w-[160px]">
                  <p className="text-3xl font-black text-blue-400 leading-tight">10+</p>
                  <p className="text-xs text-white/60 uppercase tracking-wider leading-tight">University Officials</p>
                  <p className="text-[10px] text-white/40 mt-1">& public university experts</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="w-full max-w-md mx-auto lg:mx-0 lg:ml-auto order-1 lg:order-2" id="register-form">
              <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 border border-slate-100">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-1.5 rounded-full text-xs font-bold mb-3 border border-amber-200">
                    <Sparkles size={14} /> FREE REGISTRATION
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900" data-testid="fair-form-title">Reserve Your Spot</h2>
                  <p className="text-slate-500 text-sm mt-1">Limited seats available — Register now!</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4" data-testid="fair-registration-form">
                  <div>
                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Full Name *"
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-sm ${errors.name ? "border-red-400" : "border-slate-200"}`} data-testid="fair-input-name" />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Email Address *"
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-sm ${errors.email ? "border-red-400" : "border-slate-200"}`} data-testid="fair-input-email" />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>
                  <div className="flex">
                    <span className="flex items-center px-3 bg-slate-100 border border-r-0 border-slate-200 rounded-l-xl text-sm text-slate-500 font-medium">+91</span>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="Mobile Number *" maxLength={12}
                      className={`w-full px-4 py-3 border rounded-r-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-sm ${errors.phone ? "border-red-400" : "border-slate-200"}`} data-testid="fair-input-phone" />
                  </div>
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                  <div>
                    <input type="text" name="city" value={formData.city} onChange={handleInputChange} placeholder="Your City *"
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-sm ${errors.city ? "border-red-400" : "border-slate-200"}`} data-testid="fair-input-city" />
                    {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                  </div>
                  <div>
                    <select name="preferred_city" value={formData.preferred_city} onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-sm ${errors.preferred_city ? "border-red-400" : "border-slate-200"}`} data-testid="fair-select-city">
                      <option value="">Select Fair Location *</option>
                      <option value="Jammu">Jammu — 25th May</option>
                      <option value="Pathankot">Pathankot — 26th May</option>
                      <option value="Amritsar">Amritsar — 27th May</option>
                      <option value="Ludhiana">Ludhiana — 28th May</option>
                    </select>
                    {errors.preferred_city && <p className="text-red-500 text-xs mt-1">{errors.preferred_city}</p>}
                  </div>
                  <button type="submit" disabled={isSubmitting}
                    className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-bold text-base hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2"
                    data-testid="fair-submit-btn">
                    {isSubmitting ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : <>Register for Free <ArrowRight size={18} /></>}
                  </button>
                </form>
                <p className="text-[10px] text-slate-400 mt-3 text-center">By registering, you agree to receive communications from VisaXpert</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VisaXpert Branding — Why Trust Us */}
      <section className="py-16 md:py-20 bg-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-72 h-72 bg-amber-100 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 opacity-60"></div>
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-orange-100 rounded-full blur-[100px] translate-x-1/2 translate-y-1/2 opacity-60"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <img src={logoUrl} alt="VisaXpert" className="h-12 mx-auto mb-4" onError={(e) => { e.target.src = DEFAULT_LOGO; }} />
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-2">
              The Germany Study Abroad Specialist
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto">Trusted by thousands of students | Branch Office in Berlin</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-5">
            <div className="relative group" data-testid="brand-stat-visas">
              <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-6 text-center text-white shadow-lg shadow-amber-500/20 group-hover:shadow-xl group-hover:shadow-amber-500/30 transition-all group-hover:-translate-y-1">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <GraduationCap size={24} className="text-white" />
                </div>
                <p className="text-4xl font-black">4000+</p>
                <p className="text-white/80 text-sm font-medium mt-1">Germany Visas Processed</p>
              </div>
            </div>
            <div className="relative group" data-testid="brand-stat-years">
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-center text-white shadow-lg shadow-slate-500/20 group-hover:shadow-xl group-hover:shadow-slate-500/30 transition-all group-hover:-translate-y-1">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Clock size={24} className="text-amber-400" />
                </div>
                <p className="text-4xl font-black">14+</p>
                <p className="text-white/60 text-sm font-medium mt-1">Years of Experience</p>
              </div>
            </div>
            <div className="relative group" data-testid="brand-stat-success">
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-center text-white shadow-lg shadow-emerald-500/20 group-hover:shadow-xl group-hover:shadow-emerald-500/30 transition-all group-hover:-translate-y-1">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Shield size={24} className="text-white" />
                </div>
                <p className="text-4xl font-black">Best</p>
                <p className="text-white/80 text-sm font-medium mt-1">Visa Success Rate for Germany</p>
              </div>
            </div>
            <div className="relative group" data-testid="brand-stat-icef">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-center text-white shadow-lg shadow-blue-500/20 group-hover:shadow-xl group-hover:shadow-blue-500/30 transition-all group-hover:-translate-y-1">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <BadgeCheck size={24} className="text-white" />
                </div>
                <p className="text-4xl font-black">ICEF</p>
                <p className="text-white/80 text-sm font-medium mt-1">Certified Agency</p>
              </div>
            </div>
            <div className="relative group col-span-2 lg:col-span-1" data-testid="brand-stat-berlin">
              <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-6 text-center text-white shadow-lg shadow-violet-500/20 group-hover:shadow-xl group-hover:shadow-violet-500/30 transition-all group-hover:-translate-y-1">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <MapPin size={24} className="text-white" />
                </div>
                <p className="text-4xl font-black">Berlin</p>
                <p className="text-white/80 text-sm font-medium mt-1">Branch Office in Germany</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 mb-4" data-testid="benefits-heading">Why You Must Attend</h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">Exclusive benefits only for fair attendees — Don't miss out!</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="group relative bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden" data-testid={`benefit-card-${index}`}>
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${benefit.color}`}></div>
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${benefit.color} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform`}>
                  <benefit.icon size={24} className="text-white" />
                </div>
                <div className={`inline-block px-3 py-1 rounded-full text-xs font-black tracking-wider mb-3 bg-gradient-to-r ${benefit.color} text-white`}>{benefit.highlight}</div>
                {benefit.sub && <p className="text-[10px] text-slate-400 -mt-1 mb-2">{benefit.sub}</p>}
                <h3 className="text-lg font-bold text-slate-900 mb-2">{benefit.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Event Schedule with Countdown Timers */}
      <section className="py-16 md:py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 mb-4" data-testid="schedule-heading">Fair Schedule</h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">4 cities, 4 days — Choose the one nearest to you</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {eventSchedule.map((event, index) => (
              <div key={index} className="group relative bg-white rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-slate-100" data-testid={`schedule-card-${event.city.toLowerCase()}`}>
                <div className={`h-2 bg-gradient-to-r ${event.color}`}></div>
                <div className="p-6">
                  <div className={`inline-flex items-center gap-2 ${event.bgColor} ${event.textColor} px-3 py-1.5 rounded-full text-xs font-bold mb-4`}>
                    <Calendar size={14} /> {event.day}
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-1">{event.city}</h3>
                  <p className={`text-lg font-bold ${event.textColor} mb-3`}>{event.date}</p>

                  {/* Countdown Timer */}
                  <CountdownDisplay targetDate={event.targetDate} color={event.color} />

                  <div className="space-y-3 text-sm text-slate-500 mt-4">
                    <div className="flex items-start gap-2">
                      <MapPin size={16} className="text-slate-400 mt-0.5 flex-shrink-0" />
                      <span>{event.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={16} className="text-slate-400 flex-shrink-0" />
                      <a href={`tel:${event.phone.replace(/\s/g, "")}`} className="hover:text-blue-600 font-medium">{event.phone}</a>
                    </div>
                  </div>
                  <button onClick={scrollToForm} className={`w-full mt-5 py-2.5 bg-gradient-to-r ${event.color} text-white rounded-xl font-bold text-sm hover:shadow-lg transition-all`}>
                    Register for {event.city}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Participating Universities - Logos Only */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 mb-4" data-testid="universities-heading">Participating Universities</h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">Meet representatives from Germany's top universities</p>
          </div>
          {(() => {
            const combinedUnis = [
              ...universities,
              ...partnerLogos.map((l) => ({
                name: l.name,
                logo: (l.logo_url || "").replace(/^\/assets\/uploads\//, "/api/uploads/"),
              })),
            ];
            return (
              <>
                <div className="relative overflow-hidden mb-10">
                  <div className="flex gap-12 md:gap-16 animate-scroll items-center">
                    {[...combinedUnis, ...combinedUnis].map((uni, index) => (
                      <div key={index} className="flex-shrink-0 w-[130px] md:w-[160px] h-[80px] md:h-[100px] flex items-center justify-center" title={uni.name} data-testid={`fair-uni-${index}`}>
                        {imageErrors[index % combinedUnis.length] ? (
                          <span className="text-2xl font-bold text-amber-600">{uni.name.charAt(0)}</span>
                        ) : (
                          <img src={uni.logo} alt={uni.name} className="max-w-full max-h-full object-contain grayscale hover:grayscale-0 transition-all duration-300" onError={() => handleImageError(index % combinedUnis.length)} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {combinedUnis.map((uni, index) => (
                    <div key={index} className="flex items-center gap-3 bg-slate-50 rounded-xl p-4 border border-slate-100 hover:border-amber-200 hover:bg-amber-50/30 transition-all" data-testid={`fair-uni-card-${index}`}>
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-slate-200 flex-shrink-0">
                        <GraduationCap size={20} className="text-amber-600" />
                      </div>
                      <span className="text-sm font-medium text-slate-700 leading-tight">{uni.name}</span>
                    </div>
                  ))}
                </div>
              </>
            );
          })()}
        </div>
      </section>

      {/* Video Section */}
      <section className="py-16 md:py-24 bg-slate-50" data-testid="fair-video-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 mb-4">Watch & Learn More</h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">See what awaits you at the Germany Education Fair 2026</p>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl bg-slate-900">
              <video
                controls
                className="absolute inset-0 w-full h-full object-cover"
                data-testid="fair-video"
                preload="metadata"
              >
                <source src="/assets/videos/germanyfair.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      {reviews.length > 0 && (
        <section className="py-16 md:py-24 bg-white" data-testid="fair-reviews-section">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 mb-4">What Our Students Say</h2>
              <p className="text-slate-500 text-lg max-w-2xl mx-auto">Real stories from students who attended our Germany fairs</p>
            </div>
            <div className="relative overflow-hidden" data-testid="fair-reviews-slider">
              <div className="flex gap-6 md:gap-8 animate-reviews-scroll w-max">
                {[...reviews, ...reviews].map((review, index) => (
                  <div
                    key={`${review.review_id || "r"}-${index}`}
                    className="flex-shrink-0 w-[320px] md:w-[380px] bg-slate-50 rounded-2xl p-6 border border-slate-100 hover:shadow-lg transition-all"
                    data-testid={`fair-review-${index}`}
                  >
                    <div className="flex gap-1 mb-4">
                      {[...Array(review.rating || 5)].map((_, i) => (
                        <Star key={i} size={18} className="fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-slate-600 mb-6 leading-relaxed">"{review.content}"</p>
                    <div className="flex items-center gap-3">
                      {review.image_url ? (
                        <img src={review.image_url.replace(/^\/assets\/uploads\//, "/api/uploads/")} alt={review.name} className="w-12 h-12 rounded-full object-cover" />
                      ) : (
                        <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-lg">{review.name.charAt(0)}</span>
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-slate-900">{review.name}</p>
                        <p className="text-sm text-slate-500">Studies in {review.country}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white to-transparent"></div>
              <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white to-transparent"></div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>
        <div className="absolute inset-0 opacity-15">
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-amber-500 rounded-full blur-[150px]"></div>
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-orange-500 rounded-full blur-[150px]"></div>
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-6">Don't Miss This Opportunity</h2>
          <p className="text-lg text-white/70 mb-8 max-w-2xl mx-auto">Get exclusive discounts, meet university reps, and secure your admission — all in one place!</p>
          <button onClick={scrollToForm} className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full font-bold text-lg hover:from-amber-600 hover:to-orange-600 transition-all shadow-2xl shadow-amber-500/30" data-testid="cta-register-btn">
            Register Now — It's Free <ArrowRight size={20} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <img src={logoUrl} alt="VisaXpert" className="h-10 mb-3 brightness-200" onError={(e) => { e.target.src = DEFAULT_LOGO; }} />
              <p className="text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">The Germany Study Abroad Specialist</p>
              <p className="text-slate-500 text-sm">4000+ Germany Visas since 2012. ICEF Certified. Best visa success rate for Germany.</p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Our Branches</h4>
              <ul className="space-y-4 text-sm text-slate-400">
                {eventSchedule.map((branch, i) => (
                  <li key={i} className="flex items-start gap-2" data-testid={`footer-branch-${branch.city.toLowerCase()}`}>
                    <MapPin size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />
                    <div className="space-y-0.5">
                      <p className="text-white font-semibold">{branch.city}</p>
                      <p className="text-xs text-slate-400 leading-snug">{branch.address}</p>
                      <a href={`tel:${branch.phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-1 text-xs text-slate-300 hover:text-white transition-colors">
                        <Phone size={11} className="text-amber-500" /> {branch.phone}
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Berlin Office</h4>
              <div className="space-y-3 text-sm text-slate-400">
                <div className="flex items-start gap-2">
                  <MapPin size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />
                  <span>Belziger Strasse 69-71, 10823, Berlin, Germany</span>
                </div>
                <a href="tel:+491784555932" className="flex items-center gap-2 hover:text-white transition-colors">
                  <Phone size={14} className="text-amber-500" /> +49 1784555932
                </a>
                <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white transition-colors">
                  <MessageCircle size={14} className="text-green-500" /> WhatsApp Us
                </a>
              </div>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Contact India</h4>
              <div className="space-y-3 text-sm text-slate-400">
                <a href="tel:9875985641" className="flex items-center gap-2 hover:text-white transition-colors">
                  <Phone size={14} className="text-amber-500" /> 9875985641
                </a>
                <a href="mailto:info@visaxpertinternational.co.in" className="flex items-center gap-2 hover:text-white transition-colors">
                  <MessageCircle size={14} className="text-amber-500" /> info@visaxpertinternational.co.in
                </a>
                <p className="text-slate-500 text-xs pt-2">Branches in Ludhiana, Amritsar, Pathankot & Jammu</p>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
            <p>Germany Education Fair 2026 by VisaXpert International. All rights reserved.</p>
            <p className="mt-2">VisaXpert is a private organization. We do not guarantee visa approvals or admissions.</p>
          </div>
        </div>
      </footer>

      {/* WhatsApp */}
      <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hi,%20I'm%20interested%20in%20the%20Germany%20Education%20Fair%202026`} target="_blank" rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-xl hover:bg-green-600 transition-colors hover:scale-110" data-testid="whatsapp-btn">
        <MessageCircle size={28} className="text-white" fill="white" />
      </a>

      {/* Thank You Modal */}
      {showThankYou && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowThankYou(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center animate-fade-in-up">
            <button onClick={() => setShowThankYou(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X size={24} /></button>
            <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={40} className="text-white" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2" data-testid="thank-you-heading">You're Registered!</h3>
            <p className="text-slate-500 mb-6">Thank you for registering for the Germany Education Fair 2026. Our team will contact you shortly with event details.</p>
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
              <p className="text-amber-800 font-semibold text-sm">Arrive early to get the best interaction time with university representatives!</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
