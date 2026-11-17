# MediFlow - Complete Testing Guide

## ✅ System Readiness Checklist

Before testing, ensure both backend and frontend are running:

### Backend
```bash
cd mediflow-backend
php artisan serve --port=8001
```
✅ Backend running on: `http://127.0.0.1:8001`

### Frontend  
```bash
cd mediflow-frontend
npm start
```
✅ Frontend running on: `http://localhost:3000`

---

## 🧪 Test Scenarios

### Test 1: Patient Registration & Login

**Steps:**
1. Go to http://localhost:3000
2. Click "Register here"
3. Fill form:
   - Role: Patient
   - Name: Test Patient
   - Email: testpatient@example.com
   - Phone: 9876543210
   - Password: password123
   - Confirm: password123
4. Click Register
5. Should redirect to doctor list page

**Expected Result:** ✅ New patient account created and logged in

---

### Test 2: Doctor Registration & Login

**Steps:**
1. Go to http://localhost:3000/register
2. Fill form:
   - Role: Doctor
   - Name: Test Doctor
   - Email: testdoctor@example.com
   - Phone: 9876543210
   - Password: password123
3. Click Register
4. Should redirect to doctor dashboard

**Expected Result:** ✅ New doctor account created and logged in

---

### Test 3: Patient - Browse Doctors

**Prerequisite:** Logged in as patient

**Steps:**
1. You should see "Find a Doctor" page with doctor cards
2. Each card shows: Name, Email, Specialization
3. All cards have "Book Appointment" button

**Expected Result:** ✅ Doctor list displays correctly with booking buttons

---

### Test 4: Patient - Book Appointment

**Prerequisite:** Logged in as patient, on doctor list page

**Steps:**
1. Click any "Book Appointment" button
2. You should see booking form with:
   - Doctor name (e.g., "Book Appointment with Dr. Test Doctor")
   - Date & Time input field
   - Reason textarea
3. Fill form:
   - Date: May 20, 2026 at 10:00 AM
   - Reason: General checkup
4. Click "Confirm Booking"
5. Should see success message
6. Should redirect back to doctor list

**Expected Result:** ✅ Appointment booked successfully

---

### Test 5: Patient - View My Appointments

**Prerequisite:** Logged in as patient, appointment booked

**Steps:**
1. Click navigation: "My Appointments"
2. You should see booked appointment card with:
   - Doctor name
   - Appointment date/time
   - Reason
   - Status badge (pending/confirmed)
   - Cancel button

**Expected Result:** ✅ Appointment appears in list with correct details

---

### Test 6: Patient - Cancel Appointment

**Prerequisite:** Logged in as patient, viewing appointments

**Steps:**
1. Click "Cancel Appointment" button
2. Confirm cancellation in popup
3. Appointment should disappear from list

**Expected Result:** ✅ Appointment cancelled and removed from list

---

### Test 7: Doctor - View Appointments

**Prerequisite:** Logged in as doctor

**Steps:**
1. Click navigation: "Dashboard"
2. Should see table of patient appointments with:
   - Patient name
   - Appointment date/time
   - Reason
   - Current status
   - Update status button

**Expected Result:** ✅ Doctor dashboard shows all appointments

---

### Test 8: Doctor - Update Appointment Status

**Prerequisite:** Logged in as doctor, appointments visible

**Steps:**
1. On doctor dashboard, find appointment with "pending" status
2. Click "Update Status" button
3. Should show confirmation
4. Status should change to "confirmed"

**Expected Result:** ✅ Status updated and reflected in dashboard

---

### Test 9: Doctor - Create Prescription

**Prerequisite:** Logged in as doctor

**Steps:**
1. Click navigation: "Prescriptions" → Create
2. Fill prescription form:
   - Select Patient (dropdown)
   - Medication: Paracetamol
   - Dosage: 500mg
   - Frequency: Twice daily
   - Duration: 7 days
   - Instructions: Take with food
3. Click "Create Prescription"

**Expected Result:** ✅ Prescription created, success message shown

---

