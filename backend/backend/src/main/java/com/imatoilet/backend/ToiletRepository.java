package com.imatoilet.backend;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.lang.NonNull;
import java.util.List;

public interface ToiletRepository extends JpaRepository<Toilet, Long> {

    // N+1対策済みの全件取得
    @Override
    @EntityGraph(attributePaths = {"equipmentList"})
    @NonNull
    List<Toilet> findAll();

    // 1. 位置情報検索 (PostgreSQLネイティブクエリ / 半径km指定)
    @Query(value = "SELECT * FROM toilet t WHERE " +
           "(6371 * acos(least(1.0, greatest(-1.0, " +
           "  cos(radians(:lat)) * cos(radians(t.lat)) * " +
           "  cos(radians(t.lng) - radians(:lng)) + " +
           "  sin(radians(:lat)) * sin(radians(t.lat))" +
           ")))) <= :radius", nativeQuery = true)
    List<Toilet> findWithinRadius(
        @Param("lat") Double lat,
        @Param("lng") Double lng,
        @Param("radius") Double radius
    );

    // 2. 条件検索 (JPQL / 正規化されたEquipmentテーブルとのJOIN)
    // S0フェーズ: EquipmentTypeのリストに含まれる設備を持つトイレを検索
    // キーワードは name, address, description, equipment(CSV) を対象にする
    @Query("SELECT DISTINCT t FROM Toilet t " +
           "LEFT JOIN t.equipmentList e " +
           "WHERE " +
           "(:facilityCategory IS NULL OR t.facilityCategory = :facilityCategory) AND " +
           "(:minCleanliness IS NULL OR t.cleanliness >= :minCleanliness) AND " +
           "(:keyword IS NULL OR " +
           "  t.name LIKE %:keyword% OR " +
           "  t.address LIKE %:keyword% OR " +
           "  t.description LIKE %:keyword% OR " +
           "  t.equipment LIKE %:keyword%) AND " +
           "(:equipmentTypes IS NULL OR e.type IN :equipmentTypes)")
    List<Toilet> searchBySpecs(
        @Param("facilityCategory") String facilityCategory,
        @Param("minCleanliness") Integer minCleanliness,
        @Param("keyword") String keyword,
        @Param("equipmentTypes") List<EquipmentType> equipmentTypes
    );
}