import { motion } from 'framer-motion';
import { Calendar, Users, Shield, ArrowRight, Check, Star, ChevronDown } from 'lucide-react';
import './LandingPage.css';
import TextRotator from './TextRotator';

const LandingPage = () => {
  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.8 } }
  };

  const slideUp = {
    hidden: { y: 50, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  const scaleUp = {
    hidden: { scale: 0.95, opacity: 0 },
    visible: { scale: 1, opacity: 1 }
  };

  const rotatingPhrases = [
    'local services',
    'trusted professionals',
    'available providers',
    'verified businesses'
  ];

  const features = [
    { icon: <Check size={20} />, text: 'Real-time availability' },
    { icon: <Check size={20} />, text: 'Secure payments' },
    { icon: <Check size={20} />, text: 'Instant confirmations' },
    { icon: <Check size={20} />, text: '24/7 customer support' }
  ];

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-sections">
        <div className="hero-content">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="hero-text"
          >
            <motion.h1
              initial="hidden"
              animate="visible"
              variants={slideUp}
              transition={{ delay: 0.2 }}
            >
              <span className="gradient-text">BizzBooker</span><br />
              Connect with <TextRotator phrases={rotatingPhrases} /> instantly
            </motion.h1>
            <motion.p 
              className="subtitle"
              initial="hidden"
              animate="visible"
              variants={slideUp}
              transition={{ delay: 0.4 }}
            >
              The modern platform that connects customers with top-rated service providers.
            </motion.p>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={slideUp}
              transition={{ delay: 0.6 }}
              className="hero-cta"
            >
              <a href="/signup" className="cta-button primary">
                Get Started <ArrowRight size={18} />
              </a>
              <div className="hero-features">
                {features.map((feature, index) => (
                  <motion.div 
                    key={index}
                    className="feature-item"
                    initial="hidden"
                    animate="visible"
                    variants={scaleUp}
                    transition={{ delay: 0.7 + (index * 0.1) }}
                  >
                    <span className="feature-icon">{feature.icon}</span>
                    <span>{feature.text}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
          <motion.div 
            className="hero-image"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ delay: 0.8 }}
          >
            <div className="dashboard-preview">
              <div className="browser-mockup">
                <div className="browser-bar"></div>
                <div className="browser-content">
                    <div className="app-preview">
    <div className="app-header">
      <span className="app-title">BizzBooker</span>
      <div className="app-nav">
        <span className="active">Home</span>
        <span>Services</span>
        <span>Bookings</span>
      </div>
    </div>
    
    <div className="search-bar-preview">
      <div className="search-icon">🔍</div>
      <input type="text" placeholder="Find local services..." />
    </div>
    
    <div className="service-categories">
      <div className="category active">All</div>
      <div className="category">Beauty</div>
      <div className="category">Home</div>
      <div className="category">Health</div>
    </div>
    
    <div className="service-list">
      <div className="service-card">
        <div className="service-image" style={{ background: '#FFEEF2' }}></div>
        <div className="service-details">
          <h4>Hair Salon</h4>
          <div className="rating">
            ★★★★☆ <span>4.2 (24)</span>
          </div>
          <div className="price">From $35</div>
        </div>
      </div>
      
      <div className="service-card">
        <div className="service-image" style={{ background: '#EFF8FF' }}></div>
        <div className="service-details">
          <h4>Home Cleaning</h4>
          <div className="rating">
            ★★★★★ <span>4.8 (56)</span>
          </div>
          <div className="price">From $50</div>
        </div>
      </div>
    </div>
    
    <div className="booking-indicator">
      <div className="selected-service">
        <span>2 services selected</span>
      </div>
      <button className="book-button">Book Now</button>
    </div>
  </div>
                </div>
              </div>
              <div className="floating-card card-1">
                <Star size={16} fill="gold" />
                <span>4.9 Rating</span>
              </div>
              <div className="floating-card card-2">
                <Users size={16} />
                <span>500+ Providers</span>
              </div>
            </div>
          </motion.div>
        </div>
        <div className="scroll-indicator">
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <ChevronDown size={24} />
          </motion.div>
        </div>
      </section>

      {/* Customer & Business Entry Section */}
      <section className="entry-section">
        <div className="entry-container">
          <motion.div 
            className="entry-card customer"
            initial="hidden"
            whileInView="visible"
            variants={slideUp}
            transition={{ duration: 0.6 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <h3>For Customers</h3>
            <p>Find, book, and enjoy services from trusted local professionals in seconds.</p>
            <a href="/explore" className="cta-button primary">
              Explore Services <ArrowRight size={16} />
            </a>
          </motion.div>
          <motion.div 
            className="entry-card business"
            initial="hidden"
            whileInView="visible"
            variants={slideUp}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <h3>For Businesses</h3>
            <p>Grow your client base, manage bookings, and boost your reputation with ease.</p>
            <a href="/join" className="cta-button primary">
              Join as a Provider <ArrowRight size={16} />
            </a>
          </motion.div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="divider-wave">
        <svg viewBox="0 0 1440 100" preserveAspectRatio="none">
          <path fill="#f8faff" d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25"></path>
          <path fill="#f8faff" d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5"></path>
          <path fill="#f8faff" d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"></path>
        </svg>
      </div>

      {/* Value Proposition */}
      <section className="value-section">
        <motion.div 
          className="value-container"
          initial="hidden"
          whileInView="visible"
          variants={fadeIn}
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.h2
            variants={slideUp}
            transition={{ duration: 0.4 }}
          >
            Why Choose BizzBooker?
          </motion.h2>
          <motion.p 
            className="section-subtitle"
            variants={slideUp}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            We're revolutionizing the way services are booked and managed
          </motion.p>
          <div className="value-grid">
            <motion.div 
              className="value-card"
              variants={scaleUp}
              transition={{ duration: 0.5 }}
              whileHover={{ y: -10 }}
            >
              <div className="icon-container">
                <Calendar size={40} />
              </div>
              <h3>Effortless Booking</h3>
              <p>Customers book services in seconds with real-time availability.</p>
            </motion.div>

            <motion.div 
              className="value-card"
              variants={scaleUp}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ y: -10 }}
            >
              <div className="icon-container">
                <Users size={40} />
              </div>
              <h3>Business Growth</h3>
              <p>Service providers attract and retain more clients.</p>
            </motion.div>

            <motion.div 
              className="value-card"
              variants={scaleUp}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ y: -10 }}
            >
              <div className="icon-container">
                <Shield size={40} />
              </div>
              <h3>Trusted Platform</h3>
              <p>Verified businesses and secure payments.</p>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* How It Works */}
      <section className="steps-section">
        <div className="steps-container">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            variants={slideUp}
            viewport={{ once: true, margin: "-100px" }}
          >
            Simple For Everyone
          </motion.h2>
          <motion.p 
            className="section-subtitle"
            initial="hidden"
            whileInView="visible"
            variants={slideUp}
            transition={{ delay: 0.2 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            Get started in minutes with our intuitive process
          </motion.p>
          <div className="steps">
            <motion.div 
              className="step"
              initial="hidden"
              whileInView="visible"
              variants={slideUp}
              transition={{ duration: 0.5 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Discover</h3>
                <p>Find local services or list your business</p>
              </div>
            </motion.div>
            <motion.div 
              className="step"
              initial="hidden"
              whileInView="visible"
              variants={slideUp}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>Book</h3>
                <p>Instant appointments with confirmation</p>
              </div>
            </motion.div>
            <motion.div 
              className="step"
              initial="hidden"
              whileInView="visible"
              variants={slideUp}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Enjoy</h3>
                <p>Seamless service experience</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="final-cta">
        <div className="cta-container">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            variants={slideUp}
            viewport={{ once: true, margin: "-100px" }}
          >
            Ready to Experience Better Bookings?
          </motion.h2>
          <motion.p
            initial="hidden"
            whileInView="visible"
            variants={slideUp}
            transition={{ delay: 0.2 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            Join businesses and customers who trust BizzBooker
          </motion.p>
          <motion.div 
            className="cta-buttons"
            initial="hidden"
            whileInView="visible"
            variants={slideUp}
            transition={{ delay: 0.4 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <a href="/signup" className="cta-button primary">
              Sign Up Free <ArrowRight size={18} />
            </a>
            <a href="/demo" className="cta-button secondary">
              See How It Works
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;