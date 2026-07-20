package com.imatoilet.backend.exception;

public class DuplicateToiletException extends RuntimeException {
    private final Long existingToiletId;

    public DuplicateToiletException(Long existingToiletId) {
        super("50m以内に既存のトイレ（ID: " + existingToiletId + "）があります");
        this.existingToiletId = existingToiletId;
    }

    public Long getExistingToiletId() {
        return existingToiletId;
    }
}
