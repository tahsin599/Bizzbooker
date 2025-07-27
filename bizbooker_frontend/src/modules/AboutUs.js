import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, Shield, Check, Star } from 'lucide-react';
import './AboutUs.css';

const AboutUs = () => {
  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const slideUp = {
    hidden: { y: 50, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="about-page">
      {/* Hero Section */}
      <motion.section 
        className="about-hero"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        transition={{ duration: 0.8 }}
      >
        <div className="hero-content">
          <motion.h1
            variants={slideUp}
            transition={{ delay: 0.2 }}
          >
            Welcome to <span className="gradient-text">BizzBooker</span>
          </motion.h1>
          <motion.p
            variants={slideUp}
            transition={{ delay: 0.4 }}
          >
            Empowering service seekers and providers with a seamless digital booking experience.
          </motion.p>
        </div>
      </motion.section>

      {/* Mission Section */}
      <motion.section 
        className="about-section"
        initial="hidden"
        whileInView="visible"
        variants={slideUp}
        viewport={{ once: true, margin: "-100px" }}
      >
        <h2>Our Mission</h2>
        <p>
          To redefine how people discover, connect, and engage with service providers. We strive to offer an intuitive platform that boosts business visibility and ensures customer satisfaction through trust, efficiency, and innovation.
        </p>
      </motion.section>

      {/* Vision Section */}
      <motion.section 
        className="about-section"
        initial="hidden"
        whileInView="visible"
        variants={slideUp}
        viewport={{ once: true, margin: "-100px" }}
      >
        <h2>Our Vision</h2>
        <p>
          To become the leading platform for service booking by fostering digital transformation, enhancing local economies, and delivering exceptional user experiences through advanced technology.
        </p>
      </motion.section>

      {/* Values Section */}
      <motion.section 
        className="about-section"
        initial="hidden"
        whileInView="visible"
        variants={fadeIn}
        viewport={{ once: true, margin: "-100px" }}
      >
        <h2>What We Stand For</h2>
        <div className="value-grid">
          <motion.div 
            className="value-card"
            whileHover={{ y: -5 }}
            variants={slideUp}
            transition={{ delay: 0.1 }}
          >
            <div className="value-icon">
              <Shield size={32} />
            </div>
            <h3>Integrity</h3>
            <p>Transparency, honesty, and reliability in every interaction.</p>
          </motion.div>
          
          <motion.div 
            className="value-card"
            whileHover={{ y: -5 }}
            variants={slideUp}
            transition={{ delay: 0.2 }}
          >
            <div className="value-icon">
              <Star size={32} />
            </div>
            <h3>Innovation</h3>
            <p>Continually improving and embracing technology to meet user needs.</p>
          </motion.div>
          
          <motion.div 
            className="value-card"
            whileHover={{ y: -5 }}
            variants={slideUp}
            transition={{ delay: 0.3 }}
          >
            <div className="value-icon">
              <Users size={32} />
            </div>
            <h3>Customer Focus</h3>
            <p>Placing our users at the heart of every decision.</p>
          </motion.div>
          
          <motion.div 
            className="value-card"
            whileHover={{ y: -5 }}
            variants={slideUp}
            transition={{ delay: 0.4 }}
          >
            <div className="value-icon">
              <Check size={32} />
            </div>
            <h3>Accessibility</h3>
            <p>Creating a platform that is inclusive, easy to use, and available to all.</p>
          </motion.div>
        </div>
      </motion.section>

      {/* Team Section */}
      <motion.section 
        className="about-section"
        initial="hidden"
        whileInView="visible"
        variants={slideUp}
        viewport={{ once: true, margin: "-100px" }}
      >
        <h2>Meet the Team</h2>
        <p>
          A passionate group of developers, designers, strategists, and visionaries committed to building a smarter and more connected service booking experience.
        </p>
        <div className="team-grid">
          <div className="team-member">
            <h3>Sarah Thompson</h3>
            <p>CEO</p>
          </div>
          <div className="team-member">
            <h3>Michael Lee</h3>
            <p>CTO</p>
          </div>
          <div className="team-member">
            <h3>Amara Patel</h3>
            <p>Lead Designer</p>
          </div>
          <div className="team-member">
            <h3>Diego Fernandez</h3>
            <p>Product Manager</p>
          </div>
        </div>
      </motion.section>

      {/* Stats Section */}
      <motion.section 
        className="about-stats"
        initial="hidden"
        whileInView="visible"
        variants={fadeIn}
        viewport={{ once: true, margin: "-100px" }}
      >
        <h2>Our Impact</h2>
        <div className="stats-grid">
          <motion.div 
            className="stat-card"
            variants={slideUp}
            transition={{ delay: 0.1 }}
          >
            <h3>50,000+</h3>
            <p>Bookings Completed</p>
          </motion.div>
          <motion.div 
            className="stat-card"
            variants={slideUp}
            transition={{ delay: 0.2 }}
          >
            <h3>20,000+</h3>
            <p>Registered Businesses</p>
          </motion.div>
          <motion.div 
            className="stat-card"
            variants={slideUp}
            transition={{ delay: 0.3 }}
          >
            <h3>98%</h3>
            <p>Customer Satisfaction</p>
          </motion.div>
          <motion.div 
            className="stat-card"
            variants={slideUp}
            transition={{ delay: 0.4 }}
          >
            <h3>120+</h3>
            <p>Service Categories</p>
          </motion.div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section 
        className="about-cta"
        initial="hidden"
        whileInView="visible"
        variants={slideUp}
        viewport={{ once: true, margin: "-100px" }}
      >
        <h2>Join BizzBooker Today</h2>
        <p>
          Whether you're a service provider looking to grow or a customer seeking convenience, BizzBooker is your trusted partner.
        </p>
        <motion.a 
          href="/signup" 
          className="cta-button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Get Started
        </motion.a>
      </motion.section>
    </div>
  );
};

export default AboutUs;