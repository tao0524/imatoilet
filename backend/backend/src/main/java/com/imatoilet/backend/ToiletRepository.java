package com.imatoilet.backend;

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

    // ★修正: 独自メソッドを廃止し、標準のfindByIdをオーバーライドしてEagerロード化
    // これによりメソッド名解析やJPQLのミスによる500エラーを確実に防ぎます
    @Override
    @EntityGraph(attributePaths = {"equipmentList"})
    @NonNull
    Optional<Toilet> findById(@NonNull Long id);

    // 位置検索（ネイティブクエリ）
    @Query(value = "SELECT t.id FROM toilet t WHERE " +
           "(6371 * acos(least(1.0, greatest(-1.0, " +
           "  cos(radians(:lat)) * cos(radians(t.lat)) * " +
           "  cos(radians(t.lng) - radians(:lng)) + " +
           "  sin(radians(:lat)) * sin(radians(t.lat))" +
           ")))) <= :radius", nativeQuery = true)
    List<Long> findIdsWithinRadius(
        @Param("lat") Double lat,
        @Param("lng") Double lng,
        @Param("radius") Double radius
    );

    // ID指定取得（複数）
    @EntityGraph(attributePaths = {"equipmentList"})
    @Query("SELECT t FROM Toilet t WHERE t.id IN :ids")
    List<Toilet> findAllByIdWithEquipment(@Param("ids") List<Long> ids);

    // 検索機能
    @Query("SELECT t.id FROM Toilet t " +
           "LEFT JOIN t.equipmentList e " +
           "WHERE " +
           "(:facilityCategory IS NULL OR t.facilityCategory = :facilityCategory) AND " +
           "(:minCleanliness IS NULL OR t.cleanliness >= :minCleanliness) AND " +
           "(:keyword IS NULL OR " +
           "  t.name LIKE %:keyword% OR " +
           "  t.address LIKE %:keyword% OR " +
           "  t.description LIKE %:keyword%) AND " +
           "(:equipmentTypes IS NULL OR e.type IN :equipmentTypes) " +
           "GROUP BY t.id " +
           "HAVING (:equipmentTypes IS NULL OR COUNT(DISTINCT e.type) = :typeCount)")
    List<Long> searchIdsBySpecs(
        @Param("facilityCategory") String facilityCategory,
        @Param("minCleanliness") Integer minCleanliness,
        @Param("keyword") String keyword,
        @Param("equipmentTypes") List<EquipmentType> equipmentTypes,
        @Param("typeCount") Long typeCount
    );
}