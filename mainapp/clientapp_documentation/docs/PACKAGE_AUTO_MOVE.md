# Package Auto-Move System

## Overview

The Package Auto-Move system automatically moves packages from `processing` status to `shipped` status after they have been in processing for **112 hours** (approximately 4.67 days).

This ensures packages don't remain in the intake system indefinitely and are automatically moved to shipment history for tracking.

## How It Works

### 1. Package Processing
- When a package is marked as "Process" in the Package Intake page, its status changes to `processing`
- A `processed_at` timestamp is recorded in the database
- The package remains visible in the Package Intake until it's automatically moved

### 2. Automatic Movement
- A background service checks for packages that have been in `processing` status for more than 112 hours
- These packages are automatically moved to `shipped` status
- A `shipped_at` timestamp is recorded
- The packages are then available in Shipment History instead of Package Intake

## Database Schema Changes

### New Fields Added

```sql
-- Timestamp when package was moved to processing status
ALTER TABLE packages ADD COLUMN processed_at TIMESTAMP WITH TIME ZONE;

-- Timestamp when package was moved to shipped status  
ALTER TABLE packages ADD COLUMN shipped_at TIMESTAMP WITH TIME ZONE;
```

### Indexes Created

```sql
-- For efficient querying of packages ready to move
CREATE INDEX idx_packages_processed_at ON packages (processed_at) 
WHERE status = 'processing' AND processed_at IS NOT NULL;

-- For efficient querying of shipped packages
CREATE INDEX idx_packages_shipped_at ON packages (shipped_at) 
WHERE status = 'shipped' AND shipped_at IS NOT NULL;
```

## Running the Auto-Move Service

### Manual Execution

```bash
# Run the auto-move process once
npm run package:auto-move

# Check status of packages currently in processing
npm run package:status
```

### Automated Execution (Cron Job)

1. **Make the cron script executable:**
   ```bash
   chmod +x scripts/package-auto-move-cron.js
   ```

2. **Add to crontab to run every hour:**
   ```bash
   crontab -e
   # Add this line:
   0 * * * * /path/to/mainapp/scripts/package-auto-move-cron.js
   ```

3. **Or run every 6 hours:**
   ```bash
   # Add this line to crontab:
   0 */6 * * * /path/to/mainapp/scripts/package-auto-move-cron.js
   ```

### Logs

The cron job creates logs in `logs/package-auto-move.log` for monitoring and debugging.

## Service Architecture

### Files Created

- `src/services/packageAutoMoveService.ts` - Core service logic
- `src/utils/runPackageAutoMove.ts` - Utility runner and CLI interface  
- `scripts/package-auto-move-cron.js` - Cron job wrapper
- `sql/56_add_processed_at_field.sql` - Database migration for processed_at
- `sql/57_add_shipped_at_field.sql` - Database migration for shipped_at

### Key Classes

#### `PackageAutoMoveService`

- `moveExpiredPackages()` - Main function to move expired packages
- `getProcessingPackagesStatus()` - Get status of packages in processing
- `movePackageToShipped()` - Manually move a specific package

## Configuration

### Timeout Setting

The 112-hour timeout is configured in `PackageAutoMoveService`:

```typescript
private static readonly PROCESSING_TIMEOUT_MS = 112 * 60 * 60 * 1000;
```

To change the timeout, modify this constant and redeploy.

## Monitoring

### Check Processing Status

```bash
npm run package:status
```

This will show:
- Packages currently in processing
- How long each has been processing
- When each will expire and be moved
- Hours remaining for each package

### Example Output

```
[AutoMove] Found 3 packages in processing:
  - PKG250001: 45.2h processed, 66.8h remaining (expires: 2025-10-07T10:30:00.000Z)
  - PKG250002: 89.1h processed, 22.9h remaining (expires: 2025-10-05T15:45:00.000Z)  
  - PKG250003: 115.3h processed, -3.3h remaining (expires: 2025-10-03T08:15:00.000Z)
```

## Error Handling

The service includes comprehensive error handling:

- Individual package failures don't stop the entire process
- All errors are logged with package details
- Service continues processing remaining packages even if some fail
- Return object includes success status and error details

## Integration with Package Intake

### UI Changes Made

1. **Removed all filters** - No more status tabs, sort dropdowns, or selection controls
2. **Simplified interface** - Shows all packages with just "Process" and "Edit" buttons
3. **Single action focus** - Package intake is now focused solely on accepting packages

### Process Flow

1. **Package Intake** → User clicks "Process" → Status becomes `processing` + `processed_at` timestamp set
2. **Auto-Move Service** → Runs periodically → Moves packages after 112 hours → Status becomes `shipped` + `shipped_at` timestamp set  
3. **Shipment History** → Packages now appear here instead of Package Intake

## Testing

### Manual Testing

1. **Create a test package:**
   ```sql
   -- Run sql/55_create_test_package.sql
   ```

2. **Process the package:**
   - Go to Package Intake
   - Click "Process" on the test package
   - Verify `processed_at` is set in database

3. **Test auto-move (for testing, temporarily reduce timeout):**
   ```typescript
   // In packageAutoMoveService.ts, temporarily change:
   private static readonly PROCESSING_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
   ```

4. **Run auto-move:**
   ```bash
   npm run package:auto-move
   ```

5. **Verify package moved:**
   - Check database: status should be `shipped`
   - Check Package Intake: package should no longer appear
   - Check Shipment History: package should appear there

### Production Testing

Use the monitoring commands to verify the system is working:

```bash
# Check what packages are currently processing
npm run package:status

# Run the auto-move process manually
npm run package:auto-move
```

## Troubleshooting

### Common Issues

1. **Packages not moving automatically:**
   - Check if cron job is running: `crontab -l`
   - Check logs: `tail -f logs/package-auto-move.log`
   - Run manually: `npm run package:auto-move`

2. **Database permission errors:**
   - Ensure RLS policies allow package updates
   - Check if `processed_at` and `shipped_at` columns exist

3. **Service errors:**
   - Check Supabase connection
   - Verify database schema is up to date
   - Check service logs for specific error messages

### Debug Commands

```bash
# Check processing packages status
npm run package:status

# Run auto-move with verbose logging
npm run package:auto-move

# Check database directly
psql -c "SELECT id, package_id, status, processed_at, shipped_at FROM packages WHERE status IN ('processing', 'shipped') ORDER BY processed_at DESC LIMIT 10;"
```

## Security Considerations

- The auto-move service uses the same Supabase RLS policies as the main application
- Only packages that have been properly processed through the UI will have `processed_at` timestamps
- The service only moves packages from `processing` to `shipped` - no other status changes
- All operations are logged for audit purposes
