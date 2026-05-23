import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import { useAuth } from "../../context/AuthContext";
import { Package , Leaf, Gift ,Truck ,Zap ,Palette ,Lock,LifeBuoy} from 'lucide-react';

const FEATURE_SLIDE_COUNT = 6;

const slides = [
  { num: 1, icon: <Package size={32} color="#fff" strokeWidth={3}  />, title: '3D Box Customizer', desc: 'Design your perfect packaging with our interactive 3D customizer. Change colors, add logos, and see your design in real-time.', img: '1.png' },
  { num: 2, icon: <Leaf size={32} color="#fff" strokeWidth={3}  />, title: 'Eco Mailer Boxes', desc: 'Sustainable kraft mailers with 100% recycled materials. Fast, secure, and planet-friendly.', img: '2.png' },
  { num: 3, icon: <Gift size={32} color="#fff" strokeWidth={3}  />, title: 'Premium Packaging', desc: 'High-quality boxes, mailers, and custom solutions designed to protect your products and elevate your brand.', img: '3.png' },
  { num: 4, icon: <Truck size={32} color="#fff" strokeWidth={3}  />, title: 'Fast Shipping', desc: 'Quick turnaround times with reliable shipping options. Track your orders every step of the way.', img: '4.png' },
  { num: 5, icon: <Zap size={32} color="#fff" strokeWidth={3}  />, title: 'Easy Ordering', desc: 'Simple online ordering process with flexible quantities and competitive pricing for all sizes.', img: '5.png' },
  { num: 6, icon: <Palette size={32} color="#fff" strokeWidth={3}  />, title: 'Custom Branding', desc: 'Upload your logo, choose your colors, and create packaging that perfectly represents your brand.', img: '6.png' },
];

