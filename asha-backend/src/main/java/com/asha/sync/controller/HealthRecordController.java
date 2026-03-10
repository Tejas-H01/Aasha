package com.asha.sync.controller;

import com.asha.sync.dto.HealthRecordResponse;
import com.asha.sync.model.HealthRecord;
import com.asha.sync.service.HealthRecordService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class HealthRecordController {

    private final HealthRecordService healthRecordService;

    public HealthRecordController(HealthRecordService healthRecordService) {
        this.healthRecordService = healthRecordService;
    }

    @PostMapping("/records")
    public HealthRecordResponse createRecord(@Valid @RequestBody HealthRecord record) {

        healthRecordService.save(record);

        return new HealthRecordResponse(
                record.getId(),
                "Record saved successfully"
        );
    }

    @GetMapping("/records")
    public List<HealthRecord> getRecords() {
        return healthRecordService.getAll();
    }
    @PostMapping("/sync")
    public Map<String, Object> syncRecords(@RequestBody List<HealthRecord> records) {

        int saved = 0;

        for (HealthRecord record : records) {
            healthRecordService.save(record);
            saved++;
        }

        return Map.of(
                "synced", saved,
                "message", "Records synced successfully"
        );
    }
}