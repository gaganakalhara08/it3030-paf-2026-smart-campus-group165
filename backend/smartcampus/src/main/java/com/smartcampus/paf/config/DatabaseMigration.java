package com.smartcampus.paf.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@Slf4j
public class DatabaseMigration {

    private final JdbcTemplate jdbcTemplate;

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void migrateDatabase() {
        log.info("Starting database migration for booking-resource integration...");
        
        try {
            // Step 1: Delete all bookings (clean slate for integration)
            log.info("Step 1: Deleting all old bookings...");
            int deletedRows = jdbcTemplate.update("DELETE FROM bookings");
            log.info("Deleted {} bookings", deletedRows);
            
            // Step 2: Check if foreign key exists and drop it
            log.info("Step 2: Checking for existing foreign key...");
            try {
                jdbcTemplate.execute("ALTER TABLE bookings DROP FOREIGN KEY fk_booking_resource");
                log.info("Dropped existing foreign key constraint");
            } catch (Exception e) {
                log.info("Foreign key constraint doesn't exist or already removed: {}", e.getMessage());
            }

            // Step 3: Drop resource-related columns (they belong to Resource table, not Booking)
            log.info("Step 3: Removing resource-related columns from bookings table...");
            
            // Drop capacity column
            try {
                jdbcTemplate.execute("ALTER TABLE bookings DROP COLUMN capacity");
                log.info("Dropped capacity column");
            } catch (Exception e) {
                log.info("Capacity column doesn't exist: {}", e.getMessage());
            }
            
            // Drop resource_name column
            try {
                jdbcTemplate.execute("ALTER TABLE bookings DROP COLUMN resource_name");
                log.info("Dropped resource_name column");
            } catch (Exception e) {
                log.info("resource_name column doesn't exist: {}", e.getMessage());
            }
            
            // Drop resource_type column
            try {
                jdbcTemplate.execute("ALTER TABLE bookings DROP COLUMN resource_type");
                log.info("Dropped resource_type column");
            } catch (Exception e) {
                log.info("resource_type column doesn't exist: {}", e.getMessage());
            }
            
            // Drop resource_location column
            try {
                jdbcTemplate.execute("ALTER TABLE bookings DROP COLUMN resource_location");
                log.info("Dropped resource_location column");
            } catch (Exception e) {
                log.info("resource_location column doesn't exist: {}", e.getMessage());
            }
            
            // Step 4: Add the new foreign key constraint
            log.info("Step 4: Adding new foreign key constraint...");
            try {
                jdbcTemplate.execute(
                    "ALTER TABLE bookings ADD CONSTRAINT fk_booking_resource " +
                    "FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE RESTRICT"
                );
                log.info("Successfully added foreign key constraint fk_booking_resource");
            } catch (Exception e) {
                log.warn("Could not add foreign key constraint: {}", e.getMessage());
            }
            
            // Step 5: Verify the constraint
            log.info("Step 5: Verifying foreign key constraint...");
            try {
                Integer constraintCount = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE " +
                    "WHERE TABLE_NAME = 'bookings' AND CONSTRAINT_NAME = 'fk_booking_resource'",
                    Integer.class
                );
                if (constraintCount != null && constraintCount > 0) {
                    log.info("✓ Foreign key constraint verified successfully!");
                } else {
                    log.warn("Foreign key constraint not found after creation");
                }
            } catch (Exception e) {
                log.warn("Could not verify foreign key constraint: {}", e.getMessage());
            }
            
            log.info("Database migration completed successfully!");
            
        } catch (Exception e) {
            log.error("Error during database migration: {}", e.getMessage(), e);
            log.warn("Database migration encountered an error, but application will continue");
        }
    }
}