const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [slideIndex, setSlideIndex] = useState(0);

  const goToSlide = useCallback((index) => {
    setSlideIndex(((index % FEATURE_SLIDE_COUNT) + FEATURE_SLIDE_COUNT) % FEATURE_SLIDE_COUNT);
  }, []);

  const nextSlide = useCallback(() => {
    setSlideIndex((i) => (i + 1) % FEATURE_SLIDE_COUNT);
  }, []);

  const prevSlide = useCallback(() => {
    setSlideIndex((i) => (i - 1 + FEATURE_SLIDE_COUNT) % FEATURE_SLIDE_COUNT);
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      setSlideIndex((i) => (i + 1) % FEATURE_SLIDE_COUNT);
    }, 5000);
    return () => window.clearInterval(id);
  }, []);

  const requireLogin = useCallback(
    (action) => {
      if (!user) {
        navigate("/login");
        return;
      }
      action();
    },
    [user, navigate]
  );

  return (
    <div className="landing-page">
      {/* NAVBAR */}
    <Navbar/>

      {/* HERO */}
      <div id="hero" className="hero-bg">
        <div className="hero-container">
          <div className="hero-grid">
            <div className="hero-left">
              <div className="hero-badge">
                REAL-TIME 3D • CUSTOM PACKAGING
              </div>
              <h1 className="hero-title heading-3d section-header">
                Packaging that<br />defines your brand.
              </h1>
              <p className="hero-description">
                Elegant 3D box preview. Infinite customization.<br />
                Built live for you.
              </p>

              <div className="hero-cta-group">
                <button
                  type="button"
                  onClick={() => requireLogin(() => navigate("/Design"))}
                  className="brand-button "
                >
                  Start Customizing
                  <span className="hero-cta-arrow">→</span>
                </button>
              </div>

              <div className="hero-features">
                <div>✓ Premium materials</div>
                <div>✓ Ships in 7 days</div>
                <div>✓ Real-time 3D preview</div>
                <div>✓ Drag &amp; drop ready</div>
              </div>
            </div>

            {/* 3D CUBE */}
            <div className="hero-right">
              <div className="cube-wrapper">
                <div className="cube-perspective">
                  <div className="cube">
                    <div className="face front" />
                    <div className="face back" />
                    <div className="face right" />
                    <div className="face left" />
                    <div className="face top" />
                    <div className="face bottom" />
                  </div>
                </div>
                <div className="live-preview-badge">
                  <div className="live-dot" />
                  LIVE 3D PREVIEW
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="main-content py-5">
        {/* Stats */}
        <section className="stats-section ">
          <div className="section-container">
            <div className="stats-grid">
              <div>
                <h2 className="stat-number">50K+</h2>
                <p className="stat-label">Happy brands</p>
              </div>
              <div>
                <h2 className="stat-number">120+</h2>
                <p className="stat-label">Countries shipped</p>
              </div>
              <div>
                <h2 className="stat-number">1M+</h2>
                <p className="stat-label">Custom boxes made</p>
              </div>
              <div>
                <h2 className="stat-number">99%</h2>
                <p className="stat-label">Satisfaction rate</p>
              </div>
            </div>
          </div>
        </section>

        {/* Trust badges */}
        <section className="trust-section">
          <div className="section-container">
            <div className="trust-grid">
              <div className="trust-badge"><Lock size={18} color="#5D536B" strokeWidth={3} /> Secure checkout</div>
              <div className="trust-badge"><Truck size={18} color="#5D536B" strokeWidth={3} /> 7-day delivery</div>
              <div className="trust-badge"><Leaf size={18} color="#5D536B" strokeWidth={3} /> 100% recyclable</div>
              <div className="trust-badge"><LifeBuoy size={18} color="#5D536B" strokeWidth={3} /> 24/7 design support</div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="testimonials-section">
          <div className="section-container">
            <div className="testimonials-header">
              <span className="story-badge">REAL STORIES FROM REAL BRANDS</span>
              <h2 className="testimonial-heading heading-font">
                “The 3D preview made it effortless”
              </h2>
            </div>

            <div className="testimonials-grid">
              <div className="testimonial-card">
                <div className="stars">★★★★★</div>
                <p className="testimonial-text">
                  "The floating 3D box in the hero instantly sold me. I customized my entire order in minutes. Perfect for my Giza-based startup!"
                </p>
                <div className="testimonial-author">
                  <div className="author-avatar a">A</div>
                  <div>
                    <strong>Ahmed El-Sayed</strong><br />
                    <span>Founder, Cairo Coffee Co.</span>
                  </div>
                </div>
              </div>

              <div className="testimonial-card">
                <div className="stars">★★★★★</div>
                <p className="testimonial-text">
                  "Nermeen here — I just love how the 3D cube rotates smoothly. The design experience feels premium before I even place the order."
                </p>
                <div className="testimonial-author">
                  <div className="author-avatar n">N</div>
                  <div>
                    <strong>Nermeen • Giza</strong><br />
                    <span>Product Designer</span>
                  </div>
                </div>
              </div>

              <div className="testimonial-card">
                <div className="stars">★★★★★</div>
                <p className="testimonial-text">
                  "The top-of-page 3D preview is addictive. I shared the link with my team and they all wanted one. Best packaging tool I’ve used."
                </p>
                <div className="testimonial-author">
                  <div className="author-avatar s">S</div>
                  <div>
                    <strong>Sara Mansour</strong><br />
                    <span>Brand Director, Alexandria</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURE SLIDER — card carousel */}
        <section className="feature-slider">
          <div className="section-container">
            <div className="slider-header">
              <span className="slider-eyebrow">PLATFORM FEATURES</span>
              <h2 className="slider-heading heading-font">Everything you need to ship.</h2>
            </div>

            <div className="slider-stage">
              {slides.map((slide, i) => {
                const raw = ((i - slideIndex) % FEATURE_SLIDE_COUNT + FEATURE_SLIDE_COUNT) % FEATURE_SLIDE_COUNT;
                const offset = raw > FEATURE_SLIDE_COUNT / 2 ? raw - FEATURE_SLIDE_COUNT : raw;
                let cls = 'slide-card';
                if (offset === 0) cls += ' slide-card--active';
                else if (offset === -1) cls += ' slide-card--prev';
                else if (offset === 1) cls += ' slide-card--next';
                else cls += ' slide-card--hidden';
                return (
                  <div
                    key={i}
                    className={cls}
                    onClick={() => goToSlide(i)}
                    onMouseEnter={() => {
                      if (offset !== 0) {
                        setTimeout(() => {
                          goToSlide(i);
                        }, 300); // ⏱ 300ms delay (change as you want)
                      }
                    }}
                    role="button"
                    tabIndex={offset === 0 ? 0 : -1}
                    aria-label={`Go to slide ${i + 1}: ${slide.title}`}
                  >
                    <div
                      className="slide-card-bg"
                      style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/img/${slide.img})` }}
                    />
                    <div className="slide-card-overlay" />
                    <div className="slide-card-body">
                      <span className="slide-card-count">{slide.num} / {FEATURE_SLIDE_COUNT}</span>
                      <div className="slide-card-icon">{slide.icon}</div>
                      <h3 className="slide-card-title heading-font">{slide.title}</h3>
                      <p className="slide-card-desc">{slide.desc}</p>
                    </div>
                  </div>
                );
              })}

            </div>

            <div className="slider-controls">
              <button type="button" onClick={prevSlide} className="ctrl-btn" aria-label="Previous slide">‹</button>
              <div className="ctrl-dots">
                {Array.from({ length: FEATURE_SLIDE_COUNT }, (_, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`ctrl-dot${slideIndex === i ? ' ctrl-dot--active' : ''}`}
                    aria-label={`Go to slide ${i + 1}`}
                    onClick={() => goToSlide(i)}
                  />
                ))}
              </div>
              <button type="button" onClick={nextSlide} className="ctrl-btn" aria-label="Next slide">›</button>
            </div>
          </div>
        </section>


        {/* FINAL CTA */}
        <section className="enhanced-cta">
          <div className="cta-container">
            <div className="cta-inner">
              <h2 className="cta-title heading-font">Ready to see your box come to life?</h2>
              <p className="cta-description">
                The beautiful 3D preview you just saw is just the beginning. Customize colors, sizes, logos, and text in real time.
              </p>

              <div className="cta-buttons">
                <button
                  type="button"
                  onClick={() => requireLogin(() => navigate("/Design"))}
                  className="brand-button cta-button"
                >
                  OPEN THE STUDIO
                  <span className="cta-arrow">→</span>
                </button>
              </div>

              <div className="cta-features">
                <div>✓ Instant 3D rendering</div>
                <div>✓ Unlimited custom faces</div>
                <div>✓ Drag &amp; drop your logo</div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* FOOTER */}
     <Footer/>
    </div>
  );
};

export default LandingPage;