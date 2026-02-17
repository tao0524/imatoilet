package com.imatoilet.backend;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.lang.NonNull;
import java.util.List;

public interface ToiletRepository extends JpaRepository<Toilet, Long> {

    @Override
    @EntityGraph(attributePaths = {"equipmentList"})
    @NonNull
    List<Toilet> findAll();

    // ★修正: IDのみ返すことで、@EntityGraph付きの2段階取得を可能にする（N+1解消）
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

    // ★追加: IDリストからequipmentListを含めて一括取得（N+1解消）
    @EntityGraph(attributePaths = {"equipmentList"})
    @Query("SELECT t FROM Toilet t WHERE t.id IN :ids")
    List<Toilet> findAllByIdWithEquipment(@Param("ids") List<Long> ids);

    // 修正7: HAVING COUNT を使用して AND条件にする
    @Query("SELECT t FROM Toilet t " +
           "LEFT JOIN t.equipmentList e " +
           "WHERE " +
           "(:facilityCategory IS NULL OR t.facilityCategory = :facilityCategory) AND " +
           "(:minCleanliness IS NULL OR t.cleanliness >= :minCleanliness) AND " +
           "(:keyword IS NULL OR " +
           "  t.name LIKE %:keyword% OR " +
           "  t.address LIKE %:keyword% OR " +
           "  t.description LIKE %:keyword% OR " +
           "  t.equipment LIKE %:keyword%) AND " +
           "(:equipmentTypes IS NULL OR e.type IN :equipmentTypes) " +
           "GROUP BY t " +
           "HAVING (:equipmentTypes IS NULL OR COUNT(DISTINCT e.type) = :typeCount)")
    List<Toilet> searchBySpecs(
        @Param("facilityCategory") String facilityCategory,
        @Param("minCleanliness") Integer minCleanliness,
        @Param("keyword") String keyword,
        @Param("equipmentTypes") List<EquipmentType> equipmentTypes,
        @Param("typeCount") Long typeCount
    );
}