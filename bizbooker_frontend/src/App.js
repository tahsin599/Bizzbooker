import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './modules/Navbar';
import LandingPage from './modules/LandingPage';
import Footer from './modules/Footer';
import SignupForm from './modules/SignupForm'; // Make sure this file exists
import LoginForm from './modules/LoginForm'; // Make sure this file exists
import AboutUs from './modules/AboutUs';
import Dashboard from './modules/DashBoard';
import CreateBusiness from './modules/CreateBusiness';
import BusinessService from './modules/BusinessService';
import OAuthCallback from './modules/OauthCallBack';
import UserBusinesses from './modules/UserBusinesses';
import BusinessDetailPage from './modules/BusinessDetailPage';
import AddLocationPage from './modules/AddLocationPage'; // Import the AddLocationPage component
import LocationImagesPage from './modules/LocationImagesPage'; // Import the LocationImagesPage component
import BusinessListingPage from './modules/BusinessListingPage';
import BusinessHoursConfig from './modules/BusinessHoursConfig';
import ErrorBoundary from './modules/ErrorBoundary'; // Import the ErrorBoundary component
import CategoryBusinessListingPage from './modules/CategoryBusinessListingPage'; // Import the CategoryBusinessListingPage component
import NoBusinessesFound from './modules/NoBusinessesFound';
import BusinessConfig from './modules/BusinessConfig';
import BookingsPage from './modules/BookingsPage'; // Import the BookingsPage component
import Chatbot from './modules/Chatbot'; // Import the Chatbot component
import AppointmentList from './modules/AppointmentList';
import BusinessReviewsPage from './modules/BusinessReviewsPage'; // Import the BusinessReviewsPage component
import BusinessApprovalDashboard from './modules/PendingBusinesses';
import PendingBusinesses from './modules/PendingBusinesses';
import Map from './modules/Map'; // Import the Map component
import BusinessForm from './modules/BusinessForm'; // Import the BusinessForm component
import PaymentSuccess from './modules/PaymentSuccess';
import BookingPaymentSuccess from './modules/BookingPaymentSuccess';
import StripeConnectDashboard from './modules/StripeConnectDashboard';
import StripeOnboardingComplete from './modules/StripeOnboardingComplete';
import StripeOnboarding from './modules/StripeOnboarding';
import BusinessNotifications from './modules/BusinessNotifications';
import UserProfilePage from './modules/UserProfilePage';
import BusinessRecommendations from './modules/BusinessRecommendations';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        {/* <Navbar isAuthenticated={false} /> */}
        <Routes>
          <Route path="/" element={<><Navbar isAuthenticated={false} /><LandingPage /><Footer /></>} />
          <Route path="/signup" element={<><Navbar isAuthenticated={false} /><SignupForm /><Footer /></>} />
          <Route path="/login" element={<><Navbar isAuthenticated={false} /><LoginForm /><Footer /></>} />
          <Route path="/about" element={<><Navbar isAuthenticated={false} /><AboutUs /><Footer /></>} />
          <Route path="/dashboard" element={<><Navbar isAuthenticated={true} /><Dashboard /><Footer /></>} />
          <Route path="/create-business" element={<><Navbar isAuthenticated={true} /><CreateBusiness /><Footer /></>} />
          <Route path="/business-service" element={<><Navbar isAuthenticated={true} /><BusinessService /><Footer /></>} />
          <Route path="/oauth/callback" element={<OAuthCallback />} />
          <Route path="/userBusiness" element={<><Navbar isAuthenticated={true} /><UserBusinesses /><Footer /></>} />
          <Route path="/business" element={<><Navbar isAuthenticated={true} /><BusinessDetailPage /><Footer /></>} />
          <Route path="/business/:businessId/add-location" element={<><Navbar isAuthenticated={true}/><AddLocationPage /><Footer /></>} />
          <Route path="/locations/:locationId/images" element={<><Navbar isAuthenticated={true} /><LocationImagesPage /><Footer /></>} />
          <Route path="/business/customer" element={<><Navbar isAuthenticated={true}/><BusinessListingPage /><Footer/></>} />
          <Route path="/business/customer/:businessId" element={<><Navbar/><BusinessService /><Footer/></>} />
          <Route path="/business/category/:categoryId" element={<><Navbar /><CategoryBusinessListingPage /><Footer /></>} />
          <Route path="/explore" element={<><Navbar isAuthenticated={false} /><NoBusinessesFound /><Footer /></>} />
          <Route path="/business/config" element={<><Navbar isAuthenticated={true}/><BusinessConfig /><Footer/></>} /> 
          <Route path="/bookings" element={<><Navbar isAuthenticated={true}/><BookingsPage/><Footer/></>}/>
          <Route path="/chatbot" element={<><Navbar isAuthenticated={false} /><Chatbot /></>} />
          <Route path= "/show-appointments" element={<><Navbar isAuthenticated={true} /><AppointmentList /></>} />
          <Route path="/business/reviews" element={<><Navbar isAuthenticated={true} /><BusinessReviewsPage /></>} />
             <Route path="/approve" element={<><Navbar isAuthenticated={true} /><PendingBusinesses/></>} />
             <Route path="/map" element={<><Navbar isAuthenticated={true} /><BusinessForm /></>} />
           <Route path="/payment-success" element={<PaymentSuccess />} />

          <Route path="/booking-payment-success" element={<BookingPaymentSuccess />} />

          <Route path="/stripe-connect-dashboard/:businessId" element={<StripeConnectDashboard />} />

          <Route path="/stripe-onboarding/:businessId" element={<StripeOnboarding />} />

          <Route path="/stripe-onboarding-complete/:businessId" element={<StripeOnboardingComplete />} />
          <Route path="/notifications" element={<><Navbar isAuthenticated={true} /><BusinessNotifications /><Footer /></>}/>
          <Route path="/profile" element={<><Navbar isAuthenticated={true} /><UserProfilePage /><Footer /></>}/>
          <Route path="/book" element={<><Navbar isAuthenticated={true} /><BusinessRecommendations /><Footer /></>}/>

          {/* Add more routes as needed */}
        </Routes>
        
        {/* <Footer /> */}
      </div>
    </BrowserRouter>
  );
}

export default App;
