package com.smartcampus.paf.service;

import com.smartcampus.paf.dto.request.ResourceRequestDTO;
import com.smartcampus.paf.dto.response.ResourceResponseDTO;
import com.smartcampus.paf.exception.DuplicateResourceException;
import com.smartcampus.paf.exception.ResourceNotFoundException;
import com.smartcampus.paf.model.Resource;
import com.smartcampus.paf.model.User;
import com.smartcampus.paf.model.enums.ResourceStatus;
import com.smartcampus.paf.model.enums.ResourceType;
import com.smartcampus.paf.repository.ResourceRepository;
import com.smartcampus.paf.repository.UserRepository;
import com.smartcampus.paf.service.impl.ResourceServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ResourceService Unit Tests")@SuppressWarnings("null")class ResourceServiceTest {

    @Mock private ResourceRepository resourceRepository;
    @Mock private UserRepository userRepository;
    @InjectMocks private ResourceServiceImpl resourceService;

    private ResourceRequestDTO validRequest;
    private Resource sampleResource;
    private User adminUser;

    @BeforeEach
    void setUp() {
        adminUser = new User();
        adminUser.setId("admin-1");
        adminUser.setEmail("admin@campus.lk");
        adminUser.setName("Admin User");

        validRequest = new ResourceRequestDTO();
        validRequest.setName("Lab A101");
        validRequest.setType(ResourceType.LAB);
        validRequest.setCapacity(30);
        validRequest.setLocation("Block A, Floor 1");
        validRequest.setBuilding("Block A");
        validRequest.setFloor("1");
        validRequest.setRoomNumber("A101");
        validRequest.setAvailabilityStart(LocalTime.of(8, 0));
        validRequest.setAvailabilityEnd(LocalTime.of(18, 0));
        validRequest.setStatus(ResourceStatus.ACTIVE);

        sampleResource = Resource.builder()
                .id("res-1")
                .name("Lab A101")
                .type(ResourceType.LAB)
                .capacity(30)
                .location("Block A, Floor 1")
                .building("Block A")
                .floor("1")
                .roomNumber("A101")
                .availabilityStart(LocalTime.of(8, 0))
                .availabilityEnd(LocalTime.of(18, 0))
                .status(ResourceStatus.ACTIVE)
                .createdBy(adminUser)
                .build();
    }

    // ──────────────────────────────── CREATE ────────────────────────────────

    @Test
    @DisplayName("createResource: should create and return resource successfully")
    void createResource_success() {
        when(resourceRepository.existsByNameIgnoreCase("Lab A101")).thenReturn(false);
        when(userRepository.findByEmail("admin@campus.lk")).thenReturn(Optional.of(adminUser));
        when(resourceRepository.save(any(Resource.class))).thenReturn(sampleResource);

        ResourceResponseDTO result = resourceService.createResource(validRequest, "admin@campus.lk");

        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("Lab A101");
        assertThat(result.getType()).isEqualTo(ResourceType.LAB);
        assertThat(result.getStatus()).isEqualTo(ResourceStatus.ACTIVE);
        verify(resourceRepository).save(any(Resource.class));
    }

    @Test
    @DisplayName("createResource: should throw DuplicateResourceException when name already exists")
    void createResource_duplicateName_throwsException() {
        when(resourceRepository.existsByNameIgnoreCase("Lab A101")).thenReturn(true);

        assertThatThrownBy(() -> resourceService.createResource(validRequest, "admin@campus.lk"))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("Lab A101");

        verify(resourceRepository, never()).save(any(Resource.class));
    }

    @Test
    @DisplayName("createResource: should throw IllegalArgumentException when end time is before start time")
    void createResource_invalidTimeWindow_throwsException() {
        when(resourceRepository.existsByNameIgnoreCase(any())).thenReturn(false);
        validRequest.setAvailabilityEnd(LocalTime.of(6, 0)); // before start

        assertThatThrownBy(() -> resourceService.createResource(validRequest, "admin@campus.lk"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("end time must be after start time");
    }

    // ──────────────────────────────── GET BY ID ────────────────────────────────

    @Test
    @DisplayName("getResourceById: should return resource when found")
    void getResourceById_found() {
        when(resourceRepository.findById("res-1")).thenReturn(Optional.of(sampleResource));

        ResourceResponseDTO result = resourceService.getResourceById("res-1");

        assertThat(result.getId()).isEqualTo("res-1");
        assertThat(result.getCapacity()).isEqualTo(30);
    }

    @Test
    @DisplayName("getResourceById: should throw ResourceNotFoundException when not found")
    void getResourceById_notFound() {
        when(resourceRepository.findById("bad-id")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> resourceService.getResourceById("bad-id"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("bad-id");
    }

    // ──────────────────────────────── SEARCH ────────────────────────────────

    @Test
    @DisplayName("searchResources: should return paged results")
    void searchResources_returnsPage() {
        Pageable pageable = PageRequest.of(0, 12);
        Page<Resource> page = new PageImpl<>(List.of(sampleResource));
        when(resourceRepository.searchResources(any(), any(), any(), any(), any(), eq(pageable)))
                .thenReturn(page);

        Page<ResourceResponseDTO> result = resourceService.searchResources(
                null, null, null, null, null, pageable);

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getName()).isEqualTo("Lab A101");
    }

    // ──────────────────────────────── UPDATE STATUS ────────────────────────────────

    @Test
    @DisplayName("updateResourceStatus: should update status to OUT_OF_SERVICE")
    void updateResourceStatus_success() {
        when(resourceRepository.findById("res-1")).thenReturn(Optional.of(sampleResource));
        sampleResource.setStatus(ResourceStatus.OUT_OF_SERVICE);
        when(resourceRepository.save(any())).thenReturn(sampleResource);

        ResourceResponseDTO result = resourceService.updateResourceStatus("res-1", ResourceStatus.OUT_OF_SERVICE);

        assertThat(result.getStatus()).isEqualTo(ResourceStatus.OUT_OF_SERVICE);
    }

    // ──────────────────────────────── DELETE ────────────────────────────────

    @Test
    @DisplayName("deleteResource: should delete without error when resource exists")
    void deleteResource_success() {
        when(resourceRepository.existsById("res-1")).thenReturn(true);
        doNothing().when(resourceRepository).deleteById("res-1");

        assertThatCode(() -> resourceService.deleteResource("res-1")).doesNotThrowAnyException();
        verify(resourceRepository).deleteById("res-1");
    }

    @Test
    @DisplayName("deleteResource: should throw ResourceNotFoundException when not found")
    void deleteResource_notFound() {
        when(resourceRepository.existsById("bad-id")).thenReturn(false);

        assertThatThrownBy(() -> resourceService.deleteResource("bad-id"))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