### Test 10: Doctor - View Created Prescriptions

**Prerequisite:** Logged in as doctor, prescription created

**Steps:**
1. Click navigation: "Prescriptions"
2. Should see list of all prescriptions you created
3. Each shows: Patient, Medication, Dosage, Frequency, Duration

**Expected Result:** ✅ All created prescriptions listed

---

### Test 11: Patient - View Prescriptions

**Prerequisite:** Logged in as patient, doctor created prescription for you

**Steps:**
1. Click navigation: "Prescriptions"
2. Should see prescription card with:
   - Medication name
   - Doctor name
   - Dosage, Frequency, Duration
   - Date prescribed
3. Click prescription to see full details in modal

**Expected Result:** ✅ Prescription details displayed correctly

---

### Test 12: Admin - Access Admin Dashboard

**Prerequisites:** Admin account exists (admin@example.com)

**Steps:**
1. Login with admin credentials: admin@example.com / password
2. Click navigation: "Admin Dashboard"
3. Should see:
   - Statistics cards (Total Users, Doctors, Patients, Appointments)
   - User management table showing all users

**Expected Result:** ✅ Admin dashboard loads with correct statistics

---

### Test 13: Admin - Manage Users

**Prerequisite:** Logged in as admin, admin dashboard visible

**Steps:**
1. Find non-admin user in table
2. Click "Delete" button
3. Confirm deletion
4. User should disappear from table

**Expected Result:** ✅ User deleted successfully

---

### Test 14: Navigation Between Roles

**Steps:**
1. Logout (click logout button in navigation)
2. Login as patient
3. Verify navigation shows patient-specific options
4. Logout and login as doctor
5. Verify navigation shows doctor-specific options
6. Logout and login as admin
7. Verify navigation shows admin option

**Expected Result:** ✅ Navigation changes based on user role

---

### Test 15: Full Patient Flow

**Complete User Journey:**
1. Register as new patient
2. Browse doctors
3. Book appointment with doctor
4. View appointment in "My Appointments"
5. Wait for doctor to confirm (or confirm as doctor in another session)
6. View prescription once doctor creates it
7. Logout

**Expected Result:** ✅ Complete patient journey works seamlessly

---

## 🐛 Debugging Tips

### If Frontend Shows Blank Page
```bash
# Check browser console (F12)
# Look for CORS errors
# Verify .env file: echo $REACT_APP_API_URL
# Restart npm: Ctrl+C then npm start
```

### If API Calls Fail
```bash
# Verify backend is running on 8001
# Check database connection: php artisan tinker
# Test API directly: curl http://127.0.0.1:8001/api/doctors
```

### If Login Fails
```bash
# Check database has users
# Verify password matches (use php artisan tinker)
# Check browser console for JWT errors
```

### Reset Everything
```bash
# Backend
cd mediflow-backend
php artisan migrate:reset
php artisan migrate
php artisan db:seed

# Frontend
cd mediflow-frontend
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
npm start
```

---

## ✅ Passing Criteria

All these tests must pass for system to be considered complete:

- [ ] Patient can register and login
- [ ] Doctor can register and login  
- [ ] Patient can browse and filter doctors
- [ ] Patient can book appointments
- [ ] Patient can view and cancel appointments
- [ ] Doctor can view patient appointments
- [ ] Doctor can update appointment status
- [ ] Doctor can create prescriptions
- [ ] Doctor can view created prescriptions
- [ ] Patient can view prescriptions
- [ ] Admin can access dashboard and manage users
- [ ] Navigation works for all roles
- [ ] Logout works correctly
- [ ] No console errors or CORS issues
- [ ] Complete patient/doctor/admin flows work

---

## 📊 Sample Test Data (if using db:seed)

### Demo Patients
- Email: patient1@example.com / password
- Email: patient2@example.com / password

### Demo Doctors
- Email: doctor1@example.com / password
- Email: doctor2@example.com / password

### Demo Admin
- Email: admin@example.com / password

---

**Testing should take approximately 30-45 minutes for complete coverage.**
