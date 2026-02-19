package com.imatoilet.backend;

import com.imatoilet.backend.dto.ToiletUpdateDto; // ★追加
import jakarta.validation.Valid;
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
        return ResponseEntity.ok(toiletService.getToilet(id));
    }

    // 新規登録
    @PostMapping
    public ResponseEntity<Toilet> createToilet(@RequestBody @Valid Toilet toilet) {
        Toilet saved = toiletService.createToilet(toilet);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }
    
    // 更新
    // ★修正: 引数を ToiletUpdateDto に変更
    @PutMapping("/{id}")
    public ResponseEntity<Toilet> updateToilet(
            @PathVariable Long id, 
            @RequestBody @Valid ToiletUpdateDto dto) {
        
        // DTO -> Entity への詰め替え
        // (Serviceの updateToilet は null のフィールドを無視する仕様になっているため、
        //  ここで null のまま渡せば部分更新として機能します)
        Toilet toiletDetails = new Toilet();
        toiletDetails.setName(dto.getName());
        toiletDetails.setLat(dto.getLat());
        toiletDetails.setLng(dto.getLng());
        toiletDetails.setAddress(dto.getAddress());
        toiletDetails.setDescription(dto.getDescription());
        toiletDetails.setCleanliness(dto.getCleanliness());
        toiletDetails.setImage(dto.getImage());
        toiletDetails.setFacilityCategory(dto.getFacilityCategory());
        
        // 設備リストの受け渡し
        toiletDetails.setEquipmentInput(dto.getEquipment());

        // 互換フラグの受け渡し
        toiletDetails.setPublicUse(dto.getPublicUse());
        toiletDetails.setDiaper(dto.getDiaper());
        toiletDetails.setWheelchair(dto.getWheelchair());
        toiletDetails.setOpen24h(dto.getOpen24h());
        toiletDetails.setTypePark(dto.getTypePark());
        toiletDetails.setTypeStation(dto.getTypeStation());
        toiletDetails.setTypeMall(dto.getTypeMall());

        Toilet updated = toiletService.updateToilet(id, toiletDetails);
        return ResponseEntity.ok(updated);
    }

    // 削除
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteToilet(@PathVariable Long id) {
        toiletService.deleteToilet(id);
        return ResponseEntity.noContent().build();
    }
}