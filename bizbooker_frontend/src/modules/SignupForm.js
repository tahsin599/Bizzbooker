import { useForm } from "react-hook-form";
import { Calendar } from 'lucide-react';
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";
import { motion } from "framer-motion";
import { API_BASE_URL } from '../config/api';
import "./SignupForm.css";
import '../styles/variables.css'; // Import your CSS variables

const SignupForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm();

  const onSubmit = async (data) => {
    const formData = new FormData();

    const user = {
      role: data.role.toUpperCase(),
      name: data.fullname,
      email: data.email,
      password: data.password,
      bio: data.bio || "",
    };

    formData.append("user", new Blob([JSON.stringify(user)], { type: "application/json" }));

    if (data.profilepicture && data.profilepicture.length > 0) {
      formData.append("profilePicture", data.profilepicture[0]);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/register`, {
        method: "POST",
        body: formData
      });

      if (response.ok) {
        alert("Signup successful!");
      } else {
        const errText = await response.text();
        alert("Signup failed: " + errText);
      }
    } catch (error) {
      alert("Error occurred: " + error.message);
    }
  };

  const handleSocialLogin = (provider) => {
    // Redirect to your Spring Boot OAuth endpoint
    window.location.href = `${process.env.REACT_APP_API_URL}/oauth2/authorization/${provider}`;
  };

  return (
    <div className="signup-page">
      <motion.div
        className="signup-container"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="signup-header"
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
          <p className="subtitle">Create your account and start booking</p>
        </motion.div>

        <motion.div
          className="signup-form"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="form-group">
              <label>I am a</label>
              <select
                {...register("role", { required: true })}
                className="form-input"
              >
                <option value="">Select your role</option>
                <option value="customer">Customer</option>
                <option value="owner">Owner</option>
              </select>
              {errors.role && <span className="error-message">This field is required</span>}
            </div>

            <div className="form-group">
              <label>Full Name</label>
              <input
                {...register("fullname", { required: true })}
                className="form-input"
              />
              {errors.fullname && <span className="error-message">This field is required</span>}
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                {...register("email", { required: true })}
                className="form-input"
              />
              {errors.email && <span className="error-message">This field is required</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Password</label>
                <input
                  {...register("password", { required: true })}
                  type="password"
                  className="form-input"
                />
                {errors.password && <span className="error-message">This field is required</span>}
              </div>

              <div className="form-group">
                <label>Confirm Password</label>
                <input
                  {...register("confirmPassword", {
                    required: true,
                    validate: value => value === watch("password") || "Passwords do not match"
                  })}
                  type="password"
                  className="form-input"
                />
                {errors.confirmPassword && (
                  <span className="error-message">
                    {errors.confirmPassword.message || "This field is required"}
                  </span>
                )}
              </div>
            </div>

            <div className="form-group">
              <label>Bio (Optional)</label>
              <textarea
                {...register("bio")}
                rows={3}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Profile Picture</label>
              <div className="file-input-container">
                <input
                  {...register("profilepicture", { required: true })}
                  type="file"
                  accept="image/*"
                  id="profile-picture"
                />
                <label htmlFor="profile-picture" className="file-input-label">
                  Choose File
                </label>
              </div>
              {errors.profilepicture && <span className="error-message">This field is required</span>}
            </div>

            <motion.button
              type="submit"
              className="primary-button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Sign Up
            </motion.button>

            <div className="divider">
              <span>or continue with</span>
            </div>

            <div className="social-buttons">
              <motion.button
                type="button"
                className="social-button google"
                whileHover={{ y: -2 }}
                onClick={() => handleSocialLogin('google')}
              >
                <FcGoogle className="social-icon" />
                Google
              </motion.button>
              <motion.button
                type="button"
                className="social-button github"
                whileHover={{ y: -2 }}
                onClick={() => handleSocialLogin('github')}
              >
                <FaApple className="social-icon" />
                Apple
              </motion.button>
            </div>

            <div className="login-redirect">
              Already have an account? <a href="/login">Log in here</a>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SignupForm;