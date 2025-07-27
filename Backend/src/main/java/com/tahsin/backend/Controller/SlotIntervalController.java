package com.tahsin.backend.Controller;

import com.tahsin.backend.Model.*;
import com.tahsin.backend.dto.*;
import com.tahsin.backend.Service.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/api/slot-intervals")
public class SlotIntervalController {
    private final SlotIntervalService slotIntervalService;
    private final SlotConfigService slotConfigService;

    public SlotIntervalController(SlotIntervalService slotIntervalService,
                                SlotConfigService slotConfigService) {
        this.slotIntervalService = slotIntervalService;
        this.slotConfigService = slotConfigService;
    }

    @GetMapping("/config/{configId}/availability")
    public ResponseEntity<List<SlotInterval>> getAvailableSlots(
            @PathVariable Long configId) {
        return ResponseEntity.ok(slotIntervalService.getAvailableSlots(configId));
    }

    @PostMapping("/config/{configId}/book")
    public ResponseEntity<?> bookSlot(
            @PathVariable Long configId,
            @RequestParam LocalTime startTime) {
        boolean success = slotIntervalService.bookSlot(configId, startTime);
        return success ? ResponseEntity.ok().build() 
                     : ResponseEntity.badRequest().body("No available slots");
    }

    // @PostMapping("/config/{configId}/initialize")
    // public ResponseEntity<Void> initializeSlots(
    //         @PathVariable Long configId) {
    //     SlotConfiguration config = slotConfigService.getByLocationId(configId);
    //     slotIntervalService.initializeSlots(config);
    //     return ResponseEntity.ok().build();
    // }
}