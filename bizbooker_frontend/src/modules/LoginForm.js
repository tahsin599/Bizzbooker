import { useForm } from "react-hook-form";
import { Calendar } from 'lucide-react';
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from '../config/api';
import "./LoginForm.css";

const LoginForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();
  const navigate = useNavigate(); // Assuming you have a navigate function from react-router-dom

  const onSubmit = async (data) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/loging`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password
        })
      });
      const responseData = await response.json();

      if (response.ok) {
        alert("Login successful!");
        console.log(responseData.token);
        console.log(responseData.userId);
        localStorage.setItem("token", responseData.token);
        localStorage.setItem("userId", responseData.userId);
        navigate("/dashboard"); // Assuming you have a navigate function to redirect
      } else {
        if (response.status === 403) {
        alert("Please provide valid credentials to login");
    }
    else{
        const errText = await response.text();
        alert("Login failed: " + errText);
    }
      }
    } catch (error) {
      alert("Error occurred: " + error.message);
    }
  };

  return (
    <div className="login-page">
      <motion.div
        className="login-container"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="login-header"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <motion.div
            className="logo-icon"
            whileHover={{ rotate: -10 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Calendar size={40} />
          </motion.div>
          <h1 className="logo-text">BizzBooker</h1>
          <p className="subtitle">Log into your account to continue booking</p>
        </motion.div>

        <motion.div
          className="login-form"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="form-group">
              <label>Email</label>
              <input 
                {...register("email", { required: true })} 
                className="form-input" 
                type="email"
              />
              {errors.email && <span className="error-message">This field is required</span>}
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                {...register("password", { required: true })}
                type="password"
                className="form-input"
              />
              {errors.password && <span className="error-message">This field is required</span>}
            </div>

            <div className="forgot-password">
              <a href="/forgot-password">Forgot password?</a>
            </div>

            <motion.button 
              type="submit" 
              className="primary-button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Log In
            </motion.button>

            <div className="divider">
              <span>or continue with</span>
            </div>

            <div className="social-buttons">
              <motion.button 
                type="button" 
                className="social-button google"
                whileHover={{ y: -2 }}
              >
                <FcGoogle className="social-icon" />
                Google
              </motion.button>
              <motion.button 
                type="button" 
                className="social-button apple"
                whileHover={{ y: -2 }}
              >
                <FaApple className="social-icon" />
                Apple
              </motion.button>
            </div>

            <div className="signup-redirect">
              Don't have an account? <a href="/signup">Sign up here</a>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoginForm;