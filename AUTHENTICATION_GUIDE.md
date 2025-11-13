# Authentication System Guide

## Overview
The Institute Management System now has a complete role-based authentication system with three user types:
- **Admin**: Full system access
- **Faculty**: Course management, grades, attendance
- **Student**: View courses, grades, attendance, submit feedback

## Quick Start

### 1. Disable Email Confirmation (For Testing)
To test without email verification:
1. Go to your Supabase Dashboard
2. Navigate to **Authentication → Providers → Email**
3. **Disable "Confirm email"** option
4. Save changes

This allows immediate login after signup without email verification.

### 2. Configure URL Settings
Set these in Supabase under **Authentication → URL Configuration**:

- **Site URL**: Your app URL (e.g., `https://yourapp.lovable.app`)
- **Redirect URLs**: Add both:
  - Your preview URL
  - Your production/custom domain (if applicable)

## User Registration & Login

### Sign Up Process
1. Go to `/login`
2. Click the "Sign Up" tab
3. Fill in:
   - Full Name
   - Email
   - Password (must include uppercase, lowercase, and number)
   - Select Role (admin/faculty/student)
4. Click "Sign Up"
5. If email confirmation is disabled, you can log in immediately

### Login Process
1. Go to `/login`
2. Enter email and password
3. Click "Sign In"
4. You'll be redirected to your role-specific dashboard:
   - Admin → `/admin/dashboard`
   - Faculty → `/faculty/dashboard`
   - Student → `/student/dashboard`

## Password Requirements
Passwords must:
- Be at least 6 characters long
- Contain at least one uppercase letter (A-Z)
- Contain at least one lowercase letter (a-z)
- Contain at least one number (0-9)

Example: `Password123`

## Role-Based Access Control

### Admin Access
Admins can access:
- `/admin/dashboard` - Overview and statistics
- `/admin/students` - Student management
- `/admin/faculty` - Faculty management
- `/admin/courses` - Course management
- `/admin/enrollments` - Enrollment management
- `/admin/announcements` - System announcements
- `/admin/feedback` - Student feedback
- `/admin/reports` - System reports
- `/admin/audit-logs` - Activity logs

### Faculty Access
Faculty can access:
- `/faculty/dashboard` - Personal dashboard
- `/faculty/courses` - Assigned courses
- `/faculty/attendance` - Mark attendance
- `/faculty/grades` - Enter grades
- `/faculty/announcements` - Faculty announcements
- `/faculty/reports` - Course reports

### Student Access
Students can access:
- `/student/dashboard` - Personal dashboard
- `/student/courses` - Enrolled courses
- `/student/attendance` - View attendance
- `/student/grades` - View grades
- `/student/announcements` - View announcements
- `/student/feedback` - Submit feedback

## Linking User Accounts to Student/Faculty Records

After creating a user account with "student" or "faculty" role, you should link them to their respective records:

### For Students:
```sql
UPDATE students 
SET user_id = '[user-auth-id]' 
WHERE email = '[student-email]';
```

### For Faculty:
```sql
UPDATE faculties 
SET user_id = '[user-auth-id]' 
WHERE email = '[faculty-email]';
```

You can find the `user-auth-id` in the Supabase dashboard under Authentication → Users.

## Security Features

### Input Validation
- All forms use Zod schemas for robust validation
- Email format validation
- Password strength requirements
- Unique constraint checks for emails, student IDs, faculty IDs

### Session Management
- Secure session handling with Supabase Auth
- Automatic token refresh
- Protected routes require authentication
- Role-based route protection

### Database Security
- Row Level Security (RLS) enabled on all tables
- Role-based policies using the `has_role()` function
- No client-side role checking
- Server-side validation for all operations

## Common Issues & Solutions

### Issue: "Invalid credentials" error
**Solution**: Check that:
- Email and password are correct
- If using a new account, email confirmation is disabled OR you've verified your email

### Issue: "Account role not assigned"
**Solution**: 
- Check that the user has a role in the `user_roles` table
- Verify the role was created during signup

### Issue: Can't access certain pages
**Solution**:
- Verify you're logged in with the correct role
- Admins can't access faculty/student pages and vice versa

### Issue: Redirect loop or "requested path is invalid"
**Solution**:
- Check Site URL and Redirect URLs in Supabase Authentication settings
- Ensure they match your actual domain

## Testing the System

### Create Test Accounts
1. **Admin Account**:
   - Email: `admin@test.com`
   - Password: `Admin123`
   - Role: Admin

2. **Faculty Account**:
   - Email: `faculty@test.com`
   - Password: `Faculty123`
   - Role: Faculty

3. **Student Account**:
   - Email: `student@test.com`
   - Password: `Student123`
   - Role: Student

### Test Role-Based Access
1. Log in as admin → Access admin pages
2. Try to access `/faculty/dashboard` → Should redirect
3. Log out
4. Log in as faculty → Access faculty pages
5. Try to access `/admin/dashboard` → Should redirect

## Next Steps

After testing authentication:
1. **Add real data**: Create actual student/faculty records
2. **Link accounts**: Connect user accounts to student/faculty records
3. **Test workflows**: Try enrollment, attendance, grades features
4. **Add analytics**: Implement dashboard statistics
5. **Enable PDF reports**: Add export functionality

## Support Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- Project Settings: `/profile` (when logged in)
