package com.smartcampus.paf.repository;

import com.smartcampus.paf.model.Booking;
import com.smartcampus.paf.model.User;
import com.smartcampus.paf.model.enums.BookingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, String> {

    List<Booking> findByUser(User user);
    List<Booking> findByStatus(BookingStatus status);
    List<Booking> findByResourceId(String resourceId);
    List<Booking> findByUserAndStatus(User user, BookingStatus status);

    @Query("SELECT b FROM Booking b WHERE b.resource.id = :resourceId " +
            "AND b.bookingDate = :date " +
            "AND b.status IN ('PENDING', 'APPROVED') " +
            "AND ((b.startTime <= :endTime AND b.endTime >= :startTime))")
    List<Booking> findConflictingBookings(@Param("resourceId") String resourceId,
            @Param("date") LocalDate date,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime);

    @Query("SELECT b FROM Booking b WHERE " +
            "(:status IS NULL OR b.status = :status) AND " +
            "(:resourceId IS NULL OR b.resource.id = :resourceId) AND " +
            "(:userId IS NULL OR b.user.id = :userId)")
    List<Booking> findBookingsWithFilters(@Param("status") BookingStatus status,
            @Param("resourceId") String resourceId,
            @Param("userId") String userId);

    @Query("SELECT b FROM Booking b WHERE " +
            "(:status IS NULL OR b.status = :status) AND " +
            "(:resourceId IS NULL OR b.resource.id = :resourceId) AND " +
            "(:userId IS NULL OR b.user.id = :userId)")
    Page<Booking> findBookingsWithFiltersPaginated(@Param("status") BookingStatus status,
            @Param("resourceId") String resourceId,
            @Param("userId") String userId,
            Pageable pageable);

    @Query("SELECT b FROM Booking b ORDER BY b.createdAt DESC")
    List<Booking> findAllOrderByCreatedAtDesc();

    @Query("SELECT b.resource.id, b.resource.name, b.resource.type, COUNT(b) as cnt " +
           "FROM Booking b GROUP BY b.resource.id, b.resource.name, b.resource.type " +
           "ORDER BY cnt DESC")
    List<Object[]> findBookingCountPerResource();

    @Query("SELECT b.resource.type, COUNT(b) FROM Booking b GROUP BY b.resource.type")
    List<Object[]> findBookingCountPerType();

    @Query("SELECT HOUR(b.startTime), COUNT(b) FROM Booking b GROUP BY HOUR(b.startTime)")
    List<Object[]> findBookingCountPerHour();

    long countByStatus(BookingStatus status);

    @Query("SELECT b FROM Booking b WHERE b.resource.id = :resourceId AND b.status = 'APPROVED'")
    List<Booking> findApprovedByResourceId(@Param("resourceId") String resourceId);

    @Query("SELECT b FROM Booking b WHERE b.resource.id = :resourceId " +
           "AND b.bookingDate = :date " +
           "AND b.status IN ('PENDING', 'APPROVED') " +
           "ORDER BY b.startTime ASC")
    List<Booking> findBookingsForResourceOnDate(@Param("resourceId") String resourceId,
                                                @Param("date") LocalDate date);
}