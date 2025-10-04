# Resume Management Guide

## Option 1: Admin Interface (Recommended)

1. **Access Admin Dashboard**: Visit `https://portfolio.hugovalverde.com/admin`
2. **Click "Manage Resumes"** button
3. **Upload New Resume**: 
   - Click "Select PDF File" and choose your resume
   - Enter a display name (e.g., "Hugo Valverde Resume 2025")
   - Click "Upload Resume"
4. **Set Active Resume**: Click the checkmark (✓) next to any resume to make it active
5. **Delete Resume**: Click the trash icon (🗑️) to delete a resume

## Option 2: Direct API Commands

### List All Resumes
```bash
curl -s http://localhost:3017/api/admin/resumes | jq .
```

### Get Current Active Resume
```bash
curl -s http://localhost:3017/api/resume | jq .
```

### Set Resume as Active
```bash
# Replace RESUME_ID with the actual ID from the list above
curl -X PUT http://localhost:3017/api/admin/resumes/RESUME_ID \
  -H "Content-Type: application/json" \
  -d '{"isActive": true}'
```

### Delete a Resume
```bash
# Replace RESUME_ID with the actual ID
curl -X DELETE http://localhost:3017/api/admin/resumes/RESUME_ID
```

### Upload New Resume (via API)
```bash
# First upload the file
curl -X POST http://localhost:3017/api/admin/upload \
  -F "file=@/path/to/your/resume.pdf" \
  -F "displayName=Hugo Valverde Resume 2025"

# Then create the resume record
curl -X POST http://localhost:3017/api/admin/resumes \
  -H "Content-Type: application/json" \
  -d '{
    "filename": "Hugo_Valverde_Resume_2025.pdf",
    "displayName": "Hugo Valverde Resume 2025",
    "fileSize": 130589
  }'
```

## Option 3: Database Direct Access

### Connect to Database
```bash
# Connect to production database
psql -h localhost -p 5437 -U portfolio -d portfolio
```

### SQL Commands
```sql
-- List all resumes
SELECT * FROM resumes ORDER BY uploaded_at DESC;

-- Set a resume as active (deactivates others)
UPDATE resumes SET is_active = false;
UPDATE resumes SET is_active = true WHERE id = 'RESUME_ID';

-- Delete a resume
DELETE FROM resumes WHERE id = 'RESUME_ID';

-- Add a new resume
INSERT INTO resumes (filename, display_name, is_active, file_size) 
VALUES ('New_Resume.pdf', 'New Resume', false, 150000);
```

## File Management

### Resume Files Location
- **Physical files**: `public/resumes/`
- **Database records**: `resumes` table

### Adding Resume Files Manually
1. Copy your PDF to `public/resumes/`
2. Use the admin interface or API to create the database record
3. Set as active if needed

## Important Notes

- **Only one resume can be active at a time**
- **File names must be unique**
- **Only PDF files are supported**
- **The active resume is what users download from the navigation button**
- **Changes take effect immediately on the live site**

## Quick Commands for Common Tasks

### Switch to a Different Resume
```bash
# 1. List resumes to get the ID
curl -s http://localhost:3017/api/admin/resumes | jq '.resumes[] | {id, displayName, isActive}'

# 2. Set the desired resume as active (replace RESUME_ID)
curl -X PUT http://localhost:3017/api/admin/resumes/RESUME_ID \
  -H "Content-Type: application/json" \
  -d '{"isActive": true}'
```

### Check Current Status
```bash
# See which resume is currently active
curl -s http://localhost:3017/api/resume | jq '.displayName'
```

