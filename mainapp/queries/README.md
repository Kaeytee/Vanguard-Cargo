# Vanguard Cargo SQL Queries

This directory contains all SQL queries for managing the package forwarding address system.

## 📁 File Structure

The queries are organized into 7 main files:

### 1. `01_setup_functions.sql` - Core Database Functions
- Creates the essential PostgreSQL functions for address management
- **Functions Created:**
  - `update_master_warehouse_address()` - Updates warehouse address for all customers
  - `assign_next_suite_number()` - Assigns suite number to a customer
  - `get_next_suite_number()` - Gets the next available suite number
- **When to run:** First time setup and after database resets
- **Safe to re-run:** Yes

### 2. `02_master_address_management.sql` - Warehouse Address Management
- Complete warehouse address setup and management
- **Includes:**
  - Set initial warehouse address
  - Update existing warehouse addresses
  - Verify address changes
- **When to run:** Initial setup and when warehouse moves
- **Safe to re-run:** Yes

### 3. `03_customer_address_assignment.sql` - Customer Suite Assignment
- Assign suite numbers to customers  
- **Includes:**
  - Assign addresses to new customers
  - Bulk assignment operations
  - Preview assignments before execution
- **When to run:** When new customers register
- **Safe to re-run:** Yes

### 4. `04_verification_queries.sql` - System Verification
- Check and verify address data integrity
- **Includes:**
  - Data consistency checks
  - Suite number validation
  - Business reporting queries
- **When to run:** After major changes or regularly for monitoring
- **Safe to re-run:** Yes (read-only queries)

### 5. `05_admin_management.sql` - Admin Interface Queries
- Ready-to-use queries for admin app development
- **Includes:**
  - Customer lookup and management
  - Package processing workflows  
  - Business reporting queries
  - Bulk operations for efficiency
- **When to run:** Daily admin operations
- **Safe to re-run:** Yes (mostly read-only queries)

### 6. `06_address_updates.sql` - Address Update Operations
- Comprehensive address modification tools
- **Includes:**
  - Warehouse address updates (all customers)
  - Individual customer address changes
  - Suite number management and swapping
  - Batch updates by criteria
  - Rollback templates for safety
- **When to run:** When warehouse moves or address changes needed
- **Safe to re-run:** Be careful - these modify existing data

### 7. `07_troubleshooting.sql` - System Diagnostics & Fixes
- Complete system health diagnostics and problem resolution
- **Includes:**
  - Automated system health checks
  - Common problem detection and fixes
  - Data consistency repairs
  - Performance diagnostics
  - Emergency reset procedures
- **When to run:** When experiencing issues or for routine maintenance
- **Safe to re-run:** Yes, mostly diagnostic queries with safe auto-fixes

## Quick Start

1. **Initial Setup:** Run queries in order: 01 → 02 → 03 → 04
2. **Ongoing Operations:** Use 05 for daily admin tasks
3. **Address Changes:** Use 06 for warehouse moves or updates
4. **Problem Solving:** Use 07 for diagnostics and fixes

## Important Notes

- All customers share the same warehouse address
- Each customer gets a unique suite number (VC-10001, VC-10002, etc.)
- Changes to warehouse address affect ALL customers immediately
- Frontend automatically picks up database changes

## Address Format

Customers see:
```
John Doe (VC-10001)
123 Warehouse Street
VC-10001
Atlanta, GA 30309
USA
```

## Support

For questions about these queries, refer to the comments in each SQL file.
