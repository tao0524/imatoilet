package com.imatoilet.backend;

import com.imatoilet.backend.dto.ToiletUpdateDto;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/toilets")
public class ToiletApiController {

    private final ToiletService toiletService;

    public ToiletApiController(ToiletService toiletService) {
        this.toiletService = toiletService;
    }

    // ★修正: Bounding Box用の4つのパラメータを追加
    @GetMapping
    public ResponseEntity<Page<Toilet>> getToilets(
            @RequestParam(required = false) Double minLat,
            @RequestParam(required = false) Double maxLat,
            @RequestParam(required = false) Double minLng,
            @RequestParam(required = false) Double maxLng,
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lng,
            @RequestParam(required = false, defaultValue = "5.0") Double radius,
            @RequestParam(required = false) String facilityCategory,
            @RequestParam(required = false) Integer minCleanliness,
            @RequestParam(required = false, defaultValue = "") String keyword,
            @RequestParam(required = false) Boolean publicUse,
            @RequestParam(required = false) List<String> equipment,
            @PageableDefault(size = 50) Pageable pageable
    ) {
        Page<Toilet> results = toiletService.searchToilets(
                minLat, maxLat, minLng, maxLng, lat, lng, radius, 
                facilityCategory, minCleanliness, keyword, publicUse, equipment, pageable
        );
        return ResponseEntity.ok(results);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Toilet> getToiletById(@PathVariable Long id) {
        return ResponseEntity.ok(toiletService.getToilet(id));
    }

    @PostMapping
    public ResponseEntity<Toilet> createToilet(@RequestBody @Valid Toilet toilet) {
        Toilet saved = toiletService.createToilet(toilet);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Toilet> updateToilet(
            @PathVariable Long id, 
            @RequestBody @Valid ToiletUpdateDto dto) {
        
        Toilet toiletDetails = new Toilet();
        toiletDetails.setName(dto.getName());
        toiletDetails.setLat(dto.getLat());
        toiletDetails.setLng(dto.getLng());
        toiletDetails.setAddress(dto.getAddress());
        toiletDetails.setDescription(dto.getDescription());
        toiletDetails.setCleanliness(dto.getCleanliness());
        toiletDetails.setImage(dto.getImage());
        toiletDetails.setFacilityCategory(dto.getFacilityCategory());
        toiletDetails.setEquipmentInput(dto.getEquipment());

        toiletDetails.setSource(dto.getSource());
        toiletDetails.setSourceUrl(dto.getSourceUrl());
        toiletDetails.setLastVerified(dto.getLastVerified());

        toiletDetails.setPublicUse(dto.getPublicUse());
        toiletDetails.setTypePark(dto.getTypePark());
        toiletDetails.setTypeStation(dto.getTypeStation());
        toiletDetails.setTypeMall(dto.getTypeMall());

        Toilet updated = toiletService.updateToilet(id, toiletDetails);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteToilet(@PathVariable Long id) {
        toiletService.deleteToilet(id);
        return ResponseEntity.noContent().build();
    }
}