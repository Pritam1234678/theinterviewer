# 🎯 The Interviewer - AI-Powered Interview Platform

AI-driven mock interview platform with real-time feedback and comprehensive analytics.

## 🚀 Features

- ✅ AI-powered interview questions
- ✅ Real-time answer evaluation
- ✅ Comprehensive performance analytics
- ✅ Credit-based payment system (Razorpay)
- ✅ Resume analysis
- ✅ Interview history tracking

## 🛠️ Tech Stack

**Backend:**
- Java 21
- Spring Boot 3.5.9
- MySQL 8.0
- Groq AI API

**Frontend:**
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS

## 📋 Prerequisites

- Java 21
- Node.js 18+
- MySQL 8.0
- Maven 3.6+

## ⚙️ Setup Instructions

### 1. Clone Repository

```bash
git clone https://github.com/Pritam1234678/theinterviewer.git
cd theinterviewer
```

### 2. Backend Setup

**Create `application.properties`:**
```bash
cp src/main/resources/application.properties.template src/main/resources/application.properties
```

**Update with your credentials:**
```properties
# Database
DB_HOST=localhost
DB_NAME=theinterviewer
DB_USERNAME=root
DB_PASSWORD=your_password

# Groq AI API
GROQ_API_KEY=your_groq_api_keys

# Razorpay
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_secret

# Email
EMAIL_USERNAME=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

**Run Backend:**
```bash
./mvnw spring-boot:run
```

### 3. Frontend Setup

**Create `.env.local`:**
```bash
cd frontend
cp .env.example .env.local
```

**Update:**
```bash
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key
```

**Run Frontend:**
```bash
npm install
npm run dev
```

## 🌐 Deployment

See [AWS_DEPLOYMENT_GUIDE.md](AWS_DEPLOYMENT_GUIDE.md) for production deployment instructions.

## 🔐 Security

- Never commit `application.properties` with real credentials
- Use environment variables in production
- Keep `.pem` files secure
- Rotate API keys regularly

## 📄 License

MIT License

## 👤 Author

Pritam - [GitHub](https://github.com/Pritam1234678)

---

**⚠️ Important:** Copy `application.properties.template` to `application.properties` and add your credentials before running!
