package com.smartcampus.paf.repository;

import com.smartcampus.paf.model.Resource;
import com.smartcampus.paf.model.enums.ResourceStatus;
import com.smartcampus.paf.model.enums.ResourceType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, String> {

    // Filter by type
    Page<Resource> findByType(ResourceType type, Pageable pageable);

    // Filter by status
    Page<Resource> findByStatus(ResourceStatus status, Pageable pageable);

    // Filter by type and status
    Page<Resource> findByTypeAndStatus(ResourceType type, ResourceStatus status, Pageable pageable);

    // Search by name or location (case-insensitive)
    @Query("SELECT r FROM Resource r WHERE " +
            "(:type IS NULL OR r.type = :type) AND " +
            "(:status IS NULL OR r.status = :status) AND " +
            "(:minCapacity IS NULL OR r.capacity >= :minCapacity) AND " +
            "(:location IS NULL OR LOWER(r.location) LIKE LOWER(CONCAT('%', :location, '%'))) AND " +
            "(:keyword IS NULL OR LOWER(r.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "   OR LOWER(r.description) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Resource> searchResources(
            @Param("type") ResourceType type,
            @Param("status") ResourceStatus status,
            @Param("minCapacity") Integer minCapacity,
            @Param("location") String location,
            @Param("keyword") String keyword,
            Pageable pageable
    );

    // Check name uniqueness
    boolean existsByNameIgnoreCase(String name);
    boolean existsByNameIgnoreCaseAndIdNot(String name, String id);

    // Active resources only
    List<Resource> findByStatus(ResourceStatus status);

    // Count by type
    long countByType(ResourceType type);

    // Count by status
    long countByStatus(ResourceStatus status);
}
