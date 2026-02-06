package com.imatoilet.backend;

import com.imatoilet.backend.exception.ResourceNotFoundException;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Objects; // 追加：Nullチェック用

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/toilets")
@CrossOrigin(origins = "${app.cors.allowed-origins}")
public class ToiletApiController {

    @Autowired
    private ToiletRepository toiletRepository;

    /**
     * トイレ一覧取得・検索API
     */
    @GetMapping
    public ResponseEntity<List<Toilet>> getToilets(
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lng,
            @RequestParam(required = false, defaultValue = "5.0") Double radius,
            @RequestParam(required = false) String facilityCategory,
            @RequestParam(required = false) Integer minCleanliness,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) List<String> equipment
    ) {
        List<Toilet> results;

        if (lat != null && lng != null) {
            results = toiletRepository.findWithinRadius(lat, lng, radius);
        }
        else if (facilityCategory != null || minCleanliness != null || keyword != null || (equipment != null && !equipment.isEmpty())) {
            
            List<EquipmentType> types = null;
            if (equipment != null && !equipment.isEmpty()) {
                types = new ArrayList<>();
                for (String eq : equipment) {
                    try {
                        types.add(EquipmentType.valueOf(eq));
                    } catch (IllegalArgumentException e) {
                        // 無効な値は無視
                    }
                }
                if (types.isEmpty()) types = null;
            }

            results = toiletRepository.searchBySpecs(facilityCategory, minCleanliness, keyword, types);
        }
        else {
            results = toiletRepository.findAll();
        }

        return ResponseEntity.ok(results);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Toilet> getToiletById(@PathVariable Long id) {
        // 安全対策: IDがnullの場合は例外を投げる（警告回避のため明示）
        if (id == null) {
             throw new IllegalArgumentException("ID must not be null");
        }
        
        Toilet toilet = toiletRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("トイレ", "id", id));
        return ResponseEntity.ok(toilet);
    }

    @PostMapping
    public ResponseEntity<Toilet> createToilet(@RequestBody @Valid Toilet toilet) {
        if (toilet.getCleanliness() == null) {
            toilet.setCleanliness(3);
        }
        Toilet saved = toiletRepository.save(toilet);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Toilet> updateToilet(@PathVariable Long id, @RequestBody @Valid Toilet toiletDetails) {
        // 安全対策: IDのNullチェック
        if (id == null) {
             throw new IllegalArgumentException("ID must not be null");
        }

        Toilet toilet = toiletRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("トイレ", "id", id));

        toilet.setName(toiletDetails.getName());
        toilet.setAddress(toiletDetails.getAddress());
        toilet.setDescription(toiletDetails.getDescription());
        toilet.setLat(toiletDetails.getLat());
        toilet.setLng(toiletDetails.getLng());
        toilet.setCleanliness(toiletDetails.getCleanliness());
        toilet.setFacilityCategory(toiletDetails.getFacilityCategory());
        toilet.setEquipment(toiletDetails.getEquipment());
        
        toilet.setWheelchair(toiletDetails.getWheelchair());
        toilet.setDiaper(toiletDetails.getDiaper());
        toilet.setOpen24h(toiletDetails.getOpen24h());

        final Toilet updatedToilet = toiletRepository.save(toilet);
        return ResponseEntity.ok(updatedToilet);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteToilet(@PathVariable Long id) {
        // 安全対策: IDのNullチェック
        if (id == null) {
             throw new IllegalArgumentException("ID must not be null");
        }

        if (!toiletRepository.existsById(id)) {
            throw new ResourceNotFoundException("トイレ", "id", id);
        }
        toiletRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}