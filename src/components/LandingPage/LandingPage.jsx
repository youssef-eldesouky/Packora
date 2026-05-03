import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import { useAuth } from "../../context/AuthContext";

const FEATURE_SLIDE_COUNT = 6;

const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [slideIndex, setSlideIndex] = useState(0);
  const scrollRef = useRef(null);

  const goToSlide = useCallback((index) => {
    setSlideIndex(((index % FEATURE_SLIDE_COUNT) + FEATURE_SLIDE_COUNT) % FEATURE_SLIDE_COUNT);
  }, []);

  const nextSlide = useCallback(() => {
    setSlideIndex((i) => (i + 1) % FEATURE_SLIDE_COUNT);
  }, []);

  const prevSlide = useCallback(() => {
    setSlideIndex((i) => (i - 1 + FEATURE_SLIDE_COUNT) % FEATURE_SLIDE_COUNT);
  }, []);

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const w = el.clientWidth;
    if (!w) return;
    el.scrollTo({ left: slideIndex * w, behavior: "smooth" });
  }, [slideIndex]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const w = el.clientWidth;
      if (!w) return;
      el.scrollTo({ left: slideIndex * w, behavior: "auto" });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [slideIndex]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setSlideIndex((i) => (i + 1) % FEATURE_SLIDE_COUNT);
    }, 6500);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let debounceId;
    const onScroll = () => {
      window.clearTimeout(debounceId);
      debounceId = window.setTimeout(() => {
        const w = el.clientWidth;
        if (!w) return;
        const idx = Math.round(el.scrollLeft / w);
        const clamped = Math.max(0, Math.min(FEATURE_SLIDE_COUNT - 1, idx));
        setSlideIndex((prev) => (clamped !== prev ? clamped : prev));
      }, 120);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.clearTimeout(debounceId);
    };
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
                Built live for you, Nermeen.
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

      <div className="main-content py-20">
        {/* Stats */}
        <section className="stats-section">
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
              <div className="trust-badge">🔒 Secure checkout</div>
              <div className="trust-badge">🚚 7-day delivery</div>
              <div className="trust-badge">🌱 100% recyclable</div>
              <div className="trust-badge">🛟 24/7 design support</div>
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

        {/* FEATURE SLIDER */}
        <section className="feature-slider">
          <div className="section-container">
            <div className="slider-frame">
              <div className="slider-wrapper" ref={scrollRef}>
                <div className="slide-container">
                {/* SLIDE 1 */}
                <div className="slide">
                  <div
                    className="slide-bg"
                    style={{
                      backgroundImage: `url(${process.env.PUBLIC_URL}/img/1.jpeg)`,
                    }}
                  />
                  <div className="image-overlay-text" />
                  <div className="slide-content">
                    <div className="slide-text-group">
                      <div className="slide-icon">📦</div>
                      <h2 className="slide-title heading-font">3D Box Customizer</h2>
                      <p className="slide-desc">
                        Design your perfect packaging with our interactive 3D customizer. Change colors, add logos, and see your design in real-time.
                      </p>
                    </div>
                  </div>
                  <div className="feature-tag">Feature <span className="font-mono">1</span> of 6</div>
                </div>

                {/* SLIDE 2 */}
                <div className="slide">
                  <div className="slide-bg" style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/img/2.jpeg)` }} />
                  <div className="image-overlay-text" />
                  <div className="slide-content">
                    <div className="slide-text-group">
                      <div className="slide-icon">🍃</div>
                      <h2 className="slide-title heading-font">Eco Mailer Boxes</h2>
                      <p className="slide-desc">
                        Sustainable kraft mailers with 100% recycled materials. Fast, secure, and planet-friendly.
                      </p>
                    </div>
                  </div>
                  <div className="feature-tag">Feature <span className="font-mono">2</span> of 6</div>
                </div>

                {/* SLIDE 3 */}
                <div className="slide">
                  <div className="slide-bg" style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/img/3.jpeg)` }} />
                  <div className="image-overlay-text" />
                  <div className="slide-content">
                    <div className="slide-text-group">
                      <div className="slide-icon">🎁</div>
                      <h2 className="slide-title heading-font">Premium Packaging</h2>
                      <p className="slide-desc">
                        High-quality boxes, mailers, and custom solutions designed to protect your products and elevate your brand.
                      </p>
                    </div>
                  </div>
                  <div className="feature-tag">Feature <span className="font-mono">3</span> of 6</div>
                </div>

                {/* SLIDE 4 */}
                <div className="slide">
                  <div className="slide-bg" style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/img/4.jpeg)` }} />
                  <div className="image-overlay-text" />
                  <div className="slide-content">
                    <div className="slide-text-group">
                      <div className="slide-icon">🚛</div>
                      <h2 className="slide-title heading-font">Fast Shipping</h2>
                      <p className="slide-desc">
                        Quick turnaround times with reliable shipping options. Track your orders every step of the way.
                      </p>
                    </div>
                  </div>
                  <div className="feature-tag">Feature <span className="font-mono">4</span> of 6</div>
                </div>

                {/* SLIDE 5 */}
                <div className="slide">
                  <div className="slide-bg" style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/img/5.jpeg)` }} />
                  <div className="image-overlay-text" />
                  <div className="slide-content">
                    <div className="slide-text-group">
                      <div className="slide-icon">⚡️</div>
                      <h2 className="slide-title heading-font">Easy Ordering</h2>
                      <p className="slide-desc">
                        Simple online ordering process with flexible quantities and competitive pricing for businesses of all sizes.
                      </p>
                    </div>
                  </div>
                  <div className="feature-tag">Feature <span className="font-mono">5</span> of 6</div>
                </div>

                {/* SLIDE 6 */}
                <div className="slide">
                  <div className="slide-bg" style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/img/6.jpeg)` }} />
                  <div className="image-overlay-text" />
                  <div className="slide-content">
                    <div className="slide-text-group">
                      <div className="slide-icon">🎨</div>
                      <h2 className="slide-title heading-font">Custom Branding</h2>
                      <p className="slide-desc">
                        Upload your logo, choose your colors, and create packaging that perfectly represents your brand.
                      </p>
                    </div>
                  </div>
                  <div className="feature-tag">Feature <span className="font-mono">6</span> of 6</div>
                </div>
                </div>
              </div>

              <button
                type="button"
                onClick={prevSlide}
                className="arrow-btn arrow-left"
                aria-label="Previous slide"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={nextSlide}
                className="arrow-btn arrow-right"
                aria-label="Next slide"
              >
                ›
              </button>

              <div className="dots" aria-label="Choose feature slide">
                {Array.from({ length: FEATURE_SLIDE_COUNT }, (_, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`dot${slideIndex === i ? " dot--active" : ""}`}
                    aria-label={`Go to slide ${i + 1}`}
                    onClick={() => goToSlide(i)}
                  />
                ))}
              </div>
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