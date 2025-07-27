package com.tahsin.backend.dto;

import java.math.BigDecimal;

public class PaymentDto {
    public Long appointmentId;
    public BigDecimal amount;
    public BigDecimal amountPaid;
    public String paymentMethod;
    public String transactionId;
    public String status;
    public String receiptUrl;
    public String stripePaymentIntentId;
}
