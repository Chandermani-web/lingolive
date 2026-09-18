import { useEffect } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Radio, MessageCircle, Users, Heart, Bell,
  Video, Mic, Sparkles, ArrowRight, Play
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export default function LandingPage() {
  useEffect(() => {
    const tl = gsap.timeline();

    tl.from(".hero-title", {
      y: 40,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
    })
      .from(".hero-desc", { y: 20, opacity: 0, duration: 0.6 }, "-=0.4")
      .from(".hero-cta", { y: 20, opacity: 0, duration: 0.6 }, "-=0.3")
      .from(".hero-visual", { scale: 0.9, opacity: 0, duration: 0.8 }, "-=0.5");

    gsap.utils.toArray(".reveal-up").forEach((el) => {
      gsap.fromTo(
        el,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 85%" },
        }
      );
    });

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  const features = [
    {
      icon: MessageCircle,
      title: "Real-Time Messaging",
      desc: "Instant chat with reactions, media sharing, and read receipts",
      color: "#EC4899",
    },
    {
      icon: Video,
      title: "HD Video Calls",
      desc: "Crystal-clear peer-to-peer video powered by WebRTC",
      color: "#3B82F6",
    },
    {
      icon: Mic,
      title: "Voice Rooms",
      desc: "Join live audio conversations with friends and communities",
      color: "#22D3EE",
    },
    {
      icon: Users,
      title: "Smart Connections",
      desc: "Discover people who share your interests and passions",
      color: "#8B5CF6",
    },
    {
      icon: Heart,
      title: "Social Feed",
      desc: "Share moments, get reactions, and build your presence",
      color: "#10B981",
    },
    {
      icon: Bell,
      title: "Live Notifications",
      desc: "Never miss a message, like, comment, or friend request",
      color: "#F59E0B",
    },
  ];

  const steps = [
    { n: "01", title: "Create Account", desc: "Sign up in under 30 seconds with just an email" },
    { n: "02", title: "Build Your Profile", desc: "Add your story, interests, and social links" },
    { n: "03", title: "Connect & Chat", desc: "Find friends, send messages, start calls" },
    { n: "04", title: "Grow Your Network", desc: "Share posts and expand your community" },
  ];

  return (
    <div className="min-h-screen bg-[#05070A] text-[#F8FAFC] overflow-x-hidden">
      {/* Fixed ambient background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full blur-3xl opacity-30"
          style={{
            background: "radial-gradient(circle, rgba(124,58,237,0.18), transparent 65%)",
          }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-[600px] h-[600px] rounded-full blur-3xl opacity-30"
          style={{
            background: "radial-gradient(circle, rgba(37,99,235,0.15), transparent 65%)",
          }}
        />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 sticky top-0 backdrop-blur-xl bg-[#05070A]/80 border-b border-[#18202B]">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#3B82F6] flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Radio className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-lg font-bold tracking-tight">
              Lingo<span className="text-gradient-brand">Live</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/login" className="btn-ghost text-sm">
              Sign In
            </Link>
            <Link to="/signup" className="btn-primary text-sm py-2">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 pt-16 md:pt-24 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="hero-title">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0F141C] border border-[#18202B] text-xs text-[#A1A1AA] mb-6">
                <span className="w-1.5 h-1.5 bg-[#10B981] rounded-full animate-pulse" />
                Now with HD video calls
              </span>
              <h1 className="heading-hero text-white mb-6">
                Better conversations.
                <br />
                <span className="text-gradient-brand">Bigger dreams.</span>
              </h1>
            </div>

            <p className="hero-desc text-base md:text-lg text-[#A1A1AA] leading-relaxed mb-8 max-w-lg">
              Connect with people who matter. Chat in real time, jump on calls,
              share moments, and grow your network — all in one calm, focused workspace.
            </p>

            <div className="hero-cta flex flex-wrap gap-3">
              <Link to="/signup" className="btn-primary text-base py-3.5 px-6">
                Join Now
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/login" className="btn-secondary text-base py-3.5 px-6">
                <Play className="w-4 h-4" />
                Explore Rooms
              </Link>
            </div>

            {/* Stats strip */}
            <div className="flex items-center gap-6 mt-10 pt-8 border-t border-[#111820]">
              {[
                { value: "10K+", label: "Active Users" },
                { value: "50K+", label: "Messages Sent" },
                { value: "24/7", label: "Live Rooms" },
              ].map((s) => (
                <div key={s.label}>
                  <div className="text-xl font-bold text-white">{s.value}</div>
                  <div className="text-xs text-[#71717A]">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero Visual */}
          <div className="hero-visual relative">
            <div className="relative rounded-2xl overflow-hidden border border-[#18202B] bg-[#0A0E14]">
              <img
                src="/pexels-pixabay-41949.jpg"
                alt="LingoLive"
                className="w-full h-[420px] object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#05070A] via-transparent to-transparent" />

              {/* Floating notification card */}
              <div className="absolute top-6 left-6 right-6 p-3 rounded-xl bg-[#0F141C]/90 backdrop-blur-xl border border-[#18202B] flex items-center gap-3">
                <img src="/avatar.svg" alt="" className="w-9 h-9 rounded-full" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white font-medium truncate">Sarah started a room</p>
                  <p className="text-[10px] text-[#71717A]">Tech Talk · English</p>
                </div>
                <span className="badge-live">LIVE</span>
              </div>

              {/* Bottom stats card */}
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl bg-[#0F141C]/90 backdrop-blur-xl border border-[#18202B]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map((i) => (
                        <img
                          key={i}
                          src={`/avatar.svg`}
                          alt=""
                          className="w-7 h-7 rounded-full border-2 border-[#0F141C]"
                        />
                      ))}
                    </div>
                    <span className="text-xs text-[#A1A1AA] ml-1">+42 in room</span>
                  </div>
                  <Sparkles className="w-4 h-4 text-[#8B5CF6]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 py-20">
        <div className="text-center mb-12 reveal-up">
          <span className="text-xs font-semibold text-[#8B5CF6] uppercase tracking-widest">
            Features
          </span>
          <h2 className="heading-xl text-white mt-3 mb-3">
            Everything you need
          </h2>
          <p className="text-[#A1A1AA] max-w-lg mx-auto">
            A single workspace for communication, connection, and community.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="card p-6 reveal-up"
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                style={{ background: `${f.color}15`, border: `1px solid ${f.color}30` }}
              >
                <f.icon className="w-5 h-5" style={{ color: f.color }} />
              </div>
              <h3 className="heading-sm text-white mb-2">{f.title}</h3>
              <p className="text-sm text-[#A1A1AA] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="reveal-up">
            <span className="text-xs font-semibold text-[#22D3EE] uppercase tracking-widest">
              How it works
            </span>
            <h2 className="heading-xl text-white mt-3 mb-8">
              Get started in minutes
            </h2>
            <div className="space-y-5">
              {steps.map((step) => (
                <div key={step.n} className="flex gap-4">
                  <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-[#0F141C] border border-[#18202B] flex items-center justify-center text-sm font-bold text-[#8B5CF6]">
                    {step.n}
                  </div>
                  <div>
                    <h3 className="heading-sm text-white mb-1">{step.title}</h3>
                    <p className="text-sm text-[#A1A1AA]">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="reveal-up rounded-2xl overflow-hidden border border-[#18202B] bg-[#0A0E14]">
            <video className="w-full" controls poster="/Screenshot1.png">
              <source src="/glob.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
      </section>

      {/* Screenshots */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 py-20">
        <div className="text-center mb-12 reveal-up">
          <span className="text-xs font-semibold text-[#EC4899] uppercase tracking-widest">
            Preview
          </span>
          <h2 className="heading-xl text-white mt-3 mb-3">
            Clean, focused interface
          </h2>
          <p className="text-[#A1A1AA] max-w-lg mx-auto">
            Every screen stays out of your way so conversations shine.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="card overflow-hidden reveal-up"
            >
              <img
                src={`/Screenshot${n}.png`}
                alt={`Screenshot ${n}`}
                className="w-full h-56 object-cover"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative z-10 max-w-4xl mx-auto px-4 md:px-6 py-20">
        <div className="text-center mb-12 reveal-up">
          <span className="text-xs font-semibold text-[#10B981] uppercase tracking-widest">
            Testimonials
          </span>
          <h2 className="heading-xl text-white mt-3">
            Loved by people who connect daily
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {[
            {
              quote: "The chat and calls are unbelievably fast and stable. Perfect for keeping in touch with friends worldwide.",
              name: "Amit Sharma",
              role: "Student",
              color: "#3B82F6",
            },
            {
              quote: "Clean interface, instant notifications, and easy profile management. LingoLive makes social learning simple.",
              name: "Sarthak Verma",
              role: "Developer",
              color: "#8B5CF6",
            },
          ].map((t) => (
            <div key={t.name} className="card p-6 reveal-up">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} style={{ color: t.color }}>★</span>
                ))}
              </div>
              <p className="text-sm text-[#A1A1AA] italic leading-relaxed mb-4">
                "{t.quote}"
              </p>
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold"
                  style={{ background: t.color }}
                >
                  {t.name[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{t.name}</p>
                  <p className="text-xs text-[#71717A]">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-4xl mx-auto px-4 md:px-6 py-20">
        <div className="card-static p-10 md:p-14 text-center relative overflow-hidden reveal-up">
          <div
            className="absolute inset-0 opacity-40 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at 50% 50%, rgba(124,58,237,0.20), transparent 60%)",
            }}
          />
          <div className="relative">
            <h2 className="heading-xl text-white mb-4">
              Ready to <span className="text-gradient-brand">connect</span>?
            </h2>
            <p className="text-[#A1A1AA] mb-8 max-w-lg mx-auto">
              Join thousands of people having better conversations every day.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/signup" className="btn-primary text-base py-3.5 px-6">
                Start for free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/login" className="btn-secondary text-base py-3.5 px-6">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[#111820] py-8 text-center">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#3B82F6] flex items-center justify-center">
              <Radio className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold text-white">LingoLive</span>
          </div>
          <p className="text-xs text-[#71717A]">
            © {new Date().getFullYear()} LingoLive. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}