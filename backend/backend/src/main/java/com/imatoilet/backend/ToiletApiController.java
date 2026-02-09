package com.imatoilet.backend;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/toilets")
public class ToiletApiController {

    @Autowired
    private ToiletService toiletService;

    // 検索・一覧取得
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
        List<Toilet> results = toiletService.searchToilets(
                lat, lng, radius, facilityCategory, minCleanliness, keyword, equipment
        );
        return ResponseEntity.ok(results);
    }

    // ID検索
    @GetMapping("/{id}")
    public ResponseEntity<Toilet> getToiletById(@PathVariable Long id) {
        if (id == null) {
             throw new IllegalArgumentException("ID must not be null");
        }
        return ResponseEntity.ok(toiletService.getToilet(id));
    }

    // 新規登録
    @PostMapping
    public ResponseEntity<Toilet> createToilet(@RequestBody @Valid Toilet toilet) {
        Toilet saved = toiletService.createToilet(toilet);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }
    
    // 更新
    @PutMapping("/{id}")
    public ResponseEntity<Toilet> updateToilet(@PathVariable Long id, @RequestBody @Valid Toilet toiletDetails) {
        if (id == null) {
             throw new IllegalArgumentException("ID must not be null");
        }
        Toilet updated = toiletService.updateToilet(id, toiletDetails);
        return ResponseEntity.ok(updated);
    }

    // 削除
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteToilet(@PathVariable Long id) {
        if (id == null) {
             throw new IllegalArgumentException("ID must not be null");
        }
        toiletService.deleteToilet(id);
        return ResponseEntity.noContent().build();
    }
}