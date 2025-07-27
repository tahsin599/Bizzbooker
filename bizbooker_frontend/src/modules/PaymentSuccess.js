import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { API_BASE_URL } from '../config/api';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [postError, setPostError] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [missingData, setMissingData] = React.useState(false);
  
  // Check multiple sources for appointment and payment data
  const urlParams = new URLSearchParams(location.search);
  const urlPaymentIntentId = urlParams.get('payment_intent') || 
                            urlParams.get('payment_intent_id') ||
                            urlParams.get('paymentIntentId');
  const urlAppointmentId = urlParams.get('appointment_id') || 
                          urlParams.get('appointmentId');
  
  // Check for Stripe checkout session success
  const urlSessionId = urlParams.get('session_id');
  const stripeSessionId = localStorage.getItem('stripeSessionId') || 
                         sessionStorage.getItem('stripeSessionId');
  
  const appointmentId = localStorage.getItem("pendingAppointmentId") || 
                       sessionStorage.getItem("pendingAppointmentId") || 
                       urlAppointmentId;
                       
  const paymentIntentId = localStorage.getItem("paymentIntentId") || 
                         sessionStorage.getItem("paymentIntentId") || 
                         urlPaymentIntentId ||
                         urlSessionId ||  // Use session ID as payment reference
                         stripeSessionId; // Fallback to stored session ID
                         
  const postedFlag = sessionStorage.getItem("appointmentApproved");

  // Log for debugging
  React.useEffect(() => {
    console.log('PaymentSuccess component loaded');
    console.log('appointmentId from localStorage:', localStorage.getItem("pendingAppointmentId"));
    console.log('appointmentId from sessionStorage:', sessionStorage.getItem("pendingAppointmentId"));
    console.log('appointmentId from URL:', urlAppointmentId);
    console.log('final appointmentId:', appointmentId);
    console.log('paymentIntentId from localStorage:', localStorage.getItem("paymentIntentId"));
    console.log('paymentIntentId from sessionStorage:', sessionStorage.getItem("paymentIntentId"));
    console.log('paymentIntentId from URL:', urlPaymentIntentId);
    console.log('sessionId from URL:', urlSessionId);
    console.log('stripeSessionId from storage:', stripeSessionId);
    console.log('final paymentIntentId:', paymentIntentId);
    console.log('postedFlag:', postedFlag);
    console.log('current URL:', location.pathname + location.search);
    
    // Additional debugging for localStorage contents
    console.log('All localStorage keys:', Object.keys(localStorage));
    console.log('All sessionStorage keys:', Object.keys(sessionStorage));
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      console.log(`localStorage[${key}]:`, localStorage.getItem(key));
    }
  }, []);

  const updateAppointmentAndCreatePayment = async () => {
    console.log('Starting updateAppointmentAndCreatePayment...');
    console.log('Current appointmentId:', appointmentId);
    console.log('Current paymentIntentId:', paymentIntentId);
    
    // Try to get the most reliable data source
    let finalAppointmentId = appointmentId || localStorage.getItem("pendingAppointmentId") || 
                            sessionStorage.getItem("pendingAppointmentId") || urlAppointmentId;
    let finalPaymentIntentId = paymentIntentId || localStorage.getItem("paymentIntentId") || 
                              sessionStorage.getItem("paymentIntentId") || urlPaymentIntentId;
    
    console.log('Final IDs determined:', { finalAppointmentId, finalPaymentIntentId });
    console.log('finalAppointmentId type:', typeof finalAppointmentId);
    console.log('finalPaymentIntentId type:', typeof finalPaymentIntentId);
    
    // Check if appointmentId is literally "undefined" string
    if (finalAppointmentId === "undefined" || finalAppointmentId === "null") {
      console.error('AppointmentId is literal string "undefined" or "null"');
      
      // Try to extract from stored appointment data as fallback
      const storedAppointment = localStorage.getItem('pendingAppointment');
      if (storedAppointment) {
        try {
          const appointmentData = JSON.parse(storedAppointment);
          console.log('Attempting to recover appointmentId from stored appointment:', appointmentData);
          finalAppointmentId = appointmentData.appointmentId || appointmentData.id;
          console.log('Recovered appointmentId:', finalAppointmentId);
        } catch (e) {
          console.error('Failed to parse stored appointment data:', e);
        }
      }
      
      // If still no appointment ID, try to get from stored appointment creation response
      const storedAppointmentData = localStorage.getItem('pendingAppointmentData');
      if (!finalAppointmentId && storedAppointmentData) {
        try {
          const appointmentData = JSON.parse(storedAppointmentData);
          console.log('Checking stored appointment data for creation details:', appointmentData);
          
          // This contains the data sent to create the appointment, not the response
          // So we can't get the ID from here, but we can try to recreate/find the appointment
          console.log('Cannot extract appointmentId from appointment creation data');
        } catch (e) {
          console.error('Failed to parse stored appointment creation data:', e);
        }
      }
      
      // Final check - set to null if still "undefined" string
      if (finalAppointmentId === "undefined" || finalAppointmentId === "null") {
        finalAppointmentId = null;
      }
    }
    
    if (!finalAppointmentId || finalAppointmentId === "undefined" || !finalPaymentIntentId) {
      console.log('Missing data - appointmentId:', finalAppointmentId, 'paymentIntentId:', finalPaymentIntentId);
      console.log('Data recovery failed. Available data:', {
        appointmentId: finalAppointmentId,
        paymentIntentId: finalPaymentIntentId,
        urlPaymentIntentId,
        urlAppointmentId,
        localStorageKeys: Object.keys(localStorage),
        sessionStorageKeys: Object.keys(sessionStorage)
      });
      
      // Try to extract from URL as last resort
      if (urlAppointmentId && urlAppointmentId !== "undefined") {
        finalAppointmentId = urlAppointmentId;
        console.log('Using URL appointmentId as fallback:', finalAppointmentId);
      } else {
        setMissingData(true);
        setLoading(false);
        return;
      }
    }

    try {
      const token = localStorage.getItem('token');
      
      console.log('Proceeding with:', { finalAppointmentId, finalPaymentIntentId });
      
      // Validate that we have a valid appointment ID before proceeding
      if (!finalAppointmentId || finalAppointmentId === 'undefined' || finalAppointmentId === 'null') {
        throw new Error(`Invalid appointment ID: ${finalAppointmentId}. Cannot update status.`);
      }
      
      // Step 1: Update appointment status to APPROVED
      console.log('Updating appointment status to APPROVED for ID:', finalAppointmentId);
      const statusResponse = await fetch(`${API_BASE_URL}/api/appointments/${finalAppointmentId}/status?status=APPROVED`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      console.log('Status update response status:', statusResponse.status);
      console.log('Status update response ok:', statusResponse.ok);

      if (!statusResponse.ok) {
        const errorText = await statusResponse.text();
        console.error('Status update failed. Response:', errorText);
        throw new Error(`Failed to update appointment status: ${errorText}`);
      }

      const updatedAppointment = await statusResponse.json();
      console.log("Appointment status updated successfully:", updatedAppointment);
      console.log("New appointment status:", updatedAppointment.status);

      // Step 2: Create payment record (only if not free booking)
      if (finalPaymentIntentId !== 'free-booking') {
        // First check if payment already exists for this appointment
        console.log('Checking if payment already exists for appointment:', finalAppointmentId);
        const checkPaymentResponse = await fetch(`${API_BASE_URL}/api/payments/appointment/${finalAppointmentId}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        let paymentAlreadyExists = false;
        if (checkPaymentResponse.ok) {
          const existingPayment = await checkPaymentResponse.json();
          console.log('Payment already exists:', existingPayment);
          paymentAlreadyExists = true;
        } else if (checkPaymentResponse.status !== 404) {
          // If it's not a 404 (not found), there might be an error
          console.warn('Error checking existing payment:', await checkPaymentResponse.text());
        }

        if (!paymentAlreadyExists) {
          const appointmentData = JSON.parse(localStorage.getItem("pendingAppointmentData") || '{}');
          const paymentData = {
            appointmentId: finalAppointmentId,
            amount: appointmentData?.slotPrice || 0,
            paymentMethod: "stripe",
            status: "COMPLETED",
            transactionId: finalPaymentIntentId,
            stripePaymentIntentId: finalPaymentIntentId
          };

          console.log('Creating payment record:', paymentData);        const paymentResponse = await fetch(`${API_BASE_URL}/api/payments`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(paymentData)
        });

        if (!paymentResponse.ok) {
          const errorText = await paymentResponse.text();
          
          // Check if it's a duplicate entry error or conflict
          if (errorText.includes("Duplicate entry") || 
              errorText.includes("UK2kxb37oip0md9ggekjbjmana4") || 
              paymentResponse.status === 409) {
            console.log("Payment record already exists - this is fine, continuing...");
            // Payment already exists, that's OK - the appointment status was already updated
          } else {
            console.warn("Payment creation failed but continuing:", errorText);
            // Don't throw error here - the appointment status was already updated successfully
          }
        } else {
          const createdPayment = await paymentResponse.json();
          console.log("Payment record created/updated successfully:", createdPayment);
        }
        } else {
          console.log("Payment record already exists, skipping creation");
        }
      } else {
        console.log("Free booking - skipping payment record creation");
      }

      // Clean up storage and mark as completed
      localStorage.removeItem("pendingAppointmentId");
      localStorage.removeItem("paymentIntentId");
      localStorage.removeItem("pendingAppointmentData");
      localStorage.removeItem("stripeSessionId"); // Clean up Stripe session ID
      sessionStorage.removeItem("pendingAppointmentId");
      sessionStorage.removeItem("paymentIntentId");
      sessionStorage.removeItem("stripeSessionId"); // Clean up Stripe session ID
      sessionStorage.setItem("appointmentApproved", "true");
      setPostError(false);
      setMissingData(false);
      setLoading(false);

    } catch (error) {
      setPostError(true);
      setLoading(false);
      console.error("Failed to complete booking:", error);
      alert("Failed to complete booking. Please contact support. Error: " + error.message);
    }
  };

  // Function to check appointment status
  const checkAppointmentStatus = async () => {
    if (!appointmentId) {
      console.log('No appointment ID available for status check');
      return null;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/appointments/${appointmentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const appointment = await response.json();
        console.log('Current appointment status:', appointment.status);
        return appointment.status;
      } else {
        console.error('Failed to fetch appointment status:', response.status);
      }
    } catch (error) {
      console.error('Error checking appointment status:', error);
    }
    return null;
  };

  React.useEffect(() => {
    const handlePaymentSuccess = async () => {
      // Clear the posted flag initially to ensure fresh processing
      if (paymentIntentId && appointmentId) {
        sessionStorage.removeItem('appointmentApproved');
        console.log('Cleared appointmentApproved flag for fresh processing');
      }
      
      // Always check the current appointment status first
      const currentStatus = await checkAppointmentStatus();
      console.log('Appointment current status:', currentStatus);
      
      if (currentStatus === 'APPROVED') {
        console.log('Appointment is already APPROVED, skipping update');
        setLoading(false);
        return;
      }
      
      if (currentStatus === 'PENDING') {
        console.log('Processing payment success - updating appointment status from PENDING to APPROVED');
        updateAppointmentAndCreatePayment();
      } else {
        console.log('Payment already processed or appointment status is unexpected:', currentStatus);
        setLoading(false);
      }
    };
    
    handlePaymentSuccess();
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: "80px", maxWidth: "600px", margin: "80px auto", padding: "20px" }}>
      {loading ? (
        <div>
          <h1 style={{ color: "#4BB543" }}>Processing your booking...</h1>
          <p>Please wait while we confirm your appointment.</p>
          <div style={{ margin: "20px 0" }}>
            <div style={{ 
              border: "4px solid #f3f3f3", 
              borderTop: "4px solid #4BB543", 
              borderRadius: "50%", 
              width: "40px", 
              height: "40px", 
              animation: "spin 2s linear infinite", 
              margin: "0 auto" 
            }}></div>
          </div>
        </div>
      ) : missingData ? (
        <div>
          <h1 style={{ color: "#ff6b6b" }}>Booking Information Missing</h1>
          <p>We couldn't find your appointment details. This might happen if:</p>
          <ul style={{ textAlign: "left", display: "inline-block" }}>
            <li>The page was refreshed or browser data was cleared</li>
            <li>You navigated here directly without completing a booking</li>
            <li>There was a technical issue during the payment process</li>
          </ul>
          <div style={{ marginTop: "30px" }}>
            <button
              style={{ 
                marginRight: "10px",
                padding: "10px 20px", 
                fontSize: "16px", 
                background: "#4BB543", 
                color: "white", 
                border: "none", 
                borderRadius: "5px", 
                cursor: "pointer" 
              }}
              onClick={() => navigate("/dashboard")}
            >
              Go to Dashboard
            </button>
            <button
              style={{ 
                padding: "10px 20px", 
                fontSize: "16px", 
                background: "#007bff", 
                color: "white", 
                border: "none", 
                borderRadius: "5px", 
                cursor: "pointer" 
              }}
              onClick={() => navigate("/businesses")}
            >
              Book Another Appointment
            </button>
          </div>
        </div>
      ) : (
        <>
          <h1 style={{ color: "#4BB543" }}>Payment Successful!</h1>
          <p>Your payment was processed successfully.</p>
          <p>Your appointment has been <b>confirmed</b> and approved!</p>
          <p>You will receive a confirmation email shortly.</p>
          {postError && (
            <div style={{ color: 'red', marginTop: '20px', padding: '15px', backgroundColor: '#ffe6e6', borderRadius: '5px' }}>
              <p><strong>Booking completion failed.</strong></p>
              <p>Your payment was successful, but there was an issue finalizing your appointment.</p>
              <button 
                onClick={updateAppointmentAndCreatePayment}
                style={{ 
                  padding: "8px 16px", 
                  fontSize: "14px", 
                  background: "#ff6b6b", 
                  color: "white", 
                  border: "none", 
                  borderRadius: "3px", 
                  cursor: "pointer",
                  marginTop: "10px"
                }}
              >
                Retry Booking Completion
              </button>
            </div>
          )}
          <button
            style={{ 
              marginTop: "30px", 
              padding: "10px 30px", 
              fontSize: "18px", 
              background: "#4BB543", 
              color: "white", 
              border: "none", 
              borderRadius: "5px", 
              cursor: "pointer" 
            }}
            onClick={() => navigate("/dashboard")}
          >
            Go to Dashboard
          </button>
        </>
      )}
    </div>
  );
};

export default PaymentSuccess;
