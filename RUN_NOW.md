# 🚀 RUN THE PROJECT NOW

**Your complete MediFlow system is ready to run!**

---

## ⚡ Quick Start (Copy & Paste Commands)

### **STEP 1: Open Terminal 1 - Backend Server**

Copy and paste this command:

```bash
cd /Users/migara/Desktop/codings/submission\ /mediflow-project/mediflow-backend && php artisan serve --port=8001
```

**Expected output:**
```
Laravel development server started: http://127.0.0.1:8001
```

✅ **If you see this, backend is running!**

---

### **STEP 2: Open Terminal 2 - Frontend Server**

Open a NEW terminal window and copy-paste this:

```bash
cd /Users/migara/Desktop/codings/submission\ /mediflow-project/mediflow-frontend && npm start
```

**Expected output:**
```
Compiled successfully!
[Browser opens automatically at http://localhost:3000]
```

✅ **If browser opens, frontend is running!**

---

## ✅ Test Immediately

**Wait for both servers to start, then:**

1. Go to **http://localhost:3000** (should already be open)
2. Login with:
   - **Email:** doctor1@example.com
   - **Password:** password
3. You should see the Doctor Dashboard ✅

---

## 🔄 Quick Test Flow

**Test as Doctor (1 min):**
1. Login: doctor1@example.com / password
2. Click "Dashboard" in navigation
3. See appointments listed
4. Logout

**Test as Patient (2 min):**
1. Login: patient1@example.com / password
2. Click "Find Doctor"
3. See doctor cards
4. Click "Book Appointment"
5. Fill date, time, reason
6. Submit
7. Go to "My Appointments"
8. See your booked appointment ✅

**Total Test Time: 3 minutes**

---

## ⚠️ If Something Goes Wrong

### **Issue: "Command not found: php"**
- **Solution:** PHP is not installed. Install it first:
  ```bash
  # On Mac
  brew install php
  
  # On Windows (use WSL or XAMPP)
  # On Linux
  sudo apt-get install php
  ```

### **Issue: "Cannot find module" in npm**
- **Solution:** Reinstall dependencies:
  ```bash
  cd /Users/migara/Desktop/codings/submission\ /mediflow-project/mediflow-frontend
  rm -rf node_modules package-lock.json
  npm install
  npm start
  ```

### **Issue: Port 8001 already in use**
- **Solution:** Use different port:
  ```bash
  php artisan serve --port=8002
  ```
  Then update frontend .env to use port 8002

### **Issue: Port 3000 already in use**
- **Solution:** React will ask to use 3001:
  ```
  Something is already running on port 3000.
  ? Would you like to run this app on another port instead? (Y/n)
  ```
  Just press Y

### **Issue: Database error**
- **Solution:** Run database setup:
  ```bash
  cd /Users/migara/Desktop/codings/submission\ /mediflow-project/mediflow-backend
  php artisan migrate:fresh --seed
  ```

---

## 📋 Checklist Before Running

- [ ] PHP is installed (`php -v` works)
- [ ] Composer is installed (`composer -v` works)
- [ ] Node.js is installed (`node -v` works)
- [ ] npm is installed (`npm -v` works)
- [ ] MySQL is running (required by Laravel)
- [ ] You have 2 terminal windows open
- [ ] You're in the correct directories

---

## 🎯 Expected Behavior

### **Backend (Terminal 1)**
```
Laravel development server started: http://127.0.0.1:8001
[2026-05-19 12:00:00] local.INFO: Application started
```

### **Frontend (Terminal 2)**
```
Compiled successfully!
You can now view mediflow-frontend in the browser.
http://localhost:3000
```

### **Browser**
- App loads at http://localhost:3000
- Login page appears
- You can login with demo accounts

---

## 🔑 Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Patient | patient1@example.com | password |
| Doctor | doctor1@example.com | password |
| Admin | admin@example.com | password |

---

## 📱 What You'll See

### **Patient Login:**
```
✅ Dashboard
✅ Find Doctor (browse)
✅ My Appointments
✅ My Prescriptions
✅ Logout
```

### **Doctor Login:**
```
✅ Dashboard (appointments)
✅ My Prescriptions
✅ Create Prescription
✅ Logout
```

### **Admin Login:**
```
✅ Admin Dashboard
✅ User Management Table
✅ Statistics
✅ Logout
```

---

## 🚀 Ready to Run?

Just copy the two terminal commands above and paste them into your terminals!

**Everything else is already configured and ready to use.**

---

## 📞 Still Need Help?

Read these files in order:
1. **START_HERE.md** - Overview
2. **QUICK_START.txt** - Quick reference
3. **TESTING_GUIDE.md** - Test scenarios
4. **README.md** - Complete guide

---

## ✨ That's It!

Your MediFlow system will be running in seconds. No additional setup needed!

**Start the servers and enjoy!** 🎉
