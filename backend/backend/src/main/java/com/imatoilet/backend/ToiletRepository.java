package com.imatoilet.backend;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.lang.NonNull;
import java.util.List;
import java.util.Optional;

public interface ToiletRepository extends JpaRepository<Toilet, Long> {

    @Override
    @EntityGraph(attributePaths = {"equipmentList"})
    @NonNull
    List<Toilet> findAll();

    @Override
    @EntityGraph(attributePaths = {"equipmentList"})
    @NonNull
    Optional<Toilet> findById(@NonNull Long id);

    // ★追加: 表示領域（Bounding Box）による検索クエリ
    @Query(value = "SELECT t.id FROM toilet t WHERE " +
           "t.lat >= :minLat AND t.lat <= :maxLat AND t.lng >= :minLng AND t.lng <= :maxLng " +
           "AND (:facilityCategory IS NULL OR t.facility_category = :facilityCategory) " +
           "AND (:minCleanliness IS NULL OR t.cleanliness >= :minCleanliness) " +
           "AND (:keyword IS NULL OR LOWER(t.name) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "AND (:publicUse IS NULL OR t.public_use = :publicUse) " +
           "AND (:typeCount = 0 OR (SELECT COUNT(DISTINCT e.type) FROM equipment e WHERE e.toilet_id = t.id AND e.type IN (:equipmentTypes)) = :typeCount)",
           countQuery = "SELECT count(t.id) FROM toilet t WHERE " +
           "t.lat >= :minLat AND t.lat <= :maxLat AND t.lng >= :minLng AND t.lng <= :maxLng " +
           "AND (:facilityCategory IS NULL OR t.facility_category = :facilityCategory) " +
           "AND (:minCleanliness IS NULL OR t.cleanliness >= :minCleanliness) " +
           "AND (:keyword IS NULL OR LOWER(t.name) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "AND (:publicUse IS NULL OR t.public_use = :publicUse) " +
           "AND (:typeCount = 0 OR (SELECT COUNT(DISTINCT e.type) FROM equipment e WHERE e.toilet_id = t.id AND e.type IN (:equipmentTypes)) = :typeCount)",
           nativeQuery = true)
    Page<Long> findIdsWithinBoundsWithSpecs(
        @Param("minLat") Double minLat,
        @Param("maxLat") Double maxLat,
        @Param("minLng") Double minLng,
        @Param("maxLng") Double maxLng,
        @Param("facilityCategory") String facilityCategory,
        @Param("minCleanliness") Integer minCleanliness,
        @Param("keyword") String keyword,
        @Param("publicUse") Boolean publicUse,
        @Param("equipmentTypes") List<String> equipmentTypes,
        @Param("typeCount") Integer typeCount,
        Pageable pageable
    );

    // 既存: 位置検索 + フィルタリングのネイティブクエリ
    @Query(value = "SELECT t.id FROM toilet t WHERE " +
           "(6371 * acos(least(1.0, greatest(-1.0, " +
           "  cos(radians(:lat)) * cos(radians(t.lat)) * " +
           "  cos(radians(t.lng) - radians(:lng)) + " +
           "  sin(radians(:lat)) * sin(radians(t.lat))" +
           ")))) <= :radius " +
           "AND (:facilityCategory IS NULL OR t.facility_category = :facilityCategory) " +
           "AND (:minCleanliness IS NULL OR t.cleanliness >= :minCleanliness) " +
           "AND (:keyword IS NULL OR LOWER(t.name) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "AND (:publicUse IS NULL OR t.public_use = :publicUse) " +
           "AND (:typeCount = 0 OR (SELECT COUNT(DISTINCT e.type) FROM equipment e WHERE e.toilet_id = t.id AND e.type IN (:equipmentTypes)) = :typeCount)",
           countQuery = "SELECT count(t.id) FROM toilet t WHERE " +
           "(6371 * acos(least(1.0, greatest(-1.0, cos(radians(:lat)) * cos(radians(t.lat)) * cos(radians(t.lng) - radians(:lng)) + sin(radians(:lat)) * sin(radians(t.lat)))))) <= :radius " +
           "AND (:facilityCategory IS NULL OR t.facility_category = :facilityCategory) " +
           "AND (:minCleanliness IS NULL OR t.cleanliness >= :minCleanliness) " +
           "AND (:keyword IS NULL OR LOWER(t.name) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "AND (:publicUse IS NULL OR t.public_use = :publicUse) " +
           "AND (:typeCount = 0 OR (SELECT COUNT(DISTINCT e.type) FROM equipment e WHERE e.toilet_id = t.id AND e.type IN (:equipmentTypes)) = :typeCount)",
           nativeQuery = true)
    Page<Long> findIdsWithinRadiusWithSpecs(
        @Param("lat") Double lat,
        @Param("lng") Double lng,
        @Param("radius") Double radius,
        @Param("facilityCategory") String facilityCategory,
        @Param("minCleanliness") Integer minCleanliness,
        @Param("keyword") String keyword,
        @Param("publicUse") Boolean publicUse,
        @Param("equipmentTypes") List<String> equipmentTypes,
        @Param("typeCount") Integer typeCount,
        Pageable pageable
    );

    // 既存: 条件検索のJPQL
    @Query("SELECT t.id FROM Toilet t " +
           "WHERE (:facilityCategory IS NULL OR t.facilityCategory = :facilityCategory) " +
           "AND (:minCleanliness IS NULL OR t.cleanliness >= :minCleanliness) " +
           "AND (:keyword IS NULL OR LOWER(t.name) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "AND (:publicUse IS NULL OR t.publicUse = :publicUse) " +
           "AND (:typeCount = 0L OR (SELECT COUNT(DISTINCT e.type) FROM Equipment e WHERE e.toilet.id = t.id AND e.type IN :equipmentTypes) = :typeCount)")
    Page<Long> searchIdsBySpecs(
        @Param("facilityCategory") String facilityCategory,
        @Param("minCleanliness") Integer minCleanliness,
        @Param("keyword") String keyword,
        @Param("publicUse") Boolean publicUse,
        @Param("equipmentTypes") List<EquipmentType> equipmentTypes,
        @Param("typeCount") Long typeCount,
        Pageable pageable
    );

    // 2段階フェッチ用（N+1回避）
    @EntityGraph(attributePaths = {"equipmentList"})
    @Query("SELECT t FROM Toilet t WHERE t.id IN :ids")
    List<Toilet> findAllByIdWithEquipment(@Param("ids") List<Long> ids);

    boolean existsByTrustScoreLessThan(Double trustScore);

    // 一括インポート用: 50m以内の既存トイレIDを1件取得（重複チェック）
    @Query(value = "SELECT t.id FROM toilet t WHERE " +
           "(6371 * acos(least(1.0, greatest(-1.0, " +
           "  cos(radians(:lat)) * cos(radians(t.lat)) * " +
           "  cos(radians(t.lng) - radians(:lng)) + " +
           "  sin(radians(:lat)) * sin(radians(t.lat))" +
           ")))) <= :radiusKm " +
           "LIMIT 1",
           nativeQuery = true)
    List<Long> findNearbyToiletIds(
        @Param("lat") Double lat,
        @Param("lng") Double lng,
        @Param("radiusKm") Double radiusKm
    );
}