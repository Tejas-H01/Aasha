package com.asha.sync.dto;

public class HealthRecordResponse {

    private final String id;
    private final String message;

    public HealthRecordResponse(String id, String message) {
        this.id = id;
        this.message = message;
    }

    public String getId() {
        return id;
    }

    public String getMessage() {
        return message;
    }
}