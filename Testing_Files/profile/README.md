# Profile Update Load Test - JMeter

This JMeter test plan validates the profile update functionality under load with a complete flow that includes automatic credential reset.

## Test Configuration

### Login Credentials
- **Email**: `cuzegu@fxzig.com`
- **Password**: `Pa$$w0rd!`

### Test Flow (3 Steps per Thread)
1. **Login Request**: Authenticates with fixed credentials and extracts JWT token
2. **Profile Update**: Updates profile with CSV data (name, email, password, image)
3. **Reset Profile**: Restores original credentials for next test run

## CSV Data Structure

The `data.csv` file contains **NEW VALUES** to update the profile with:
- **Full Name**: New name to set
- **Email Address**: New email to set
- **New Password**: New password to set
- **imagePath**: Absolute path to profile image

**Important**: CSV contains the values to **change TO**, not current values.

## Files Structure

```
profile/
├── profile.jmx          # JMeter test plan
├── data.csv             # Test data (10 rows)
├── image/               # Profile images (1.jpeg to 10.jpeg)
└── README.md            # This file
```

## How to Run

### Option 1: GUI Mode (Recommended for Testing)
```bash
cd /Users/macbookpro/Downloads/testing/Food_Delivery_App/profile
jmeter -t profile.jmx
```

### Option 2: Non-GUI Mode (For Load Testing)
```bash
jmeter -n -t profile.jmx -l results.jtl -e -o report
```

### Option 3: Generate HTML Report
```bash
jmeter -n -t profile.jmx -l results.jtl
jmeter -g results.jtl -o html-report
```

## Test Parameters

You can modify these in the Test Plan:
- **HOST**: `localhost` (default)
- **PORT**: `5050` (default)
- **LOGIN_EMAIL**: `cuzegu@fxzig.com` (fixed)
- **LOGIN_PASSWORD**: `Pa$$w0rd!` (fixed)
- **Number of Threads**: `10` (concurrent users)
- **Ramp-up Period**: `5` seconds
- **Loop Count**: `1` iteration per thread

## What Gets Tested

### 1. Login Flow
- **Endpoint**: `POST /api/auth/login`
- **Credentials**: Uses fixed `LOGIN_EMAIL` and `LOGIN_PASSWORD`
- **Token Extraction**: JSON Extractor extracts `$.token`
- **Validation**: Response code must be 200
- **Debug**: Logs extracted token value

### 2. Profile Update
- **Endpoint**: `PUT /api/users/profile`
- **Content-Type**: `multipart/form-data`
- **Authorization**: `Bearer ${AUTH_TOKEN}`
- **Fields**:
  - `name`: From CSV "Full Name" column
  - `email`: From CSV "Email Address" column
  - `password`: From CSV "New Password" column
  - `image`: File upload from CSV "imagePath" column
- **Validation**: Response code must be 200
- **Effect**: User credentials change to CSV values

### 3. Reset Profile
- **Endpoint**: `PUT /api/users/profile`
- **Content-Type**: `multipart/form-data`
- **Authorization**: `Bearer ${AUTH_TOKEN}` (same token)
- **Fields**:
  - `name`: "Test User"
  - `email`: `${LOGIN_EMAIL}` (cuzegu@fxzig.com)
  - `password`: `${LOGIN_PASSWORD}` (Pa$$w0rd!)
- **Validation**: Response code must be 200
- **Effect**: Restores original credentials for next test run

## Viewing Results

The test plan includes three listeners:
1. **Summary Report**: Overall statistics
2. **View Results Tree**: Detailed request/response data
3. **View Results in Table**: Tabular view of all requests

## Expected Behavior

✅ **Success Criteria**:
- All 3 requests per thread complete successfully
- Login returns 200 with valid token
- Token is extracted correctly
- Profile update returns 200
- Profile reset returns 200
- Test can run repeatedly without manual cleanup

❌ **Failure Scenarios**:
- Invalid login credentials
- Token extraction fails
- Profile update fails (401 if token invalid)
- Image upload fails
- Profile reset fails

## Test Results

Recent test run:
- **Total Requests**: 30 (10 threads × 3 requests)
- **Success Rate**: 100% (0 errors)
- **Average Response Time**: ~135ms
- **Throughput**: ~6.3 requests/second

## Troubleshooting

### Issue: Login fails with "Invalid credentials"
- Verify user `cuzegu@fxzig.com` exists in database
- Check password is exactly `Pa$$w0rd!`
- Ensure backend is running on `http://localhost:5050`

### Issue: Token not found
- Check login response includes `token` field
- View "Debug Token" logs in jmeter.log
- Verify JSON path `$.token` is correct

### Issue: Profile update returns 401
- Token extraction failed (check previous step)
- Token expired (increase test speed)
- Authorization header not set correctly

### Issue: Image upload fails
- Confirm image files exist at paths in CSV
- Check file permissions (must be readable)
- Verify paths are absolute, not relative
- Ensure image format is supported (JPEG)

### Issue: Profile reset fails
- Same token is reused (check it's still valid)
- Verify endpoint `/api/users/profile` accepts updates

## How It Works

### Flow Diagram
```
Thread 1: Login → Update (CSV Row 1) → Reset → Done
Thread 2: Login → Update (CSV Row 2) → Reset → Done
Thread 3: Login → Update (CSV Row 3) → Reset → Done
...
Thread 10: Login → Update (CSV Row 10) → Reset → Done
```

### CSV Assignment
- **shareMode.thread**: Each thread gets one unique CSV row
- Thread 1 uses row 1, Thread 2 uses row 2, etc.
- With 10 threads and 10 CSV rows, perfect 1:1 mapping

### State Changes
```
Initial:     cuzegu@fxzig.com / Pa$$w0rd!
After Step 2: admin4821@fooddelivery.com / admin123  (from CSV)
After Step 3: cuzegu@fxzig.com / Pa$$w0rd!  (reset)
```

## Customization

### Change Thread Count
1. Open `profile.jmx` in JMeter GUI
2. Select "Profile Update Thread Group"
3. Modify "Number of Threads (users)"
4. Adjust "Ramp-up period" accordingly
5. Ensure CSV has enough rows (or enable recycle)

### Add More Test Data
1. Edit `data.csv`
2. Add new rows with test data
3. Add corresponding images to `image/` folder
4. Update image paths in CSV
5. Save and re-run test

### Change Login Credentials
1. Open `profile.jmx` in JMeter GUI
2. Select "Test Plan"
3. Edit "LOGIN_EMAIL" and "LOGIN_PASSWORD" variables
4. Also update Step 3 (Reset Profile) to use new values

### Modify Assertions
1. Open test in JMeter GUI
2. Navigate to Response Assertions
3. Add/modify assertion rules as needed
4. Can add response time assertions, content assertions, etc.
