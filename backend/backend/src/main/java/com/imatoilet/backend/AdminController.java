package com.imatoilet.backend;

import com.imatoilet.backend.dto.ImportResultDto;
import com.imatoilet.backend.dto.ExternalImportRequestDto;
import com.imatoilet.backend.dto.ExternalImportResponseDto;
import com.imatoilet.backend.dto.ToiletImportRequestDto;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final ToiletService toiletService;
    private final ExternalToiletImportService externalToiletImportService;

    public AdminController(ToiletService toiletService,
                           ExternalToiletImportService externalToiletImportService) {
        this.toiletService = toiletService;
        this.externalToiletImportService = externalToiletImportService;
    }

    @PostMapping("/toilets/import")
    public ResponseEntity<ImportResultDto> importToilets(
            @RequestBody ToiletImportRequestDto request) {
        ImportResultDto result = toiletService.importToilets(request.getToilets());
        return ResponseEntity.ok(result);
    }

    @PostMapping("/toilets/import-external")
    public ResponseEntity<ExternalImportResponseDto> importExternalToilets(
            @RequestBody @Valid ExternalImportRequestDto request) {
        return ResponseEntity.ok(externalToiletImportService.importToilets(request));
    }
}
