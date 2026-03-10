package com.asha.sync.model;

import jakarta.persistence.*;
import java.util.Map;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "health_records")

@Getter
@Setter
@NoArgsConstructor

public class HealthRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Enumerated(EnumType.STRING)
    private PatientType patientType;

    @Column(columnDefinition = "TEXT")
    private String rawText;

    private String language;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> structured;

    private String riskLevel;

    private Long createdAt;
}