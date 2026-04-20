package com.smartcampus.paf.controller;

import com.smartcampus.paf.dto.request.ResourceRequestDTO;
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
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * ResourceController — Module A: Facilities & Assets Catalogue
 *
 * Endpoints:
 *   POST   /api/resources                          (ADMIN) Create resource
 *   GET    /api/resources                          (ALL)   Search/filter resources
 *   GET    /api/resources/{id}                     (ALL)   Get resource by ID
 *   PUT    /api/resources/{id}                     (ADMIN) Full update resource
 *   PATCH  /api/resources/{id}/status              (ADMIN) Update status only
 *   DELETE /api/resources/{id}                     (ADMIN) Delete resource
 *   GET    /api/resources/stats                    (ADMIN) Get catalogue stats
 */
@RestController
@RequestMapping("/api/resources")
@RequiredArgsConstructor
public class ResourceController {

    private final ResourceService resourceService;

    // ─────────────────────────────────────────────────────────────
    // POST /api/resources — Create a new resource (ADMIN only)
    // ─────────────────────────────────────────────────────────────
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResourceResponseDTO> createResource(
            @Valid @RequestBody ResourceRequestDTO dto,
            @AuthenticationPrincipal UserDetails userDetails) {

        ResourceResponseDTO response = resourceService.createResource(dto, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // ─────────────────────────────────────────────────────────────
    // GET /api/resources — Search & filter catalogue (all authenticated users)
    // Supports: type, status, minCapacity, location, keyword, page, size, sort
    // ─────────────────────────────────────────────────────────────
    @GetMapping
    public ResponseEntity<Page<ResourceResponseDTO>> searchResources(
            @RequestParam(required = false) ResourceType type,
            @RequestParam(required = false) ResourceStatus status,
            @RequestParam(required = false) Integer minCapacity,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<ResourceResponseDTO> result = resourceService.searchResources(
                type, status, minCapacity, location, keyword, pageable);

        return ResponseEntity.ok(result);
    }

    // ─────────────────────────────────────────────────────────────
    // GET /api/resources/stats — Catalogue statistics (ADMIN)
    // Must be defined BEFORE /{id} to avoid route conflict
    // ─────────────────────────────────────────────────────────────
    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Long>> getResourceStats() {
        return ResponseEntity.ok(resourceService.getResourceStats());
    }

    // ─────────────────────────────────────────────────────────────
    // GET /api/resources/{id} — Get single resource by ID
    // ─────────────────────────────────────────────────────────────
    @GetMapping("/{id}")
    public ResponseEntity<ResourceResponseDTO> getResourceById(@PathVariable String id) {
        return ResponseEntity.ok(resourceService.getResourceById(id));
    }

    // ─────────────────────────────────────────────────────────────
    // PUT /api/resources/{id} — Full update (ADMIN only)
    // ─────────────────────────────────────────────────────────────
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResourceResponseDTO> updateResource(
            @PathVariable String id,
            @Valid @RequestBody ResourceRequestDTO dto) {

        return ResponseEntity.ok(resourceService.updateResource(id, dto));
    }

    // ─────────────────────────────────────────────────────────────
    // PATCH /api/resources/{id}/status — Update status only (ADMIN)
    // ─────────────────────────────────────────────────────────────
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResourceResponseDTO> updateResourceStatus(
            @PathVariable String id,
            @RequestParam ResourceStatus status) {

        return ResponseEntity.ok(resourceService.updateResourceStatus(id, status));
    }

    // ─────────────────────────────────────────────────────────────
    // DELETE /api/resources/{id} — Delete resource (ADMIN only)
    // ─────────────────────────────────────────────────────────────
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> deleteResource(@PathVariable String id) {
        resourceService.deleteResource(id);
        return ResponseEntity.ok(Map.of(
                "message", "Resource deleted successfully",
                "id", id
        ));
    }
}
