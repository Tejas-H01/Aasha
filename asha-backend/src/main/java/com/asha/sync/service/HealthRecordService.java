package com.asha.sync.service;

import com.asha.sync.model.HealthRecord;
import com.asha.sync.repository.HealthRecordRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class HealthRecordService {


    private final HealthRecordRepository healthRecordRepository;
    private final RiskAssessmentService riskAssessmentService;

    public HealthRecordService(
            HealthRecordRepository healthRecordRepository,
            RiskAssessmentService riskAssessmentService) {

        this.healthRecordRepository = healthRecordRepository;
        this.riskAssessmentService = riskAssessmentService;
    }

    public void save(HealthRecord record) {

        // Ensure timestamp exists
        if (record.getCreatedAt() == null) {
            record.setCreatedAt(System.currentTimeMillis());
        }

        // Calculate risk level using structured JSON + patient type
        String risk = riskAssessmentService.calculateRisk(
                record.getStructured(),
                record.getPatientType()
        );

        record.setRiskLevel(risk);

        healthRecordRepository.save(record);
    }

    public List<HealthRecord> getAll() {
        return healthRecordRepository.findAll();
    }

}
