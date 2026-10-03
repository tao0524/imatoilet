package com.imatoilet.backend;

public class ExternalImportConflictException extends RuntimeException {
    public ExternalImportConflictException(String message, Throwable cause) {
        super(message, cause);
    }
}
