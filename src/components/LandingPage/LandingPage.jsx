import React, { useCallback, useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { TypeAnimation } from "react-type-animation";
import { motion } from "framer-motion";
import "./LandingPage.css";
import Navbar from "../Navbar/Navbar";

import { useAuth } from "../../context/AuthContext";
import {
  Package, Box, Truck, Palette, ShoppingCart, Layers,
  Cpu, Zap, ArrowRight, ChevronLeft, ChevronRight,
  Shield, Clock, Recycle, Headphones, Star, CheckCircle,
  BarChart3
} from "lucide-react";

/* ─── Intersection Observer hook ─── */
function useInView(options = {}) {
  const ref = useRef(null);
  const [isInView, setIsInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsInView(true); if (options.once !== false) obs.unobserve(el); } },
      { threshold: options.threshold ?? 0.15, rootMargin: options.rootMargin ?? "0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return [ref, isInView];
}

/* ─── Animated counter ─── */
function AnimatedCounter({ target, suffix = "", duration = 2000 }) {
  const [count, setCount] = useState(0);
  const [ref, inView] = useInView({ threshold: 0.5 });
  useEffect(() => {
    if (!inView) return;
    const num = parseInt(target.replace(/[^0-9]/g, ""), 10);
    if (isNaN(num)) { setCount(target); return; }
    let start = 0;
    const step = Math.ceil(num / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= num) { setCount(num); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target, duration]);
  return <span ref={ref}>{typeof count === "number" ? count.toLocaleString() : count}{suffix}</span>;
}

/* ─── Data ─── */
const FEATURE_SLIDE_COUNT = 6;

const slides = [
  { num: 1, icon: Box, title: "3D Box Customizer", desc: "Design your perfect packaging with our interactive 3D customizer. Change colors, add logos, and see your design in real-time.", img: "1.png" },
  { num: 2, icon: Recycle, title: "Eco Mailer Boxes", desc: "Sustainable kraft mailers with 100% recycled materials. Fast, secure, and planet-friendly.", img: "2.png" },
  { num: 3, icon: Package, title: "Premium Packaging", desc: "High-quality boxes, mailers, and custom solutions designed to protect your products and elevate your brand.", img: "3.png" },
  { num: 4, icon: Truck, title: "Fast Shipping", desc: "Quick turnaround times with reliable shipping options. Track your orders every step of the way.", img: "4.png" },
  { num: 5, icon: Zap, title: "Easy Ordering", desc: "Simple online ordering process with flexible quantities and competitive pricing for all sizes.", img: "5.png" },
  { num: 6, icon: Palette, title: "Custom Branding", desc: "Upload your logo, choose your colors, and create packaging that perfectly represents your brand.", img: "6.png" },
];

const features = [
  { icon: Layers, title: "Multi-Role Architecture", subtitle: "Role-Based Access", desc: "Distinct dashboards for Admins, Business users, and Designers — each with tailored tools.", accent: "var(--deep-teal)" },
  { icon: Box, title: "Custom Catalogue", subtitle: "Packaging Library", desc: "Browse, filter, and order from an extensive catalogue of packaging solutions.", accent: "var(--vintage-grape)" },
  { icon: Cpu, title: "AI Integration", subtitle: "Smart Chatbot", desc: "Gemini-powered chatbot for instant packaging advice, sizing help, and order support.", accent: "var(--lavender-grey)" },
  { icon: Truck, title: "Shipping Solutions", subtitle: "Logistics Network", desc: "Integrated shipping with real-time tracking and partner carrier management.", accent: "var(--almond-silk)" },
];

const processSteps = [
  { num: "01", title: "Design Your Box", desc: "Use our 3D customizer to configure dimensions, materials, and branding.", icon: Palette },
  { num: "02", title: "Get an Instant Quote", desc: "AI-powered pricing engine delivers accurate quotes in seconds.", icon: BarChart3 },
  { num: "03", title: "Place Your Order", desc: "Add to cart, choose quantities, and check out securely.", icon: ShoppingCart },
  { num: "04", title: "Track & Receive", desc: "Real-time tracking from production to your doorstep.", icon: Truck },
];

/*const partners = [
  { name: "EgyptPost", type: "Shipping" },
  { name: "Aramex", type: "Shipping" },
  { name: "DHL Express", type: "Shipping" },
  { name: "Bosta", type: "Shipping" },
  { name: "Packtory", type: "Packaging" },
  { name: "BoxMakers", type: "Packaging" },
  { name: "KraftPack", type: "Packaging" },
  { name: "EcoPack", type: "Packaging" },
];*/

const stats = [
  { value: "50", suffix: "K+", label: "Happy Brands" },
  { value: "120", suffix: "+", label: "Countries Shipped" },
  { value: "1", suffix: "M+", label: "Custom Boxes Made" },
  { value: "99", suffix: "%", label: "Satisfaction Rate" },
];

const testimonials = [
  { text: "The floating 3D box in the hero instantly sold me. I customized my entire order in minutes. Perfect for my Giza-based startup!", author: "Ahmed El-Sayed", role: "Founder, Cairo Coffee Co.", initial: "A", color: "var(--almond-silk)" },
  { text: "Nermeen here — I just love how the 3D cube rotates smoothly. The design experience feels premium before I even place the order.", author: "Nermeen • Giza", role: "Product Designer", initial: "N", color: "var(--deep-teal)" },
  { text: "The top-of-page 3D preview is addictive. I shared the link with my team and they all wanted one. Best packaging tool I've used.", author: "Sara Mansour", role: "Brand Director, Alexandria", initial: "S", color: "var(--lavender-grey)" },
];

const trustBadges = [
  { icon: Shield, label: "Secure Checkout" },
  { icon: Clock, label: "7-Day Delivery" },
  { icon: Recycle, label: "100% Recyclable" },
  { icon: Headphones, label: "24/7 Design Support" },
];

/* ═══════════════════════ COMPONENT ═══════════════════════ */
const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [slideIndex, setSlideIndex] = useState(0);
  const [heroRef, heroInView] = useInView({ threshold: 0.1 });
  const [featRef, featInView] = useInView();
  const [procRef, procInView] = useInView();
  /*const [partRef, partInView] = useInView();*/
  const [statRef, statInView] = useInView();
  const [testRef, testInView] = useInView();
  const [trustRef, trustInView] = useInView();
  const [sliderRef, sliderInView] = useInView();
  const [ctaRef, ctaInView] = useInView();

  /* Parallax for hero */
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);



  /* Slider auto-play */
  const goToSlide = useCallback((index) => {
    setSlideIndex(((index % FEATURE_SLIDE_COUNT) + FEATURE_SLIDE_COUNT) % FEATURE_SLIDE_COUNT);
  }, []);
  const nextSlide = useCallback(() => setSlideIndex((i) => (i + 1) % FEATURE_SLIDE_COUNT), []);
  const prevSlide = useCallback(() => setSlideIndex((i) => (i - 1 + FEATURE_SLIDE_COUNT) % FEATURE_SLIDE_COUNT), []);
  useEffect(() => {
    const id = setInterval(() => setSlideIndex((i) => (i + 1) % FEATURE_SLIDE_COUNT), 2500);
    return () => clearInterval(id);
  }, []);

  const requireLogin = useCallback(
    (action) => { if (!user) { navigate("/login"); return; } action(); },
    [user, navigate]
  );

  return (
    <div className="landing-page">
      <Navbar />

      {/* ──────── HERO ──────── */}
      <section id="hero" className="lp-hero" ref={heroRef}>
        {/* Animated Gradient Mesh Background Blobs */}
        <div className="lp-mesh-bg">
          <div className="lp-mesh-blob lp-mesh-blob--1" />
          <div className="lp-mesh-blob lp-mesh-blob--2" />
          <div className="lp-mesh-blob lp-mesh-blob--3" />
          <div className="lp-mesh-blob lp-mesh-blob--4" />
          <div className="lp-mesh-blob lp-mesh-blob--5" />
        </div>
        <div className="lp-hero__noise" />

        <div className="lp-hero__container">
          <div className="lp-hero__grid">
            {/* Left */}
            <div className={`lp-hero__left ${heroInView ? "in-view" : ""}`} style={{ transform: `translateY(${scrollY * 0.08}px)` }}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              >
                <div className="lp-hero__badge lp-fade-up" style={{ "--delay": "0s" }}>
                  <span className="lp-hero__badge-dot" />
                  REAL-TIME 3D • PREMIUM UNBOXING
                </div>

                <h1 className="lp-hero__title">
                  <span className="lp-fade-up" style={{ "--delay": "0.1s" }}>The smarter way to</span>
                  <span className="lp-hero__title-accent lp-fade-up" style={{ "--delay": "0.25s" }}>
                    <TypeAnimation
                      sequence={[
                        "design your packaging.",
                        1200,
                        "build your brand box.",
                        1200,
                        "customize your wrapping.",
                        1200,
                        "ship your products.",
                        1200,
                        "seal every order.",
                        1200,
                        "deliver the unboxing.",
                        1200,
                      ]}
                      wrapper="span"
                      speed={50}
                      style={{ display: "inline-block" }}
                      repeat={Infinity}
                      cursor={true}
                      className="lp-hero__title-typing"
                    />
                  </span>
                </h1>

                <p className="lp-hero__desc lp-fade-up" style={{ "--delay": "0.3s" }}>
                  Elegant 3D studio experience. Portrait ratios & premium materials.<br />
                  Engineered live for your brand.
                </p>

                <div className="lp-hero__cta-group lp-fade-up" style={{ "--delay": "0.4s" }}>
                  <button
                    type="button"
                    onClick={() => requireLogin(() => navigate("/Design"))}
                    className="lp-btn lp-btn--primary"
                    id="hero-cta-customize"
                  >
                    <span>Start Customizing</span>
                    <ArrowRight size={20} />
                  </button>
                  <button
                    type="button"
                    onClick={() => requireLogin(() => navigate("/Catalog"))}
                    className="lp-btn lp-btn--outline"
                    id="hero-cta-catalog"
                  >
                    Explore Catalog
                  </button>
                </div>

                <div className="lp-hero__benefits lp-fade-up" style={{ "--delay": "0.5s" }}>
                  {["Premium Materials", "Ships in 7 Days", "Real-time 3D Preview", "Drag & Drop Ready"].map((b) => (
                    <div key={b} className="lp-hero__benefit">
                      <span className="lp-hero__benefit-dot" />
                      {b}
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Right — 3D Tall Vertical Packaging Box */}
            <div
              className={`lp-hero__right ${heroInView ? "in-view" : ""}`}
              style={{ transform: `translateY(${scrollY * -0.06}px)` }}
            >
              <div className="lp-box-wrapper">
                {/* Pulsing ambient glow aura behind box */}
                <div className="lp-box-glow" />

                <div className="cube-perspective">
                  <div className="lp-box-breathe">
                    <div className="lp-tall-box">
                      {/* Front — single debossed logo mark */}
                      <div className="lp-box-face face front">
                        <Package size={44} className="lp-box-logo-emboss" />
                        <div className="lp-box-ambient-gradient" />
                      </div>

                      {/* Back */}
                      <div className="lp-box-face face back">
                        <div className="lp-box-ambient-gradient" />
                      </div>

                      {/* Right */}
                      <div className="lp-box-face face right">
                        <div className="lp-box-ambient-gradient" />
                      </div>

                      {/* Left */}
                      <div className="lp-box-face face left">
                        <div className="lp-box-ambient-gradient" />
                      </div>

                      {/* Top */}
                      <div className="lp-box-face face top">
                        <div className="lp-box-ambient-gradient" />
                      </div>

                      {/* Bottom */}
                      <div className="lp-box-face face bottom">
                        <div className="lp-box-ambient-gradient" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ground shadow */}
                <div className="lp-box-ground-shadow" />

                <div className="lp-box__badge">
                  <span className="lp-box__badge-dot" />
                  3D STUDIO PREVIEW
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="lp-hero__scroll-indicator lp-fade-up" style={{ "--delay": "1.2s" }}>
          <div className="lp-hero__scroll-mouse">
            <div className="lp-hero__scroll-dot" />
          </div>
        </div>
      </section>

     {/* ──────── HOW IT WORKS ──────── */}
      <section className="lp-process" ref={procRef}>
        <div className="lp-container">
          <div className={`lp-section-header ${procInView ? "in-view" : ""}`}>
            <span className="lp-eyebrow lp-fade-up" style={{ "--delay": "0s" }}>HOW IT WORKS</span>
            <h2 className="lp-heading lp-fade-up" style={{ "--delay": "0.1s" }}>
              From Concept to <span className="lp-heading-accent">Doorstep</span>
            </h2>
            <p className="lp-subheading lp-fade-up" style={{ "--delay": "0.2s" }}>
              Four simple steps from design to delivery. Packaging made effortless.
            </p>
          </div>

          <div className="lp-process__timeline">
            {processSteps.map((step, i) => (
              <div
                key={step.num}
                className={`lp-process__step ${procInView ? "in-view" : ""}`}
                style={{ "--delay": `${0.15 + i * 0.12}s` }}
                id={`process-step-${i}`}
              >
                <div className="lp-process__step-num">{step.num}</div>
                <div className="lp-process__step-icon">
                  <step.icon size={24} />
                </div>
                <h3 className="lp-process__step-title">{step.title}</h3>
                <p className="lp-process__step-desc">{step.desc}</p>
                {i < processSteps.length - 1 && <div className="lp-process__connector" />}
              </div>
            ))}
          </div>
        </div>
      </section>  

      {/* ──────── FEATURE SLIDER ──────── */}
      <section className="lp-slider" ref={sliderRef}>
        <div className="lp-container">
          <div className={`lp-section-header ${sliderInView ? "in-view" : ""}`}>
            <span className="lp-eyebrow lp-fade-up" style={{ "--delay": "0s" }}>PLATFORM FEATURES</span>
            <h2 className="lp-heading lp-fade-up" style={{ "--delay": "0.1s" }}>
              Everything You Need to <span className="lp-heading-accent">Ship</span>
            </h2>
          </div>

          <div className="slider-stage">
            {slides.map((slide, i) => {
              const raw = ((i - slideIndex) % FEATURE_SLIDE_COUNT + FEATURE_SLIDE_COUNT) % FEATURE_SLIDE_COUNT;
              const offset = raw > FEATURE_SLIDE_COUNT / 2 ? raw - FEATURE_SLIDE_COUNT : raw;
              let cls = "slide-card";
              if (offset === 0) cls += " slide-card--active";
              else if (offset === -1) cls += " slide-card--prev";
              else if (offset === 1) cls += " slide-card--next";
              else cls += " slide-card--hidden";
              return (
                <div
                  key={i}
                  className={cls}
                  onClick={() => goToSlide(i)}
                  onMouseEnter={() => { if (offset !== 0) setTimeout(() => goToSlide(i), 300); }}
                  role="button"
                  tabIndex={offset === 0 ? 0 : -1}
                  aria-label={`Go to slide ${i + 1}: ${slide.title}`}
                >
                  <div className="slide-card-bg" style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/img/${slide.img})` }} />
                  <div className="slide-card-overlay" />
                  <div className="slide-card-body">
                    <span className="slide-card-count">{slide.num} / {FEATURE_SLIDE_COUNT}</span>
                    <div className="slide-card-icon"><slide.icon size={32} /></div>
                    <h3 className="slide-card-title">{slide.title}</h3>
                    <p className="slide-card-desc">{slide.desc}</p>
                  </div>
                  <div className="lp-features__card-body">
                    <h3 className="lp-features__title">{f.title}</h3>
                    <span className="lp-features__subtitle">{f.subtitle}</span>
                    <p className="lp-features__desc">{f.desc}</p>
                  </div>
                  <div className="lp-features__accent-line" />
                </div>
              );
            })}
          </div>

          <div className="slider-controls">
            <button type="button" onClick={prevSlide} className="ctrl-btn" aria-label="Previous slide" id="slider-prev">
              <ChevronLeft size={20} />
            </button>
            <div className="ctrl-dots">
              {Array.from({ length: FEATURE_SLIDE_COUNT }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  className={`ctrl-dot${slideIndex === i ? " ctrl-dot--active" : ""}`}
                  aria-label={`Go to slide ${i + 1}`}
                  onClick={() => goToSlide(i)}
                />
              ))}
            </div>
            <button type="button" onClick={nextSlide} className="ctrl-btn" aria-label="Next slide" id="slider-next">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* ──────── TRUST BADGES ──────── */}
      <section className="lp-trust" ref={trustRef}>
        <div className="lp-container">
          <div className="lp-trust__grid">
            {trustBadges.map((badge, i) => (
              <div
                key={badge.label}
                className={`lp-trust__badge ${trustInView ? "in-view" : ""}`}
                style={{ "--delay": `${i * 0.1}s` }}
                id={`trust-badge-${i}`}
              >
                <badge.icon size={20} />
                {badge.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────── STATS ──────── */}
      <section className="lp-stats" ref={statRef}>
        <div className="lp-container">
          <div className="lp-stats__grid">
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                className={`lp-stats__item ${statInView ? "in-view" : ""}`}
                style={{ "--delay": `${i * 0.12}s` }}
                id={`stat-${i}`}
              >
                <div className="lp-stats__number">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </div>
                <div className="lp-stats__label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────── FEATURES / WHY PACKORA — BENTO GRID ──────── */}
      <section className="lp-features" ref={featRef}>
        <div className="lp-container">
          <div className={`lp-section-header ${featInView ? "in-view" : ""}`}>
            <span className="lp-eyebrow lp-fade-up" style={{ "--delay": "0s" }}>WHY PACKORA</span>
            <h2 className="lp-heading lp-fade-up" style={{ "--delay": "0.1s" }}>
              Unbox Your <span className="lp-heading-accent">Potential</span>
            </h2>
            <div className="lp-heading-line lp-fade-up" style={{ "--delay": "0.25s" }} />
          </div>

          <div className="lp-features__grid">
            {features.map((f, i) => (
              <div
                key={f.title}
                className={`lp-features__card ${featInView ? "in-view" : ""}`}
                style={{ "--delay": `${0.15 + i * 0.1}s`, "--accent": f.accent }}
                id={`feature-card-${i}`}
              >
                <div className="lp-features__card-glow" />
                <div className="lp-features__card-inner">
                  <div className="lp-features__icon">
                    <f.icon size={22} />
                  </div>
                  <div className="lp-features__card-body">
                    <h3 className="lp-features__title">{f.title}</h3>
                    <span className="lp-features__subtitle">{f.subtitle}</span>
                    <p className="lp-features__desc">{f.desc}</p>
                  </div>
                  <div className="lp-features__accent-line" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      

      {/* ──────── TESTIMONIALS ──────── */}
      <section className="lp-testimonials" ref={testRef}>
        <div className="lp-container">
          <div className={`lp-section-header ${testInView ? "in-view" : ""}`}>
            <span className="lp-eyebrow lp-fade-up" style={{ "--delay": "0s" }}>REAL STORIES FROM REAL BRANDS</span>
            <h2 className="lp-heading lp-fade-up" style={{ "--delay": "0.1s" }}>
              "The 3D Preview Made It <span className="lp-heading-accent">Effortless</span>"
            </h2>
          </div>

          <div className="lp-testimonials__grid">
            {testimonials.map((t, i) => (
              <div
                key={t.author}
                className={`lp-testimonials__card ${testInView ? "in-view" : ""}`}
                style={{ "--delay": `${0.15 + i * 0.12}s` }}
                id={`testimonial-${i}`}
              >
                <div className="lp-testimonials__stars">
                  {Array.from({ length: 5 }, (_, k) => <Star key={k} size={18} fill="currentColor" />)}
                </div>
                <p className="lp-testimonials__text">"{t.text}"</p>
                <div className="lp-testimonials__author">
                  <div className="lp-testimonials__avatar" style={{ background: t.color }}>{t.initial}</div>
                  <div>
                    <strong>{t.author}</strong><br />
                    <span>{t.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────── FINAL CTA ──────── */}
      <section className="lp-cta" ref={ctaRef}>
        <div className="lp-cta__shine" />
        <div className="lp-cta__noise" />
        <div className="lp-container lp-cta__inner">
          <div className={`lp-cta__content ${ctaInView ? "in-view" : ""}`}>
            <h2 className="lp-cta__title lp-fade-up" style={{ "--delay": "0s" }}>
              <span>READY TO SEE YOUR BOX</span>
              <span className="lp-cta__title-accent">COME TO LIFE?</span>
            </h2>
            <p className="lp-cta__desc lp-fade-up" style={{ "--delay": "0.15s" }}>
              The beautiful 3D preview you just saw is just the beginning. Customize colors, sizes, logos, and text in real time.
            </p>

            <div className="lp-cta__buttons lp-fade-up" style={{ "--delay": "0.3s" }}>
              <button
                type="button"
                onClick={() => requireLogin(() => navigate("/Design"))}
                className="lp-btn lp-btn--primary lp-btn--lg"
                id="cta-open-studio"
              >
                <span>OPEN THE STUDIO</span>
                <ArrowRight size={22} />
              </button>
            </div>

            <div className="lp-cta__features lp-fade-up" style={{ "--delay": "0.45s" }}>
              {["Instant 3D Rendering", "Unlimited Custom Faces", "Drag & Drop Your Logo"].map((f) => (
                <div key={f} className="lp-cta__feature">
                  <CheckCircle size={14} /> {f}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Giant watermark */}
        <div className="lp-cta__watermark">PACKORA</div>
      </section>

      
    </div>
  );
};

export default LandingPage;