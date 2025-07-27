package com.tahsin.backend.Controller;

import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.Account;
import com.stripe.model.AccountLink;
import com.stripe.model.LoginLink;
import com.stripe.param.AccountCreateParams;
import com.stripe.param.AccountLinkCreateParams;
import com.tahsin.backend.Model.Business;
import com.tahsin.backend.Repository.BusinessRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.annotation.PostConstruct;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/stripe-connect")
public class StripeConnectController {

    @Autowired
    private BusinessRepository businessRepository;


    @Value("${STRIPE_SECRET_KEY}")
    private String stripeSecretKey;

    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeSecretKey;
    }

    @PostMapping("/create-account/{businessId}")
    public ResponseEntity<?> createStripeAccount(@PathVariable Long businessId) {
        try {
            Business business = businessRepository.findById(businessId).orElse(null);
            if (business == null) {
                return ResponseEntity.status(404).body("Business not found");
            }

            // Check if already has Stripe account
            if (business.getStripeAccountId() != null) {
                return ResponseEntity.ok(Map.of(
                    "message", "Business already has Stripe account",
                    "accountId", business.getStripeAccountId()
                ));
            }

            // Create Stripe Express account
            AccountCreateParams params = AccountCreateParams.builder()
                .setType(AccountCreateParams.Type.EXPRESS)
                .setCountry("US") // You may want to make this configurable
                .setEmail(business.getOwner().getEmail())
                .setBusinessProfile(
                    AccountCreateParams.BusinessProfile.builder()
                        .setName(business.getBusinessName())
                        .build()
                )
                .build();

            Account account = Account.create(params);

            // Save account ID to business
            business.setStripeAccountId(account.getId());
            business.setStripeOnboardingCompleted(false);
            businessRepository.save(business);

            Map<String, String> response = new HashMap<>();
            response.put("accountId", account.getId());
            response.put("message", "Stripe account created successfully");
            
            return ResponseEntity.ok(response);

        } catch (StripeException e) {
            return ResponseEntity.status(500).body("Error creating Stripe account: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Unexpected error: " + e.getMessage());
        }
    }

    @PostMapping("/create-onboarding-link/{businessId}")
    public ResponseEntity<?> createOnboardingLink(@PathVariable Long businessId) {
        try {
            Business business = businessRepository.findById(businessId).orElse(null);
            if (business == null) {
                return ResponseEntity.status(404).body("Business not found");
            }

            if (business.getStripeAccountId() == null) {
                return ResponseEntity.status(400).body("Business must have Stripe account first");
            }

            // Create account link for onboarding
            AccountLinkCreateParams params = AccountLinkCreateParams.builder()
                .setAccount(business.getStripeAccountId())
                .setRefreshUrl("http://localhost:3000/business-dashboard") // Where to redirect if link expires
                .setReturnUrl("http://localhost:3000/stripe-onboarding-complete/" + businessId) // Where to redirect after completion
                .setType(AccountLinkCreateParams.Type.ACCOUNT_ONBOARDING)
                .build();

            AccountLink accountLink = AccountLink.create(params);

            Map<String, String> response = new HashMap<>();
            response.put("url", accountLink.getUrl());
            
            return ResponseEntity.ok(response);

        } catch (StripeException e) {
            return ResponseEntity.status(500).body("Error creating onboarding link: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Unexpected error: " + e.getMessage());
        }
    }

    @PostMapping("/complete-onboarding/{businessId}")
    public ResponseEntity<?> completeOnboarding(@PathVariable Long businessId) {
        try {
            Business business = businessRepository.findById(businessId).orElse(null);
            if (business == null) {
                return ResponseEntity.status(404).body("Business not found");
            }

            if (business.getStripeAccountId() == null) {
                return ResponseEntity.status(400).body("Business does not have Stripe account");
            }

            // Retrieve account to check status
            Account account = Account.retrieve(business.getStripeAccountId());
            
            // Update business with current capabilities
            business.setStripeOnboardingCompleted(account.getDetailsSubmitted());
            business.setStripeChargesEnabled(account.getChargesEnabled());
            business.setStripePayoutsEnabled(account.getPayoutsEnabled());
            businessRepository.save(business);

            Map<String, Object> response = new HashMap<>();
            response.put("onboardingCompleted", account.getDetailsSubmitted());
            response.put("chargesEnabled", account.getChargesEnabled());
            response.put("payoutsEnabled", account.getPayoutsEnabled());
            
            return ResponseEntity.ok(response);

        } catch (StripeException e) {
            return ResponseEntity.status(500).body("Error checking account status: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Unexpected error: " + e.getMessage());
        }
    }

    @GetMapping("/account-status/{businessId}")
    public ResponseEntity<?> getAccountStatus(@PathVariable Long businessId) {
        try {
            Business business = businessRepository.findById(businessId).orElse(null);
            if (business == null) {
                return ResponseEntity.status(404).body("Business not found");
            }

            Map<String, Object> response = new HashMap<>();
            
            if (business.getStripeAccountId() == null) {
                response.put("hasStripeAccount", false);
                response.put("onboardingCompleted", false);
                response.put("chargesEnabled", false);
                response.put("payoutsEnabled", false);
            } else {
                // Get fresh status from Stripe
                Account account = Account.retrieve(business.getStripeAccountId());
                
                // Update local database
                business.setStripeOnboardingCompleted(account.getDetailsSubmitted());
                business.setStripeChargesEnabled(account.getChargesEnabled());
                business.setStripePayoutsEnabled(account.getPayoutsEnabled());
                businessRepository.save(business);
                
                response.put("hasStripeAccount", true);
                response.put("accountId", business.getStripeAccountId());
                response.put("onboardingCompleted", account.getDetailsSubmitted());
                response.put("chargesEnabled", account.getChargesEnabled());
                response.put("payoutsEnabled", account.getPayoutsEnabled());
            }
            
            return ResponseEntity.ok(response);

        } catch (StripeException e) {
            return ResponseEntity.status(500).body("Error checking account status: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Unexpected error: " + e.getMessage());
        }
    }

    @PostMapping("/create-login-link/{businessId}")
    public ResponseEntity<?> createLoginLink(@PathVariable Long businessId) {
        try {
            Business business = businessRepository.findById(businessId).orElse(null);
            if (business == null) {
                return ResponseEntity.status(404).body("Business not found");
            }

            if (business.getStripeAccountId() == null) {
                return ResponseEntity.status(400).body("Business does not have Stripe account");
            }

            // Create a login link for the connected account
            Map<String, Object> params = new HashMap<>();
            LoginLink loginLink = LoginLink.createOnAccount(business.getStripeAccountId(), params, null);

            Map<String, String> response = new HashMap<>();
            response.put("url", loginLink.getUrl());
            
            return ResponseEntity.ok(response);

        } catch (StripeException e) {
            return ResponseEntity.status(500).body("Error creating login link: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Unexpected error: " + e.getMessage());
        }
    }

    @PostMapping("/dashboard-link/{businessId}")
    public ResponseEntity<?> createDashboardLink(@PathVariable Long businessId) {
        try {
            Business business = businessRepository.findById(businessId).orElse(null);
            if (business == null) {
                return ResponseEntity.status(404).body("Business not found");
            }

            if (business.getStripeAccountId() == null || !business.getStripeOnboardingCompleted()) {
                return ResponseEntity.status(400).body("Business must complete Stripe onboarding first");
            }

            // Create login link for Stripe Express dashboard
            Map<String, Object> params = new HashMap<>();
            LoginLink loginLink = LoginLink.createOnAccount(business.getStripeAccountId(), params, null);

            Map<String, String> response = new HashMap<>();
            response.put("url", loginLink.getUrl());
            
            return ResponseEntity.ok(response);

        } catch (StripeException e) {
            return ResponseEntity.status(500).body("Error creating dashboard link: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Unexpected error: " + e.getMessage());
        }
    }
}
