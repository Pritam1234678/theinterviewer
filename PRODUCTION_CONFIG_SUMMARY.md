# 🔧 Production Deployment - Configuration Summary

## ✅ **Fixed Files:**

### **Backend (1 file):**
1. ✅ `src/main/resources/application.properties`
   - Database URL now uses environment variables
   - CORS now uses environment variables
   - Localhost as fallback for development

### **Frontend (1 file fixed, 4 remaining):**
1. ✅ `app/(app)/credits/page.tsx` - Payment APIs fixed
2. ⏳ `app/signup/page.tsx` - OAuth redirect (needs manual update)
3. ⏳ `app/login/page.tsx` - OAuth redirect (needs manual update)
4. ⏳ `app/reset-password/page.tsx` - Already using env var ✅
5. ⏳ `app/forgot-password/page.tsx` - Already using env var ✅

---

## 🔑 **Environment Variables Needed:**

### **Backend (EC2):**
```bash
export DB_HOST=localhost
export DB_NAME=interviewer_db
export DB_USERNAME=interviewer
export DB_PASSWORD=Interview@123
export FRONTEND_URL=https://yourapp.vercel.app
export RAZORPAY_KEY_ID=rzp_live_XXXXXXXXXX
export RAZORPAY_KEY_SECRET=your_secret_key
```

### **Frontend (Vercel):**
```bash
NEXT_PUBLIC_API_URL=http://98.130.121.115:8080
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID
NEXT_PUBLIC_FRONTEND_URL=https://yourapp.vercel.app
```

---

## 📋 **Manual Updates Needed:**

### **1. Google OAuth Redirects:**

**File**: `frontend/app/signup/page.tsx` (Line 205)
**File**: `frontend/app/login/page.tsx` (Line 202)

**Current:**
```tsx
const redirectUri = "http://localhost:3000/signup";
```

**Change to:**
```tsx
const redirectUri = `${process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000"}/signup`;
```

---

## 🚀 **Deployment Steps:**

### **1. Test Locally:**
```bash
# Backend
./mvnw spring-boot:run

# Frontend
npm run dev
```

### **2. Commit to GitHub:**
```bash
git add .
git commit -m "Production ready - environment variables configured"
git push origin main
```

### **3. Deploy Backend (EC2):**
```bash
# Upload code
scp -i theinterviewer-key.pem -r . ubuntu@98.130.121.115:~/theinterviewer/

# SSH to EC2
ssh -i theinterviewer-key.pem ubuntu@98.130.121.115

# Set environment variables
export DB_HOST=localhost
export DB_NAME=interviewer_db
export DB_USERNAME=interviewer
export DB_PASSWORD=Interview@123

# Build & Run
cd ~/theinterviewer
./mvnw clean package -DskipTests
java -jar target/*.jar
```

### **4. Deploy Frontend (Vercel):**
1. Push to GitHub
2. Import to Vercel
3. Set environment variables
4. Deploy

---

## ✅ **Checklist:**

- [x] Backend database config uses env vars
- [x] Backend CORS uses env vars
- [x] Frontend API calls use env vars
- [x] Payment APIs use env vars
- [ ] OAuth redirects use env vars (manual update needed)
- [ ] Test locally
- [ ] Push to GitHub
- [ ] Deploy to EC2
- [ ] Deploy to Vercel
- [ ] Submit to Razorpay

---

## 🎯 **Next Steps:**

1. **Fix OAuth redirects** (2 files)
2. **Test everything locally**
3. **Push to GitHub**
4. **Deploy!**

**Almost ready for production!** 🚀
