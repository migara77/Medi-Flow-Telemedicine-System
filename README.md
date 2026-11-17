# MediFlow - Telemedicine System

A comprehensive telemedicine platform built with Laravel (backend) and React (frontend) that enables patients to book appointments with doctors, manage prescriptions, and doctors to manage their schedules and issue prescriptions.

**Submission Date:** May 19, 2026  
**Status:** ✅ Complete and Functional

---

## 🎯 Features

### Patient Features
- ✅ User Registration & Login
- ✅ Browse Available Doctors
- ✅ Filter Doctors by Specialization
- ✅ Book Appointments with Doctors
- ✅ View My Appointments
- ✅ Cancel Appointments
- ✅ View Prescriptions from Doctors
- ✅ Download/View Prescription Details

### Doctor Features
- ✅ Doctor Registration & Login
- ✅ View Assigned Appointments
- ✅ Update Appointment Status
- ✅ Create Prescriptions for Patients
- ✅ View All Created Prescriptions
- ✅ Access Doctor Dashboard

### Admin Features
- ✅ Admin Dashboard
- ✅ View All Users (Patients, Doctors, Admins)
- ✅ User Management (Delete Users)
- ✅ System Statistics (Total Users, Doctors, Patients, Appointments)
- ✅ Role-Based Access Control

---

## 🛠️ Tech Stack

### Backend
- **Framework:** Laravel 10
- **Language:** PHP 8.x
- **Database:** MySQL 8.x
- **Authentication:** JWT (tymon/jwt-auth)
- **API:** RESTful API

### Frontend
- **Framework:** React 18
- **Language:** JavaScript (ES6+)
- **Styling:** Tailwind CSS
- **HTTP Client:** Axios
- **Routing:** React Router v6

---

## 📋 Installation & Setup

### Prerequisites
- PHP 8.0 or higher
- Composer
- Node.js 14+ & npm
- MySQL 8.0+

### Backend Setup

```bash
cd mediflow-backend

# Install dependencies
composer install

# Create .env file (copy from .env.example)
cp .env.example .env

# Generate application key
php artisan key:generate

# Configure database in .env
DB_DATABASE=mediflow
DB_USERNAME=root
DB_PASSWORD=

# Run migrations
php artisan migrate

# Seed demo data (optional)
php artisan db:seed

# Start Laravel server on port 8001
php artisan serve --port=8001
```

### Frontend Setup

```bash
cd mediflow-frontend

# Install dependencies
npm install

# Create .env file
echo "REACT_APP_API_URL=http://127.0.0.1:8001/api" > .env

# Start React development server
npm start
```

The frontend will open at `http://localhost:3000`

---

## 🔑 Demo Credentials

### Patient Account
- **Email:** patient1@example.com
- **Password:** password
- **Role:** Patient

### Doctor Account
- **Email:** doctor1@example.com
- **Password:** password
- **Role:** Doctor

### Admin Account
- **Email:** admin@example.com
- **Password:** password
- **Role:** Admin

---

## 📁 Project Structure

```
mediflow-project/
├── mediflow-backend/
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   │   ├── AuthController.php
│   │   │   │   ├── AppointmentController.php
│   │   │   │   ├── PrescriptionController.php
│   │   │   │   └── UserController.php
│   │   │   ├── Middleware/
│   │   │   │   └── Cors.php
│   │   │   └── Kernel.php
│   │   ├── Models/
│   │   │   ├── User.php
│   │   │   ├── Doctor.php
│   │   │   ├── Appointment.php
│   │   │   ├── Prescription.php
│   │   │   └── Specialization.php
│   │   └── Traits/
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   ├── routes/
│   │   └── api.php
│   └── .env
│
├── mediflow-frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Navigation.jsx
│   │   │   ├── DoctorBrowse.jsx
│   │   │   ├── BookAppointment.jsx
│   │   │   ├── PatientAppointments.jsx
│   │   │   ├── MyPrescriptions.jsx
│   │   │   ├── DoctorDashboard.jsx
│   │   │   ├── CreatePrescription.jsx
│   │   │   ├── DoctorPrescriptions.jsx
│   │   │   └── AdminDashboard.jsx
│   │   ├── App.js
│   │   ├── App.css
│   │   └── index.js
│   ├── .env
│   └── package.json
│
└── README.md
```

---

## 🔌 API Endpoints

### Authentication
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/register` | POST | ❌ | Register new user |
| `/api/login` | POST | ❌ | User login |
| `/api/logout` | POST | ✅ | User logout |
| `/api/user` | GET | ✅ | Get current user |

### Doctors
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/doctors` | GET | ❌ | Get all doctors |
| `/api/specializations` | GET | ❌ | Get specializations |
| `/api/doctors/specialization/{id}` | GET | ❌ | Get doctors by specialization |

