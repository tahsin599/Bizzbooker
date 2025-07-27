package com.tahsin.backend.dto;

public record DashboardStatsDto(
    int todayBookings,          // Today's appointments count
    int monthlyBookings,        // This month's appointments count  
    int totalBookings,          // Total appointments ever
    int pendingRequests         // Pending appointments count
) {}
