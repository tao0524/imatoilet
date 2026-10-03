package com.imatoilet.backend;

import com.imatoilet.backend.dto.ExternalImportItemDto;
import com.imatoilet.backend.dto.ExternalImportItemResultDto;
import com.imatoilet.backend.dto.ExternalImportRequestDto;
import com.imatoilet.backend.dto.ExternalImportResponseDto;
import com.imatoilet.backend.dto.ExternalImportStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.dao.DataIntegrityViolationException;
import jakarta.persistence.EntityManager;
import org.hibernate.Session;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class ExternalToiletImportService {
    static final double NEARBY_LIMIT_METERS = 50.0;
    private static final double EARTH_RADIUS_METERS = 6_371_000.0;
    private static final long EXTERNAL_IMPORT_ADVISORY_LOCK_KEY = 4_963_841_769_001L;
    private static final String EXTERNAL_IDENTITY_INDEX = "uq_toilet_external_identity";

    private final ToiletRepository toiletRepository;
    private final EquipmentRepository equipmentRepository;
    private final EntityManager entityManager;

    public ExternalToiletImportService(ToiletRepository toiletRepository,
                                       EquipmentRepository equipmentRepository,
                                       EntityManager entityManager) {
        this.toiletRepository = toiletRepository;
        this.equipmentRepository = equipmentRepository;
        this.entityManager = entityManager;
    }

    @Transactional
    public ExternalImportResponseDto importToilets(ExternalImportRequestDto request) {
        acquireDatabaseImportLockWhenSupported();
        ImportPlan plan = buildPlan(request.getToilets());
        if (!request.isDryRun()) {
            try {
                persistReadyItems(plan);
            } catch (DataIntegrityViolationException ex) {
                if (isExternalIdentityConflict(ex)) {
                    throw new ExternalImportConflictException(
                            "同じ外部IDが他の処理で登録された可能性があります。dry-runをやり直してください。",
                            ex);
                }
                throw ex;
            }
        }
        return new ExternalImportResponseDto(request.isDryRun(), plan.results());
    }

    private ImportPlan buildPlan(List<ExternalImportItemDto> items) {
        List<ExternalImportItemResultDto> results = new ArrayList<>();
        List<PlannedItem> readyItems = new ArrayList<>();

        for (int index = 0; index < items.size(); index++) {
            ExternalImportItemDto item = items.get(index);
            Optional<Toilet> alreadyImported = toiletRepository.findBySourceKeyAndSourceExternalId(
                    item.getSourceKey(), item.getSourceExternalId());

            if (alreadyImported.isPresent()) {
                Toilet existing = alreadyImported.get();
                results.add(result(index, item, ExternalImportStatus.ALREADY_IMPORTED,
                        existing.getId(), distanceMeters(item.getLat(), item.getLng(), existing.getLat(), existing.getLng()),
                        "同じ外部IDは既に取り込み済みです"));
                continue;
            }

            NearbyMatch nearby = findNearestExisting(item).orElse(null);
            NearbyMatch plannedNearby = findNearestPlanned(item, readyItems).orElse(null);
            if (plannedNearby != null && (nearby == null || plannedNearby.distanceMeters() < nearby.distanceMeters())) {
                nearby = plannedNearby;
            }

            if (nearby != null && !item.isAllowNearbyDistinct()) {
                results.add(result(index, item, ExternalImportStatus.NEARBY_CONFLICT,
                        nearby.toiletId(), nearby.distanceMeters(),
                        "50m以内に別のトイレが存在します"));
                continue;
            }

            ExternalImportItemResultDto readyResult = result(index, item, ExternalImportStatus.READY,
                    null, nearby == null ? null : nearby.distanceMeters(),
                    nearby == null ? "登録可能です" : "近隣の別施設として明示的に登録が許可されています");
            results.add(readyResult);
            readyItems.add(new PlannedItem(item, readyResult));
        }
        return new ImportPlan(results, readyItems);
    }

    private void persistReadyItems(ImportPlan plan) {
        for (PlannedItem planned : plan.readyItems()) {
            ExternalImportItemDto item = planned.item();
            Toilet toilet = toEntity(item);
            Toilet saved = toiletRepository.save(toilet);

            Set<EquipmentType> equipmentTypes = new LinkedHashSet<>();
            if (item.getEquipment() != null) {
                item.getEquipment().forEach(value -> equipmentTypes.add(EquipmentType.valueOf(value)));
            }
            if (!equipmentTypes.isEmpty()) {
                List<Equipment> equipment = equipmentTypes.stream()
                        .map(type -> new Equipment(saved, type))
                        .toList();
                equipmentRepository.saveAll(equipment);
            }

            planned.result().setStatus(ExternalImportStatus.INSERTED);
            planned.result().setExistingToiletId(saved.getId());
            planned.result().setMessage("登録しました");
        }
        toiletRepository.flush();
        equipmentRepository.flush();
    }

    private void acquireDatabaseImportLockWhenSupported() {
        entityManager.unwrap(Session.class).doWork(connection -> {
            if (!"PostgreSQL".equals(connection.getMetaData().getDatabaseProductName())) {
                return;
            }
            try (var statement = connection.prepareStatement("SELECT pg_advisory_xact_lock(?)")) {
                statement.setLong(1, EXTERNAL_IMPORT_ADVISORY_LOCK_KEY);
                statement.execute();
            }
        });
    }

    private boolean isExternalIdentityConflict(Throwable throwable) {
        Throwable current = throwable;
        while (current != null) {
            if (current instanceof org.hibernate.exception.ConstraintViolationException violation
                    && EXTERNAL_IDENTITY_INDEX.equals(violation.getConstraintName())) {
                return true;
            }
            if (current instanceof org.postgresql.util.PSQLException psql
                    && "23505".equals(psql.getSQLState())
                    && psql.getServerErrorMessage() != null
                    && EXTERNAL_IDENTITY_INDEX.equals(psql.getServerErrorMessage().getConstraint())) {
                return true;
            }
            current = current.getCause();
        }
        return false;
    }

    private Optional<NearbyMatch> findNearestExisting(ExternalImportItemDto item) {
        double latDelta = NEARBY_LIMIT_METERS / 111_320.0;
        double cosLatitude = Math.cos(Math.toRadians(item.getLat()));
        double lngDelta = Math.abs(cosLatitude) < 1.0e-12
                ? 180.0
                : Math.min(180.0, NEARBY_LIMIT_METERS / (111_320.0 * Math.abs(cosLatitude)));

        return toiletRepository.findByLatBetweenAndLngBetween(
                        item.getLat() - latDelta, item.getLat() + latDelta,
                        item.getLng() - lngDelta, item.getLng() + lngDelta).stream()
                .map(toilet -> new NearbyMatch(toilet.getId(),
                        distanceMeters(item.getLat(), item.getLng(), toilet.getLat(), toilet.getLng())))
                .filter(match -> match.distanceMeters() <= NEARBY_LIMIT_METERS)
                .min(Comparator.comparingDouble(NearbyMatch::distanceMeters));
    }

    private Optional<NearbyMatch> findNearestPlanned(ExternalImportItemDto item, List<PlannedItem> plannedItems) {
        return plannedItems.stream()
                .map(planned -> new NearbyMatch(null, distanceMeters(
                        item.getLat(), item.getLng(), planned.item().getLat(), planned.item().getLng())))
                .filter(match -> match.distanceMeters() <= NEARBY_LIMIT_METERS)
                .min(Comparator.comparingDouble(NearbyMatch::distanceMeters));
    }

    private Toilet toEntity(ExternalImportItemDto item) {
        Toilet toilet = new Toilet();
        toilet.setName(item.getName() == null || item.getName().isBlank() ? "公衆トイレ" : item.getName());
        toilet.setLat(item.getLat());
        toilet.setLng(item.getLng());
        toilet.setAddress(item.getAddress());
        toilet.setDescription(item.getDescription());
        toilet.setPublicUse(item.getPublicUse());
        toilet.setFacilityCategory(item.getFacilityCategory());
        toilet.setSource(item.getSource());
        toilet.setSourceUrl(item.getSourceUrl());
        toilet.setSourceKey(item.getSourceKey());
        toilet.setSourceExternalId(item.getSourceExternalId());
        toilet.setLastVerified(item.getLastVerified());
        toilet.setCleanliness(null);
        return toilet;
    }

    private ExternalImportItemResultDto result(int index, ExternalImportItemDto item,
                                                ExternalImportStatus status, Long existingToiletId,
                                                Double distanceMeters, String message) {
        return new ExternalImportItemResultDto(index, item.getSourceKey(), item.getSourceExternalId(),
                status, existingToiletId, distanceMeters, message);
    }

    static double distanceMeters(double lat1, double lng1, double lat2, double lng2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLng = Math.toRadians(lng2 - lng1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLng / 2) * Math.sin(dLng / 2);
        return EARTH_RADIUS_METERS * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    private record NearbyMatch(Long toiletId, double distanceMeters) {}
    private record PlannedItem(ExternalImportItemDto item, ExternalImportItemResultDto result) {}
    private record ImportPlan(List<ExternalImportItemResultDto> results, List<PlannedItem> readyItems) {}
}
