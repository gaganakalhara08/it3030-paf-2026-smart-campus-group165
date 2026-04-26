package com.smartcampus.paf.controller;

import com.smartcampus.paf.dto.request.ResourceRequestDTO;
import com.smartcampus.paf.dto.response.DayAvailabilityDTO;
import com.smartcampus.paf.dto.response.ResourceAnalyticsDTO;
import com.smartcampus.paf.dto.response.ResourceResponseDTO;
import com.smartcampus.paf.model.enums.ResourceStatus;
import com.smartcampus.paf.model.enums.ResourceType;
import com.smartcampus.paf.service.ResourceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

/**
 * ResourceController — Module A: Facilities & Assets Catalogue
 *
 * POST   /api/resources                        (ADMIN) Create resource
 * GET    /api/resources                        (ALL)   Search/filter resources
 * GET    /api/resources/stats                  (ADMIN) Catalogue counts
 * GET    /api/resources/analytics              (ADMIN) Usage analytics — Feature 1
 * GET    /api/resources/{id}                   (ALL)   Get single resource
 * GET    /api/resources/{id}/availability      (ALL)   Day availability — Feature 3
 * PUT    /api/resources/{id}                   (ADMIN) Full update
 * PATCH  /api/resources/{id}/status            (ADMIN) Status-only update
 * DELETE /api/resources/{id}                   (ADMIN) Delete
 */
@RestController
@RequestMapping("/api/resources")
@RequiredArgsConstructor
public class ResourceController {

    private final ResourceService resourceService;

    // ── POST /api/resources ───────────────────────────────────────────────────
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResourceResponseDTO> createResource(
            @Valid @RequestBody ResourceRequestDTO dto,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(resourceService.createResource(dto, userDetails.getUsername()));
    }

    // ── GET /api/resources ────────────────────────────────────────────────────
    @GetMapping
    public ResponseEntity<Page<ResourceResponseDTO>> searchResources(
            @RequestParam(required = false) ResourceType type,
            @RequestParam(required = false) ResourceStatus status,
            @RequestParam(required = false) Integer minCapacity,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0")    int page,
            @RequestParam(defaultValue = "12")   int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc")  String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(
                resourceService.searchResources(type, status, minCapacity, location, keyword, pageable));
    }

    // ── GET /api/resources/stats ──────────────────────────────────────────────
    // Defined before /{id} to avoid route conflict
    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Long>> getResourceStats() {
        return ResponseEntity.ok(resourceService.getResourceStats());
    }

    // ── GET /api/resources/analytics  (Feature 1) ────────────────────────────
    @GetMapping("/analytics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResourceAnalyticsDTO> getAnalytics() {
        return ResponseEntity.ok(resourceService.getAnalytics());
    }

    // ── GET /api/resources/{id} ───────────────────────────────────────────────
    @GetMapping("/{id}")
    public ResponseEntity<ResourceResponseDTO> getResourceById(@PathVariable String id) {
        return ResponseEntity.ok(resourceService.getResourceById(id));
    }

    // ── GET /api/resources/{id}/availability  (Feature 3) ────────────────────
    @GetMapping("/{id}/availability")
    public ResponseEntity<DayAvailabilityDTO> getDayAvailability(
            @PathVariable String id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(resourceService.getDayAvailability(id, date));
    }

    // ── PUT /api/resources/{id} ───────────────────────────────────────────────
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResourceResponseDTO> updateResource(
            @PathVariable String id,
            @Valid @RequestBody ResourceRequestDTO dto) {
        return ResponseEntity.ok(resourceService.updateResource(id, dto));
    }

    // ── PATCH /api/resources/{id}/status ─────────────────────────────────────
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResourceResponseDTO> updateResourceStatus(
            @PathVariable String id,
            @RequestParam ResourceStatus status) {
        return ResponseEntity.ok(resourceService.updateResourceStatus(id, status));
    }

    // ── DELETE /api/resources/{id} ────────────────────────────────────────────
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> deleteResource(@PathVariable String id) {
        resourceService.deleteResource(id);
        return ResponseEntity.ok(Map.of("message", "Resource deleted successfully", "id", id));
    }
}
