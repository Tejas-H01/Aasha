package com.asha.sync.repository;

import com.asha.sync.model.HealthRecord;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HealthRecordRepository extends JpaRepository<HealthRecord, String> {
}
