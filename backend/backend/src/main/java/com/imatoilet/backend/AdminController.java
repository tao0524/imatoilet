package com.imatoilet.backend;

import com.imatoilet.backend.dto.ImportResultDto;
import com.imatoilet.backend.dto.ToiletImportRequestDto;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final ToiletService toiletService;

    public AdminController(ToiletService toiletService) {
        this.toiletService = toiletService;
    }

    @PostMapping("/toilets/import")
    public ResponseEntity<ImportResultDto> importToilets(
            @RequestBody ToiletImportRequestDto request) {
        ImportResultDto result = toiletService.importToilets(request.getToilets());
        return ResponseEntity.ok(result);
    }
}
