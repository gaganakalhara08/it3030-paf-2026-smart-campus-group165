package com.smartcampus.paf.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DatabaseMigration {

    private static final String MIGRATION_NAME = "booking-resource-integration-v2";

    private final JdbcTemplate jdbcTemplate;

    @Value("${smartcampus.db-migration.enabled:false}")
    private boolean migrationEnabled;

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void migrateDatabase() {
        if (!migrationEnabled) {
            log.info("Database migration is disabled (smartcampus.db-migration.enabled=false). Skipping.");
            return;
        }

        log.info("Starting database migration for booking-resource integration...");

        try {
            ensureMigrationsTable();

            if (isApplied()) {
                log.info("Migration {} already applied. Skipping.", MIGRATION_NAME);
                return;
            }

            // IMPORTANT: Never delete bookings here. This migration is schema-only.
            log.info("Step 1: Dropping duplicate foreign keys on bookings.resource_id (if any)...");
            dropDuplicateResourceForeignKeys();

            log.info("Step 2: Removing legacy resource-related columns from bookings table (if present)...");
            dropColumnIfExists("bookings", "capacity");
            dropColumnIfExists("bookings", "resource_name");
            dropColumnIfExists("bookings", "resource_type");
            dropColumnIfExists("bookings", "resource_location");

            log.info("Step 3: Ensuring foreign key constraint fk_booking_resource exists...");
            ensureFkBookingResource();

            log.info("Step 4: Verifying foreign key constraint...");
            verifyFkBookingResource();

            markApplied();
            log.info("Database migration completed successfully!");
        } catch (Exception e) {
            log.error("Error during database migration: {}", e.getMessage(), e);
            log.warn("Database migration encountered an error, but application will continue");
        }
    }

    private void ensureMigrationsTable() {
        jdbcTemplate.execute(
                "CREATE TABLE IF NOT EXISTS app_migrations (" +
                        "name VARCHAR(128) NOT NULL PRIMARY KEY, " +
                        "applied_at DATETIME(6) NOT NULL" +
                        ")"
        );
    }

    private boolean isApplied() {
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM app_migrations WHERE name = ?",
                Integer.class,
                MIGRATION_NAME
        );
        return count != null && count > 0;
    }

    private void markApplied() {
        jdbcTemplate.update(
                "INSERT INTO app_migrations (name, applied_at) VALUES (?, NOW(6))",
                MIGRATION_NAME
        );
    }

    private void dropDuplicateResourceForeignKeys() {
        List<String> fkNames = jdbcTemplate.queryForList(
                "SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE " +
                        "WHERE TABLE_SCHEMA = DATABASE() " +
                        "AND TABLE_NAME = 'bookings' " +
                        "AND COLUMN_NAME = 'resource_id' " +
                        "AND REFERENCED_TABLE_NAME = 'resources' " +
                        "AND CONSTRAINT_NAME IS NOT NULL",
                String.class
        );

        for (String fkName : fkNames) {
            if (fkName == null) continue;
            if ("fk_booking_resource".equalsIgnoreCase(fkName)) continue;

            if (!fkName.matches("[A-Za-z0-9_]+")) {
                log.warn("Skipping drop of unexpected foreign key name: {}", fkName);
                continue;
            }

            try {
                jdbcTemplate.execute("ALTER TABLE bookings DROP FOREIGN KEY `" + fkName + "`");
                log.info("Dropped foreign key constraint {}", fkName);
            } catch (Exception e) {
                log.info("Could not drop foreign key {}: {}", fkName, e.getMessage());
            }
        }
    }

    private void dropColumnIfExists(String table, String column) {
        try {
            jdbcTemplate.execute("ALTER TABLE " + table + " DROP COLUMN " + column);
            log.info("Dropped {}.{}", table, column);
        } catch (Exception e) {
            log.info("Column {}.{} doesn't exist (or cannot be dropped): {}", table, column, e.getMessage());
        }
    }

    private void ensureFkBookingResource() {
        Integer fkExists = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE " +
                        "WHERE TABLE_SCHEMA = DATABASE() " +
                        "AND TABLE_NAME = 'bookings' " +
                        "AND CONSTRAINT_NAME = 'fk_booking_resource'",
                Integer.class
        );

        if (fkExists != null && fkExists > 0) {
            log.info("Foreign key constraint fk_booking_resource already exists. Skipping add.");
            return;
        }

        try {
            jdbcTemplate.execute(
                    "ALTER TABLE bookings ADD CONSTRAINT fk_booking_resource " +
                            "FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE RESTRICT"
            );
            log.info("Successfully added foreign key constraint fk_booking_resource");
        } catch (Exception e) {
            log.warn("Could not add foreign key constraint fk_booking_resource: {}", e.getMessage());
        }
    }

    private void verifyFkBookingResource() {
        try {
            Integer constraintCount = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE " +
                            "WHERE TABLE_SCHEMA = DATABASE() " +
                            "AND TABLE_NAME = 'bookings' " +
                            "AND CONSTRAINT_NAME = 'fk_booking_resource'",
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
    }
}

