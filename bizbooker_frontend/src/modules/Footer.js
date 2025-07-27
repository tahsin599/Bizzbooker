import React from 'react';
import './Footer.css';
import { motion } from 'framer-motion';
import { Facebook, Twitter, Instagram, Linkedin, Mail, ArrowRight } from 'lucide-react';

const Footer = () => {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Logo Column */}
        <motion.div 
          className="footer-column"
          initial="hidden"
          whileInView="visible"
          variants={fadeIn}
          transition={{ duration: 0.5 }}
          viewport={{ once: true, margin: "-50px" }}
        >
          <div className="footer-logo">
            <span className="gradient-text">BizzBooker</span>
          </div>
          <p className="footer-description">
            The modern platform connecting customers with top-rated service providers.
          </p>
          <div className="social-icons">
            <motion.a 
              href="https://facebook.com" 
              target="_blank" 
              rel="noopener noreferrer"
              whileHover={{ y: -3 }}
              aria-label="Facebook"
            >
              <Facebook size={20} />
            </motion.a>
            <motion.a 
              href="https://twitter.com" 
              target="_blank" 
              rel="noopener noreferrer"
              whileHover={{ y: -3 }}
              aria-label="Twitter"
            >
              <Twitter size={20} />
            </motion.a>
            <motion.a 
              href="https://linkedin.com" 
              target="_blank" 
              rel="noopener noreferrer"
              whileHover={{ y: -3 }}
              aria-label="LinkedIn"
            >
              <Linkedin size={20} />
            </motion.a>
            <motion.a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noopener noreferrer"
              whileHover={{ y: -3 }}
              aria-label="Instagram"
            >
              <Instagram size={20} />
            </motion.a>
          </div>
        </motion.div>

        {/* Quick Links Column */}
        <motion.div 
          className="footer-column"
          initial="hidden"
          whileInView="visible"
          variants={fadeIn}
          transition={{ duration: 0.5, delay: 0.1 }}
          viewport={{ once: true, margin: "-50px" }}
        >
          <h4>Quick Links</h4>
          <ul>
            <motion.li whileHover={{ x: 5 }}>
              <a href="/">Home</a>
            </motion.li>
            <motion.li whileHover={{ x: 5 }}>
              <a href="/services">Services</a>
            </motion.li>
            <motion.li whileHover={{ x: 5 }}>
              <a href="/providers">For Businesses</a>
            </motion.li>
            <motion.li whileHover={{ x: 5 }}>
              <a href="/contact">Contact</a>
            </motion.li>
          </ul>
        </motion.div>

        {/* Support Column */}
        <motion.div 
          className="footer-column"
          initial="hidden"
          whileInView="visible"
          variants={fadeIn}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true, margin: "-50px" }}
        >
          <h4>Support</h4>
          <ul>
            <motion.li whileHover={{ x: 5 }}>
              <a href="/help">Help Center</a>
            </motion.li>
            <motion.li whileHover={{ x: 5 }}>
              <a href="/terms">Terms of Service</a>
            </motion.li>
            <motion.li whileHover={{ x: 5 }}>
              <a href="/privacy">Privacy Policy</a>
            </motion.li>
            <motion.li whileHover={{ x: 5 }}>
              <a href="/faq">FAQs</a>
            </motion.li>
          </ul>
        </motion.div>

        {/* Newsletter Column */}
        <motion.div 
          className="footer-column"
          initial="hidden"
          whileInView="visible"
          variants={fadeIn}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true, margin: "-50px" }}
        >
          <h4>Stay Updated</h4>
          <p className="newsletter-text">
            Subscribe to our newsletter for the latest updates and offers.
          </p>
          <form className="newsletter-form">
            <div className="input-group">
              <Mail size={18} className="input-icon" />
              <input 
                type="email" 
                placeholder="Your email address" 
                required 
              />
            </div>
            <motion.button 
              type="submit"
              whileHover={{ x: 5 }}
            >
              Subscribe <ArrowRight size={16} />
            </motion.button>
          </form>
        </motion.div>
      </div>

      {/* Footer Bottom */}
      <motion.div 
        className="footer-bottom"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        viewport={{ once: true, margin: "-50px" }}
      >
        <div className="footer-bottom-content">
          <span>&copy; {new Date().getFullYear()} BizzBooker. All rights reserved.</span>
          <div className="legal-links">
            <a href="/terms">Terms</a>
            <a href="/privacy">Privacy</a>
            <a href="/cookies">Cookies</a>
          </div>
        </div>
      </motion.div>
    </footer>
  );
};

export default Footer;