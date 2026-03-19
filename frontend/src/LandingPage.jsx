import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

export default function LandingPage() {
  useEffect(() => {
    const tl = gsap.timeline();

    // header animation
    tl.from("header h1 span span", {
      y: -100,
      opacity: 0,
      stagger: 0.1,
      duration: 0.1,
      ease: "power2.out",
    });

    gsap.from("header div", {
      scale: 0,
      opacity: 1,
      delay: 1,
      duration: 1,
      ease: "power2.out",
    });

    gsap.from("header p", {
      y: 50,
      opacity: 0,
      duration: 0.5,
      delay: 0.5,
      ease: "power2.out",
    });

    // gsap.to("header h1 span span", {
    //   y: 0,
    //   opacity: 1,
    //   duration: 0.5,
    //   scrollTrigger: {
    //     trigger: "header h1",
    //     start: "top center",
    //     end: "bottom 80%",
    //     scrub: 5,
    //   },
    // });

    // features animation
    // tl.fromTo(
    //   ".feature-card h2",
    //   { y: -50, opacity: 0 },
    //   {
    //     y: 0,
    //     opacity: 1,
    //     duration: 0.5,
    //     scrollTrigger: {
    //       trigger: ".feature-card h2",
    //       start: "top bottom",
    //       end: "bottom 80%",
    //       scrub: 5,
    //     },
    //   }
    // );
    tl.fromTo(
      ".feature-card div",
      { y: 50, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.1,
        stagger: 0.1,
        scrollTrigger: {
          trigger: ".feature-card",
          start: "top bottom",
          end: "bottom 100%",
          scrub: 5,
        },
      }
    );

    // demo section animation
    tl.fromTo(
      ".demo-section h2",
      { y: -50, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.5,
        scrollTrigger: {
          trigger: ".demo-section h2",
          start: "top bottom",
          end: "bottom 80%",
          scrub: 5,
        },
      }
    );

    tl.fromTo(
      ".demo-section div ul li",
      { x: -50, opacity: 0 },
      {
        x: 0,
        opacity: 1,
        duration: 0.5,
        stagger: 0.4,
        scrollTrigger: {
          trigger: ".demo-section div",
          start: "top bottom",
          end: "bottom 70%",
          scrub: 5,
        },
      }
    );

    // testimonial section animation
    tl.fromTo(
      ".testimonials-section h2",
      { y: -50, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.5,
        scrollTrigger: {
          trigger: ".testimonials-section h2",
          start: "top bottom",
          end: "bottom 80%",
          scrub: 5,
        },
      }
    );

    tl.fromTo(
      ".testimonials-section div div",
      { y: 50, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.5,
        scrollTrigger: {
          trigger: ".testimonials-section div",
          start: "top bottom",
          end: "bottom 80%",
          scrub: 5,
        },
      }
    );
  }, []);
  const FeatureImage = [
    "/image1.png",
    "/image2.png",
    "/image3.png",
    "/image4.png",
  ];
  return (
    <div className="min-h-screen bg-[var(--color-primary)] text-[var(--color-text)] overflow-x-hidden">
      {/* Hero Section */}
      <header className="py-16 px-6 text-center bg-gradient-to-br from-[var(--color-secondary)]/30 via-[var(--color-primary)] to-[var(--color-highlight)]/20 flex flex-col justify-center relative">
        <img
          src="/pexels-pixabay-41949.jpg"
          className="absolute top-0 left-0 w-full h-full object-cover opacity-25"
        />

        <h1 className="text-4xl md:text-5xl text-[var(--color-highlight)] drop-shadow tracking-tight leading-tight font-semibold max-w-5xl mx-auto">
          {"Build professional connections with a calm, focused workspace"
            .split(" ")
            .map((word, index) => (
              <span key={index} className="inline-block mr-2">
                {word.split("").map((char, charIndex) => (
                  <span key={charIndex} className="inline-block">
                    {char}
                  </span>
                ))}
              </span>
            ))}
        </h1>
        <p className="text-lg md:text-xl text-[var(--color-muted)] max-w-3xl mx-auto mb-8">
          LingoLive keeps the interface neutral so your ideas stand out. Share
          updates, talk with friends, and manage notifications without
          distractions.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-6 z-10">
          <Link
            to="/signup"
            className="bg-[var(--color-secondary)] text-[var(--color-text)] transition py-3 px-5 rounded-md text-sm font-semibold header-first-link hover:bg-[var(--color-accent)]"
          >
            Create an Account
          </Link>
          <Link
            to="/login"
            className=" bg-[var(--color-highlight)] text-[var(--color-text)] py-3 px-5 rounded-md text-sm font-semibold transition header-second-link hover:bg-[var(--color-accent)]"
          >
            Login
          </Link>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-16 px-6 max-w-5xl mx-auto relative feature-card">
        <div className="text-center mb-10 space-y-3">
          <p className="text-sm uppercase tracking-[0.2em] text-[var(--color-highlight)]">
            Platform highlights
          </p>
          <h2 className="text-3xl font-semibold">
            Everything you need, nothing you don't
          </h2>
          <p className="text-[var(--color-muted)]">
            A single workspace for sharing posts, messaging, and managing your
            network.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-10">
          <div className="bg-[var(--color-secondary)] rounded-xl p-7 flex flex-col items-center shadow-lg">
            <img
              src="/image1.png"
              alt="Real-time Chat"
              className="mb-5 rounded-lg w-40 h-32 object-cover"
            />
            <h3 className="text-xl font-[font1] text-[var(--color-highlight)] mb-2">
              Real-Time Communication
            </h3>
            <p className="font-[font2] text-[var(--color-text)]">
              Instant messaging, voice calls, and video calls, powered by WebRTC
              and Socket.io.
            </p>
          </div>
          <div className="bg-[var(--color-highlight)]/20 text-[var(--color-text)] rounded-xl p-7 flex flex-col items-center shadow-lg">
            <img
              src="/image2.png"
              alt="User Management"
              className="mb-5 rounded-lg w-40 h-32 object-cover"
            />
            <h3 className="text-xl font-[font1] text-[var(--color-text)] mb-2">
              Seamless User Management
            </h3>
            <p className="font-[font2] text-[var(--color-muted)]">
              Secure registration, profile customization, friend requests, and
              social connections—all under your control.
            </p>
          </div>
          <div className="bg-[var(--color-accent)] rounded-xl p-7 flex flex-col items-center shadow-lg">
            <img
              src="/image3.png"
              alt="Engagement"
              className="mb-5 rounded-lg w-40 h-32 object-cover"
            />
            <h3 className="text-xl font-[font1] text-[var(--color-primary)] mb-2">
              Engage & Share
            </h3>
            <p className="font-[font2] text-[var(--color-primary)]">
              Create posts, like, comment, explore the feed, showcase your
              activities, and celebrate community achievements.
            </p>
          </div>
          <div className="bg-[var(--color-highlight)]/30 rounded-xl p-7 flex flex-col items-center shadow-lg">
            <img
              src="/image4.png"
              alt="Notifications"
              className="mb-5 rounded-lg w-40 h-32 object-cover"
            />
            <h3 className="text-xl font-[font1] text-[var(--color-highlight)] mb-2">
              Live Notifications
            </h3>
            <p className="font-[font2] text-[var(--color-text)]">
              Stay updated with instant alerts for every like, comment, friend
              request, and message.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works & Demo Section */}
      <section className="py-16 px-6 bg-gradient-to-tr from-[var(--color-primary)] via-[var(--color-secondary)]/70 to-[var(--color-highlight)]/40 demo-section">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.2em] text-[var(--color-muted)]">
              Working rhythm
            </p>
            <h2 className="text-3xl font-semibold">
              A predictable flow from sign-up to growth
            </h2>
            <ul className="space-y-4 text-[var(--color-text)]">
              {[
                "Register and set up your profile in minutes.",
                "Find people you already know or discover new peers.",
                "Share updates, reply to comments, and refine your feed.",
                "Stay on top of messages and notifications from one place.",
              ].map((item, index) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-1 text-sm font-semibold text-[var(--color-highlight)]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl p-6">
            <video
              className="rounded-lg w-full"
              controls
              poster="/Screenshot1.png"
            >
              <source src="/glob.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
      </section>

      {/* Screenshot/Gallery Section */}
      <section className="py-16 px-6 relative overflow-hidden screenshot-section">
        <div className="text-center mb-10 space-y-3">
          <p className="text-sm uppercase tracking-[0.2em] text-[var(--color-highlight)]">
            Product preview
          </p>
          <h2 className="text-3xl font-semibold">
            Screens that stay understated
          </h2>
          <p className="text-[var(--color-muted)]">
            Simple cards, open space, and readable type across every page.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((item) => (
            <img
              key={item}
              src={`/Screenshot${item}.png`}
              alt={`Screenshot ${item}`}
              className="rounded-lg border border-[var(--color-secondary)] object-cover h-56 w-full"
            />
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 px-6 bg-gradient-to-r from-[var(--color-secondary)] via-[var(--color-primary)] to-[var(--color-highlight)]/40 testimonials-section">
        <div className="max-w-4xl mx-auto text-center space-y-3 mb-10">
          <p className="text-sm uppercase tracking-[0.2em] text-[var(--color-highlight)]">
            Testimonials
          </p>
          <h2 className="text-3xl font-semibold text-[var(--color-text)]">
            Trusted by people who work online every day
          </h2>
        </div>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="bg-[var(--color-secondary)] rounded-xl p-6 shadow text-[var(--color-text)]">
            <p className="italic">
              “The chat and calls are unbelievably fast and stable—perfect for
              connecting with my friends globally!”
            </p>
            <span className="block mt-4 font-semibold">— Amit, Student</span>
          </div>
          <div className="bg-[var(--color-highlight)]/30 rounded-xl p-6 shadow text-[var(--color-text)]">
            <p className="italic">
              “I love the instant notifications and easy profile management.
              LingoLive makes social learning simple.”
            </p>
            <span className="block mt-4 font-semibold">
              — Sarthak, Developer
            </span>
          </div>
        </div>
      </section>

      {/* About & Call to Action Section */}
      <section className="py-16 px-6 max-w-3xl mx-auto text-center about-section">
        <p className="text-sm uppercase tracking-[0.2em] text-[var(--color-highlight)]">
          About the product
        </p>
        <h2 className="text-3xl text-[var(--color-highlight)] font-semibold mt-3 mb-4">
          A professional network with calm defaults
        </h2>
        <p className="text-[var(--color-muted)] mb-8">
          LingoLive focuses on structure and reliability. Profiles, feeds,
          messages, and notifications live in a single layout so you can move
          quickly without relearning the interface.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/signup"
            className="px-5 py-3 rounded-md text-sm font-semibold bg-[var(--color-secondary)] text-[var(--color-text)] hover:bg-[var(--color-accent)]"
          >
            Start for free
          </Link>
          <Link
            to="/login"
            className="px-5 py-3 rounded-md text-sm font-semibold bg-[var(--color-highlight)] text-[var(--color-text)] hover:bg-[var(--color-accent)]"
          >
            Returning user? Sign in
          </Link>
        </div>
      </section>

      <footer className="py-8 text-center text-[var(--color-muted)] text-sm opacity-75 border-t border-[var(--color-secondary)]">
        &copy; {new Date().getFullYear()} LingoLive by Chandermani Mishra • All
        Rights Reserved
      </footer>

      <style jsx="true">{`
        @keyframes slideScreens {
          0% {
            transform: translateX(-80px);
          }
          100% {
            transform: translateX(80px);
          }
        }

        .animate-slideScreens {
          animation: slideScreens 6s ease-in-out infinite alternate;
        }

        .screenshot-section {
          background: linear-gradient(
            135deg,
            #091413 0%,
            #285a48 50%,
            #0e4ccc 100%
          );
          position: relative;
        }

        /* 💨 The fog that actually HIDES edges */
        .screenshots-wrapper {
          position: relative;
          mask-image: linear-gradient(
            to right,
            transparent 0%,
            rgba(255, 255, 255, 1) 20%,
            rgba(255, 255, 255, 1) 80%,
            transparent 100%
          );
          -webkit-mask-image: linear-gradient(
            to right,
            transparent 0%,
            rgba(255, 255, 255, 1) 20%,
            rgba(255, 255, 255, 1) 80%,
            transparent 100%
          );
          mask-repeat: no-repeat;
          mask-size: 100%;
          -webkit-mask-repeat: no-repeat;
          -webkit-mask-size: 100%;
        }

        /* Optional: slightly visible white mist over edges */
        // .screenshot-section::before,
        // .screenshot-section::after {
        //   content: "";
        //   position: absolute;
        //   top: 0;
        //   width: 20%;
        //   height: 100%;
        //   pointer-events: none;
        //   background: radial-gradient(
        //     circle at center,
        //     rgba(255, 255, 255, 0.8) 0%,
        //     rgba(255, 255, 255, 0.4) 40%,
        //     transparent 100%
        //   );
        //   filter: blur(30px);
        // }

        .screenshot-section::before {
          left: 0;
        }

        .screenshot-section::after {
          right: 0;
          transform: scaleX(-1);
        }
      `}</style>
    </div>
  );
}