### Appointments
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/appointments` | POST | ✅ | Book appointment |
| `/api/my-appointments` | GET | ✅ | Patient's appointments |
| `/api/doctor-appointments` | GET | ✅ | Doctor's appointments |
| `/api/appointments/{id}` | DELETE | ✅ | Cancel appointment |
| `/api/appointments/{id}/status` | PUT | ✅ | Update appointment status |

### Prescriptions
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/prescriptions` | POST | ✅ | Create prescription |
| `/api/my-prescriptions` | GET | ✅ | Patient's prescriptions |
| `/api/doctor-prescriptions` | GET | ✅ | Doctor's prescriptions |
| `/api/prescriptions/{id}` | GET | ✅ | View prescription |

### Admin
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/admin/users` | GET | ✅ | Get all users |
| `/api/admin/users/{id}` | DELETE | ✅ | Delete user |
| `/api/statistics` | GET | ✅ | System statistics |

---

## 🔄 User Workflows

### Patient Workflow
1. Register or Login
2. Browse available doctors
3. Filter by specialization (optional)
4. Click "Book Appointment" on a doctor's card
5. Fill appointment date, time, and reason
6. Submit booking
7. View appointments in "My Appointments"
8. Cancel appointment if needed
9. View prescriptions assigned to you

### Doctor Workflow
1. Register or Login as Doctor
2. Access Doctor Dashboard
3. View all assigned appointments
4. Update appointment status (pending → confirmed)
5. Create prescriptions for patients
6. View all created prescriptions

### Admin Workflow
1. Login as Admin
2. Access Admin Dashboard
3. View all users in the system
4. Delete users if needed
5. View system statistics

---

## 🧪 Testing the System

### Manual Testing Checklist

#### 1. Authentication
- [ ] Register new patient account
- [ ] Register new doctor account
- [ ] Login with patient account
- [ ] Login with doctor account
- [ ] Logout functionality works
- [ ] Navigation redirects based on role

#### 2. Patient Features
- [ ] Browse doctors list
- [ ] Filter doctors by specialization
- [ ] Click "Book Appointment" button
- [ ] Fill appointment form (date, time, reason)
- [ ] Submit appointment
- [ ] View booked appointments in "My Appointments"
- [ ] See appointment status (pending/confirmed)
- [ ] Cancel appointment
- [ ] View prescriptions from doctors
- [ ] View prescription details in modal

#### 3. Doctor Features
- [ ] View doctor dashboard with appointments
- [ ] See patient details for each appointment
- [ ] Update appointment status
- [ ] Create prescription for patient
- [ ] View created prescriptions
- [ ] Access prescription details

#### 4. Admin Features
- [ ] Login as admin
- [ ] Access admin dashboard
- [ ] View all users in table
- [ ] See statistics (total users, doctors, patients, appointments)
- [ ] Delete non-admin users
- [ ] Cannot delete own admin account

---

## 🚀 Running the Complete System

### Terminal 1: Start Backend
```bash
cd mediflow-backend
php artisan serve --port=8001
```

### Terminal 2: Start Frontend
```bash
cd mediflow-frontend
npm start
```

The system will be available at:
- **Frontend:** http://localhost:3000
- **Backend API:** http://127.0.0.1:8001/api

---

## 🔒 Security Features

- JWT Token Authentication
- Role-Based Access Control (RBAC)
- CORS Headers Configuration
- Password Hashing (bcrypt)
- Protected API Routes
- Unauthorized Access Prevention

---

## 📝 Database Schema

### Users Table
- id, name, email, password, phone, role, created_at, updated_at

### Doctors Table
- id, user_id, specialization_id, verified, created_at, updated_at

### Appointments Table
- id, doctor_id, patient_id, appointment_date, status, reason, created_at, updated_at

### Prescriptions Table
- id, doctor_id, patient_id, medication_name, dosage, frequency, duration, instructions, notes, created_at, updated_at

### Specializations Table
- id, name, description, created_at, updated_at

---

## ⚠️ Troubleshooting

### Frontend shows blank page
- Ensure `npm start` shows "Compiled successfully"
- Check browser console for errors (F12)
- Verify `.env` file has correct API URL

### API connection errors
- Ensure backend is running on port 8001
- Verify CORS middleware is registered in `app/Http/Kernel.php`
- Check database connection in `.env`

### Login fails
- Verify database has users with correct role
- Check JWT secret in backend `.env`
- Clear localStorage and try again

### Database migration errors
- Drop all tables: `php artisan migrate:reset`
- Run fresh migrations: `php artisan migrate`
- Seed demo data: `php artisan db:seed`

---

## 📞 Support

For issues or questions, please review the API documentation or check the browser console for detailed error messages. contact owner for more information https://github.com/migara77

---

## 📄 License

This project is for educational purposes.

---

**Built with ❤️ for telemedicine**
