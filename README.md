# 🚀 JobNest - Job Portal

## ✅ Auto Login Credentials (Sab Automatic Ban Jaata Hai!)

| Role | Email | Password |
|------|-------|----------|
| 👑 Admin | admin@jobnest.com | xxxxxxxxxx |
| 🏢 Employer | employer@demo.com | xxxxxxxxxx |
| 👤 Job Seeker | seeker@demo.com | xxxxxxxxxxx |

> Backend deploy hote hi sab automatically ban jaata hai!

---

## 📁 Project Structure

```
job-portal/
├── backend/     → Render par deploy karo
├── frontend/    → Vercel par deploy karo
└── README.md
```

---

## 🌐 Deploy Karne Ka Tarika

### STEP 1 - Backend Render Par Deploy Karo

1. **https://render.com** par jao → GitHub se login
2. **New → Web Service** → backend repo select karo
3. Settings:
   ```
   Build Command: npm install
   Start Command: node server.js
   ```
4. Environment Variables:
   ```
   MONGO_URI   = mongodb+srv://...tera atlas url...
   JWT_SECRET  = JobPortalSecret2024!
   JWT_EXPIRE  = 7d
   NODE_ENV    = production
   ```
5. Deploy karo → **URL save karo!**
   ```
   Example: https://job-portal-backend-xxxx.onrender.com
   ```


---

### STEP 2 - Frontend Vercel Par Deploy Karo

1. **frontend/src/context/AuthContext.js** mein yeh line update karo:
   ```javascript
   // Apna Render URL daalo yahan:
   const API_BASE = process.env.REACT_APP_API_URL || 'https://TERA-RENDER-URL.onrender.com/api';
   ```

2. GitHub par push karo

3. **https://vercel.com** par jao → GitHub se login
4. **New Project** → frontend repo import karo
5. Environment Variables add karo:
   ```
   REACT_APP_API_URL = https://TERA-RENDER-URL.onrender.com/api
   ```
6. Deploy karo!

---

### STEP 3 - Login Karo!

```
https://tera-vercel-url.vercel.app/login

Email:    admin@jobnest.com
Password: xxxxxxxxxx
```

---

## 💻 Local Mein Chalana

```bash
# Terminal 1 - Backend
cd backend
npm install
npm start

# Terminal 2 - Frontend  
cd frontend
npm install
npm start
```

```
http://localhost:3000/login
admin@jobnest.com / password123
```
