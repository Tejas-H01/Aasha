package com.asha.sync.service;

import com.asha.sync.model.PatientType;
import org.springframework.stereotype.Service;
import java.util.Map;

@Service
public class RiskAssessmentService {

    public String calculateRisk(Map<String, Object> structured, PatientType patientType) {

        int feverDays = structured.get("feverDays") != null ? (int) structured.get("feverDays") : 0;

        boolean swelling = structured.get("swelling") != null && (boolean) structured.get("swelling");

        boolean highBP = structured.get("highBP") != null && (boolean) structured.get("highBP");

        boolean bleeding = structured.get("bleeding") != null && (boolean) structured.get("bleeding");

        boolean breathingIssue = structured.get("breathingIssue") != null && (boolean) structured.get("breathingIssue");


        switch (patientType) {

            case PREGNANT:
                if (bleeding) return "CRITICAL";
                if (highBP && swelling) return "HIGH";
                if (feverDays >= 4) return "MEDIUM";
                if (swelling) return "MEDIUM";
                return "LOW";

            case CHILD:
                if (breathingIssue) return "HIGH";
                if (feverDays >= 4) return "MEDIUM";
                return "LOW";

            case ADULT:
                if (breathingIssue) return "HIGH";
                if (feverDays >= 5) return "MEDIUM";
                return "LOW";

            case ELDER:
                if (breathingIssue) return "HIGH";
                if (feverDays >= 3) return "MEDIUM";
                return "LOW";

            default:
                return "LOW";
        }
    }
}