package com.tahsin.backend.Controller;

import com.stripe.Stripe;
import com.stripe.model.PaymentIntent;
import com.stripe.model.checkout.Session;
import com.stripe.param.PaymentIntentCreateParams;
import com.stripe.param.checkout.SessionCreateParams;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import com.tahsin.backend.Model.Appointment;
import com.tahsin.backend.Model.Business;
import com.tahsin.backend.Model.Notification;
import com.tahsin.backend.Model.Payment;
import com.tahsin.backend.Model.PaymentStatus;
import com.tahsin.backend.Model.AppointmentStatus;
import com.tahsin.backend.Repository.BusinessRepository;
import com.tahsin.backend.Repository.NotificationRepository;
import com.tahsin.backend.Repository.PaymentRepository;

import jakarta.annotation.PostConstruct;
import jakarta.transaction.Transactional;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {
    @Autowired
    private com.tahsin.backend.Service.PaymentService paymentService;
    @Autowired
    private com.tahsin.backend.Repository.AppointmentRepository appointmentRepository;
    @Autowired
    private BusinessRepository businessRepository;
    @Autowired
    private PaymentRepository paymentRepository;
    @Autowired
    private NotificationRepository notificationRepository;

    @PostMapping
    public ResponseEntity<?> createPayment(@RequestBody com.tahsin.backend.dto.PaymentDto dto) {
        try {
            System.out.println("[PAYMENT] Creating payment: " + dto);

            Appointment appointment = appointmentRepository.findById(dto.appointmentId).orElse(null);
            if (appointment == null) {
                return ResponseEntity.status(404).body("Appointment not found for ID: " + dto.appointmentId);
            }

            Payment payment = new Payment();
            payment.setAppointment(appointment);
            payment.setAmount(dto.amount);
            payment.setAmountPaid(dto.amountPaid != null ? dto.amountPaid : dto.amount);
            payment.setPaymentMethod(dto.paymentMethod);
            payment.setTransactionId(dto.transactionId);
            payment.setStatus(dto.status != null ? com.tahsin.backend.Model.PaymentStatus.valueOf(dto.status)
                    : com.tahsin.backend.Model.PaymentStatus.PENDING);
            payment.setReceiptUrl(dto.receiptUrl);
            payment.setStripePaymentIntentId(dto.stripePaymentIntentId);
            List<Notification> notifs = notificationRepository.findByUser(appointment.getCustomer());
            for (Notification n : notifs) {
                if (n.getNotificationType().equals("Complete Payment")
                        && n.getRelatedEntityId().equals(appointment.getId())) {

                    n.setUser(appointment.getCustomer());
                    n.setMessage("Your Payment has been completed successfully");
                    n.setNotificationType("Appointment Booking");
                    n.setTitle("Notification");
                    notificationRepository.save(n);
                    break;

                }

            }

            // Use synchronized method to prevent duplicate payments
            Payment saved = paymentService.save(payment);
            System.out.println("[PAYMENT] Payment created/found: " + saved.getId());

            // Create simple response to avoid circular references
            Map<String, Object> response = new HashMap<>();
            response.put("id", saved.getId());
            response.put("appointmentId", saved.getAppointment().getId());
            response.put("amount", saved.getAmount());
            response.put("status", saved.getStatus().toString());
            response.put("transactionId", saved.getTransactionId());
            response.put("message", "Payment created successfully");

            return ResponseEntity.ok(response);
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            // Handle duplicate appointment_id constraint violation
            System.out.println("[PAYMENT] Duplicate payment detected for appointment " + dto.appointmentId
                    + ", fetching existing payment");
            try {
                Payment existingPayment = paymentService.getByAppointmentId(dto.appointmentId);
                if (existingPayment != null) {
                    System.out.println("[PAYMENT] Returning existing payment: " + existingPayment.getId());

                    // Create simple response to avoid circular references
                    Map<String, Object> response = new HashMap<>();
                    response.put("id", existingPayment.getId());
                    response.put("appointmentId", existingPayment.getAppointment().getId());
                    response.put("amount", existingPayment.getAmount());
                    response.put("status", existingPayment.getStatus().toString());
                    response.put("transactionId", existingPayment.getTransactionId());
                    response.put("message", "Payment already exists");

                    return ResponseEntity.ok(response);
                } else {
                    System.out.println("[PAYMENT] Could not find existing payment after constraint violation");
                    return ResponseEntity.status(500).body(
                            "Payment creation failed due to constraint violation but could not find existing payment");
                }
            } catch (Exception fetchException) {
                System.out.println("[PAYMENT] Error fetching existing payment: " + fetchException.getMessage());
                return ResponseEntity.status(500).body("Payment creation failed: " + e.getMessage());
            }
        } catch (Exception e) {
            System.out.println("[PAYMENT EXCEPTION] " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error creating payment: " + e.getMessage());
        }
    }

    @Value("${STRIPE_SECRET_KEY}")
    private String stripeSecretKey;

    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeSecretKey;
    }

    @PostMapping("/create-payment-intent")
    public Map<String, String> createPaymentIntent(@RequestBody Map<String, Object> data) {
        try {
            // Extract data from request body with proper type handling
            Object amountObj = data.get("amount");
            Object priceObj = data.get("price"); // Handle both 'amount' and 'price' fields

            // Get amount from either 'amount' or 'price' field
            Number amount;
            if (amountObj != null) {
                if (amountObj instanceof String) {
                    amount = Double.parseDouble((String) amountObj);
                } else if (amountObj instanceof Number) {
                    amount = (Number) amountObj;
                } else {
                    throw new IllegalArgumentException("Invalid amount type");
                }
            } else if (priceObj != null) {
                if (priceObj instanceof String) {
                    amount = Double.parseDouble((String) priceObj);
                } else if (priceObj instanceof Number) {
                    amount = (Number) priceObj;
                } else {
                    throw new IllegalArgumentException("Invalid price type");
                }
            } else {
                throw new IllegalArgumentException("Amount or price is required");
            }

            String currency = (String) data.getOrDefault("currency", "usd");
            Long appointmentId = null;

            // Handle appointmentId with proper type checking
            Object appointmentIdObj = data.get("appointmentId");
            if (appointmentIdObj != null) {
                if (appointmentIdObj instanceof String) {
                    appointmentId = Long.parseLong((String) appointmentIdObj);
                } else if (appointmentIdObj instanceof Number) {
                    appointmentId = ((Number) appointmentIdObj).longValue();
                }
            }

            PaymentIntentCreateParams.Builder builder = PaymentIntentCreateParams.builder()
                    .setAmount(amount.longValue() * 100) // Stripe expects amount in cents
                    .setCurrency(currency);

            // If appointmentId is provided, check if business has Stripe Connect account
            if (appointmentId != null) {
                Appointment appointment = appointmentRepository.findById(appointmentId).orElse(null);
                if (appointment != null && appointment.getBusiness() != null) {
                    String stripeAccountId = appointment.getBusiness().getStripeAccountId();
                    Boolean chargesEnabled = appointment.getBusiness().getStripeChargesEnabled();

                    // Only use destination charges if business has Stripe Connect properly set up
                    if (stripeAccountId != null && !stripeAccountId.isEmpty() &&
                            chargesEnabled != null && chargesEnabled) {
                        // Use destination charges to send money to business owner
                        // Take 10% platform fee (you can adjust this)
                        long platformFee = amount.longValue() * 10; // 10% in cents

                        builder.setTransferData(
                                PaymentIntentCreateParams.TransferData.builder()
                                        .setDestination(stripeAccountId)
                                        .build());
                        builder.setApplicationFeeAmount(platformFee);

                        System.out.println("[PAYMENT] Using destination charge to account: " + stripeAccountId +
                                " with platform fee: " + platformFee + " cents");
                    } else {
                        System.out.println(
                                "[PAYMENT] Business doesn't have Stripe Connect set up, using platform account for payment");
                    }
                } else {
                    System.out
                            .println("[PAYMENT] Appointment or business not found, using platform account for payment");
                }
            } else {
                System.out.println("[PAYMENT] No appointment ID provided, using platform account for payment");
            }

            PaymentIntent intent = PaymentIntent.create(builder.build());
            Map<String, String> response = new HashMap<>();
            response.put("clientSecret", intent.getClientSecret());
            return response;
        } catch (Exception e) {
            System.out.println("[PAYMENT ERROR] " + e.getMessage());
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return error;
        }
    }

    @PostMapping("/create-checkout-session")
    public Map<String, String> createCheckoutSession(@RequestBody Map<String, Object> data) {
        try {
            // Handle appointmentId first if provided
            Long appointmentId = null;
            Object appointmentIdObj = data.get("appointmentId");
            if (appointmentIdObj != null) {
                if (appointmentIdObj instanceof String) {
                    appointmentId = Long.parseLong((String) appointmentIdObj);
                } else if (appointmentIdObj instanceof Number) {
                    appointmentId = ((Number) appointmentIdObj).longValue();
                }
            }

            // If appointmentId is provided, check if it already has a payment
            if (appointmentId != null) {
                Optional<Payment> existingPayment = paymentRepository.findByAppointmentId(appointmentId);
                if (existingPayment.isPresent()) {
                    Payment payment = existingPayment.get();
                    System.out.println("[CHECKOUT] Payment already exists for appointment " + appointmentId +
                            ", status: " + payment.getStatus());

                    if ("COMPLETED".equals(payment.getStatus().toString())) {
                        // Payment already completed, just update appointment status to APPROVED
                        Appointment appointment = appointmentRepository.findById(appointmentId).orElse(null);
                        if (appointment != null) {
                            appointment.setStatus(AppointmentStatus.APPROVED);
                            List<Notification> notifs = notificationRepository.findByUser(appointment.getCustomer());
                            for (Notification n : notifs) {
                                if (n.getNotificationType().equals("Complete Payment")
                                        && n.getRelatedEntityId().equals(appointment.getId())) {

                                    n.setUser(appointment.getCustomer());
                                    n.setMessage("Your Payment has been completed successfully");
                                    n.setNotificationType("Appointment Booking");
                                    n.setTitle("Notification");
                                    notificationRepository.save(n);
                                    break;

                                }

                            }

                            appointmentRepository.save(appointment);
                            System.out
                                    .println("[CHECKOUT] Appointment " + appointmentId + " status updated to APPROVED");
                        }

                        Map<String, String> response = new HashMap<>();
                        response.put("alreadyPaid", "true");
                        response.put("message", "Payment already completed, appointment confirmed");
                        return response;
                    }
                }
            }

            // Handle price with proper type checking
            Object priceObj = data.get("price");
            Long price;
            if (priceObj instanceof String) {
                price = Long.parseLong((String) priceObj);
            } else if (priceObj instanceof Number) {
                price = ((Number) priceObj).longValue();
            } else {
                throw new IllegalArgumentException("Invalid price type");
            }

            // Handle quantity with proper type checking
            Object quantityObj = data.get("quantity");
            Long quantity;
            if (quantityObj instanceof String) {
                quantity = Long.parseLong((String) quantityObj);
            } else if (quantityObj instanceof Number) {
                quantity = ((Number) quantityObj).longValue();
            } else {
                quantity = 1L; // Default to 1 if not provided
            }

            // Handle businessId with proper type checking
            Long businessId = null;
            Object businessIdObj = data.get("businessId");
            if (businessIdObj != null) {
                if (businessIdObj instanceof String) {
                    businessId = Long.parseLong((String) businessIdObj);
                } else if (businessIdObj instanceof Number) {
                    businessId = ((Number) businessIdObj).longValue();
                }
            }

            // If appointmentId is provided, check if it already has a payment
            if (appointmentId != null) {
                Optional<Payment> existingPayment = paymentRepository.findByAppointmentId(appointmentId);
                if (existingPayment.isPresent()) {
                    Payment payment = existingPayment.get();
                    System.out.println("[CHECKOUT] Payment already exists for appointment " + appointmentId +
                            ", status: " + payment.getStatus());

                    if ("COMPLETED".equals(payment.getStatus().toString())) {
                        // Payment already completed, just update appointment status to APPROVED
                        Appointment appointment = appointmentRepository.findById(appointmentId).orElse(null);
                        if (appointment != null) {
                            appointment.setStatus(AppointmentStatus.APPROVED);
                            List<Notification> notifs = notificationRepository.findByUser(appointment.getCustomer());
                            for (Notification n : notifs) {
                                if (n.getNotificationType().equals("Complete Payment")
                                        && n.getRelatedEntityId() == appointment.getId()) {

                                    n.setUser(appointment.getCustomer());
                                    n.setMessage("Your Payment has been completed successfully");
                                    n.setNotificationType("Appointment Booking");
                                    n.setTitle("Notification");
                                    notificationRepository.save(n);
                                    break;

                                }

                            }

                            appointmentRepository.save(appointment);
                            System.out
                                    .println("[CHECKOUT] Appointment " + appointmentId + " status updated to APPROVED");
                        }

                        Map<String, String> response = new HashMap<>();
                        response.put("alreadyPaid", "true");
                        response.put("message", "Payment already completed, appointment confirmed");
                        return response;
                    } else {
                        // Payment exists but not completed - update it to completed and approve
                        // appointment
                        System.out.println(
                                "[CHECKOUT] Updating existing payment to COMPLETED for appointment " + appointmentId);
                        payment.setStatus(PaymentStatus.COMPLETED);
                        paymentRepository.save(payment);

                        // Update appointment status to APPROVED
                        Appointment appointment = appointmentRepository.findById(appointmentId).orElse(null);
                        if (appointment != null) {
                            appointment.setStatus(AppointmentStatus.APPROVED);
                            appointmentRepository.save(appointment);
                            List<Notification> notifs = notificationRepository.findByUser(appointment.getCustomer());
                            for (Notification n : notifs) {
                                if (n.getNotificationType().equals("Complete Payment")
                                        && n.getRelatedEntityId() == appointment.getId()) {

                                    n.setUser(appointment.getCustomer());
                                    n.setMessage("Your Payment has been completed successfully");
                                    n.setNotificationType("Appointment Booking");
                                    n.setTitle("Notification");
                                    notificationRepository.save(n);
                                    break;

                                }

                            }

                            System.out
                                    .println("[CHECKOUT] Appointment " + appointmentId + " status updated to APPROVED");
                        }

                        Map<String, String> response = new HashMap<>();
                        response.put("alreadyPaid", "true");
                        response.put("message", "Payment completed, appointment confirmed");
                        return response;
                    }
                }
            }

            // Handle custom success and cancel URLs
            String successUrl = (String) data.get("successUrl");
            String cancelUrl = (String) data.get("cancelUrl");

            // Default URLs if not provided
            if (successUrl == null || successUrl.isEmpty()) {
                successUrl = "http://57.158.25.224:3000/payment-success?session_id={CHECKOUT_SESSION_ID}";
            } else {
                // Add session_id parameter to custom success URL
                successUrl += (successUrl.contains("?") ? "&" : "?") + "session_id={CHECKOUT_SESSION_ID}";
            }

            if (cancelUrl == null || cancelUrl.isEmpty()) {
                cancelUrl = "http://57.158.25.224:3000/payment-cancel";
            }

            SessionCreateParams.Builder paramsBuilder = SessionCreateParams.builder()
                    .setMode(SessionCreateParams.Mode.PAYMENT)
                    .setSuccessUrl(successUrl)
                    .setCancelUrl(cancelUrl)
                    .addLineItem(
                            SessionCreateParams.LineItem.builder()
                                    .setQuantity(quantity)
                                    .setPriceData(
                                            SessionCreateParams.LineItem.PriceData.builder()
                                                    .setCurrency("usd")
                                                    .setUnitAmount(price * 100) // Stripe expects cents
                                                    .setProductData(
                                                            SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                                    .setName("Bizbooker Appointment")
                                                                    .build())
                                                    .build())
                                    .build());

            // Check if business has Stripe Connect account for destination charges
            if (businessId != null) {
                Business business = businessRepository.findById(businessId).orElse(null);
                if (business != null && business.getStripeAccountId() != null &&
                        !business.getStripeAccountId().isEmpty() &&
                        business.getStripeChargesEnabled() != null && business.getStripeChargesEnabled()) {

                    // Calculate platform fee (10% of total amount)
                    long totalAmount = price * quantity * 100; // Total in cents
                    long platformFee = totalAmount / 10; // 10% platform fee

                    // Add payment intent data for destination charges
                    paramsBuilder.setPaymentIntentData(
                            SessionCreateParams.PaymentIntentData.builder()
                                    .setTransferData(
                                            SessionCreateParams.PaymentIntentData.TransferData.builder()
                                                    .setDestination(business.getStripeAccountId())
                                                    .build())
                                    .setApplicationFeeAmount(platformFee)
                                    .build());

                    System.out.println(
                            "[CHECKOUT] Using destination charge to account: " + business.getStripeAccountId() +
                                    " with platform fee: " + platformFee + " cents");
                } else {
                    System.out.println(
                            "[CHECKOUT] Business doesn't have Stripe Connect set up, using platform account for payment");
                }
            } else {
                System.out.println("[CHECKOUT] No business ID provided, using platform account for payment");
            }

            Session session = Session.create(paramsBuilder.build());
            Map<String, String> response = new HashMap<>();
            response.put("url", session.getUrl());
            response.put("sessionId", session.getId());
            return response;
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return error;
        }
    }

    @GetMapping("/appointment/{appointmentId}")
    public ResponseEntity<?> getPaymentByAppointmentId(@PathVariable Long appointmentId) {
        try {
            System.out.println("[PAYMENT] Checking payment for appointment ID: " + appointmentId);
            Payment payment = paymentService.getByAppointmentId(appointmentId);
            if (payment != null) {
                System.out.println("[PAYMENT] Payment found: " + payment.getId() + " for appointment: "
                        + payment.getAppointment().getId());
                return ResponseEntity.ok(payment);
            } else {
                System.out.println("[PAYMENT] No payment found for appointment ID: " + appointmentId);
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            System.out.println("[PAYMENT EXCEPTION] " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error checking payment: " + e.getMessage());
        }
    }
}
