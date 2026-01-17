# AI Interview & Resume Analysis Platform (TheInterviewer)

An AI-powered Interview and Resume Analysis web application built with **Spring Boot (Java 21)** and **Gemini 2.5 Flash** AI.

## 🌟 Features

- **AI Resume Analysis**: Upload resumes (PDF/DOCX) and get detailed ATS scores, strengths, weaknesses, and improvement tips
- **3-Round AI Interview System**:
  - **Round 1**: HR/Personality questions
  - **Round 2**: Technical questions based on your tech stack
  - **Round 3**: Project-based questions from your resume
- **Real-time Answer Evaluation**: Get instant AI feedback and scores (0-10) for each answer
- **Comprehensive Reports**: Detailed final interview reports with strengths, weak areas, and recommendations
- **User Dashboard**: Track your interview history and resume scores
- **Secure Authentication**: JWT-based authentication with BCrypt password hashing

## 🏗️ Architecture

- **Backend**: Spring Boot 3.5.9 (Java 21)
- **Database**: MySQL 8.0
- **AI Engine**: Google Gemini 2.0 Flash (via REST API)
- **HTTP Client**: Spring WebFlux WebClient
- **Security**: JWT authentication, Spring Security
- **File Processing**: Apache PDFBox (PDF), Apache POI (DOCX)
- **API Documentation**: Swagger/OpenAPI
- **Deployment**: Azure-ready (App Service, MySQL, Blob Storage)

## 📊 Project Statistics

- **54 Java Files**
- **8 Database Tables**
- **4 REST Controllers**
- **10 Service Classes**
- **11 DTOs**
- **Complete Test Coverage Ready**

## 🚀 Quick Start

### Prerequisites

- Java 21+
- Maven 3.8+
- MySQL 8.0+ (or Docker)
- Gemini API key (free from https://aistudio.google.com/app/apikey)

### Setup

1. **Clone the repository**
   ```bash
   cd c:\Users\manda_5c4udb0\Desktop\CODES\theinterviewer
   ```

2. **Start MySQL** (using Docker Compose)
   ```bash
   docker compose up -d
   ```

3. **Configure Gemini AI**
   
   Get your API key from https://aistudio.google.com/app/apikey
   
   Update `src/main/resources/application.properties`:
   ```properties
   gemini.api.key=YOUR_GEMINI_API_KEY_HERE
   ```

4. **Build and Run**
   ```bash
   mvn clean install
   mvn spring-boot:run
   ```

5. **Access the Application**
   - API: http://localhost:8080
   - Swagger UI: http://localhost:8080/swagger-ui.html
   - Health Check: http://localhost:8080/actuator/health

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/validate` - Validate JWT token

### Resume
- `POST /api/resumes/upload` - Upload resume (PDF/DOCX)
- `POST /api/resumes/{id}/analyze` - Analyze resume with AI
- `GET /api/resumes/{id}/analysis` - Get analysis report
- `GET /api/resumes` - List user's resumes

### Interview
- `POST /api/interviews/profile` - Create interview profile
- `POST /api/interviews/start` - Start interview session
- `GET /api/interviews/{sessionId}/question` - Get next question
- `POST /api/interviews/{sessionId}/answer` - Submit answer
- `POST /api/interviews/{sessionId}/complete` - Complete interview
- `GET /api/interviews/{sessionId}/report` - Get final report
- `GET /api/interviews` - List user's interviews

### Dashboard
- `GET /api/dashboard` - Get user statistics

## 🗄️ Database Schema

The application uses 8 tables:
1. **users** - User accounts
2. **resumes** - Uploaded resume files
3. **resume_analysis** - AI analysis results
4. **interview_profile** - User interview preferences
5. **interview_sessions** - Interview attempts
6. **interview_questions** - Questions and answers
7. **interview_report** - Final evaluation reports
8. **ai_usage_logs** - AI API usage tracking

## 🔒 Security

- **JWT Authentication**: 24-hour token expiration
- **Password Hashing**: BCrypt with salt
- **File Validation**: Type, size, and content verification
- **CORS**: Configured for frontend integration
- **SQL Injection Protection**: JPA/Hibernate parameterized queries

## 🤖 AI Integration

### Gemini 2.5 Flash Capabilities

- **Resume Analysis**: ATS scoring, strengths/weaknesses, improvement tips
- **Question Generation**: Context-aware questions for each interview round
- **Answer Evaluation**: Detailed feedback with 0-10 scoring
- **Final Reports**: Comprehensive performance assessment

### Configuration

```properties
spring.ai.vertex.ai.gemini.chat.options.model=gemini-2.0-flash-exp
spring.ai.vertex.ai.gemini.chat.options.temperature=0.7
spring.ai.vertex.ai.gemini.chat.options.max-output-tokens=2048
```

## 📁 Project Structure

```
src/main/java/com/example/theinterviewer/
├── config/              # Configuration classes
├── controller/          # REST API controllers
├── dto/                 # Data Transfer Objects
│   ├── auth/
│   ├── dashboard/
│   ├── interview/
│   └── resume/
├── entity/              # JPA entities (8 tables)
├── exception/           # Custom exceptions & handlers
├── repository/          # Spring Data JPA repositories
├── security/            # JWT & Spring Security config
└── service/             # Business logic
    ├── ai/              # AI integration services
    └── storage/         # File handling services
```

## 🧪 Testing

### Manual Testing with cURL

```bash
# Register
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"fullName":"John Doe","email":"john@example.com","password":"Test123!"}'

# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"Test123!"}'

# Upload Resume
curl -X POST http://localhost:8080/api/resumes/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@resume.pdf"
```

### Using Swagger UI

Navigate to http://localhost:8080/swagger-ui.html for interactive API testing.

## 🌐 Deployment to Azure

### Resources Required

- Azure App Service (Java 21)
- Azure Database for MySQL
- Azure Blob Storage (for resume files)
- Vertex AI project (for Gemini API)

### Deployment Steps

```bash
# Build
mvn clean package -DskipTests

# Deploy to Azure App Service
az webapp deploy \
  --resource-group theinterviewer-rg \
  --name theinterviewer-app \
  --src-path target/theinterviewer-0.0.1-SNAPSHOT.jar
```

See [walkthrough.md](walkthrough.md) for detailed deployment instructions.

## 📝 Configuration

Key configuration properties in `application.properties`:

```properties
# Database
spring.datasource.url=jdbc:mysql://localhost:3306/theinterviewer
spring.datasource.username=myuser
spring.datasource.password=secret

# JWT
jwt.secret=your-256-bit-secret-key
jwt.expiration=86400000

# File Upload
spring.servlet.multipart.max-file-size=10MB
file.upload.allowed-extensions=pdf,docx

# AI (Vertex AI)
spring.ai.vertex.ai.gemini.project-id=${VERTEX_AI_PROJECT_ID}
spring.ai.vertex.ai.gemini.location=us-central1
```

## 🛠️ Built With

- [Spring Boot](https://spring.io/projects/spring-boot) - Application framework
- [Spring Security](https://spring.io/projects/spring-security) - Authentication & authorization
- [Spring Data JPA](https://spring.io/projects/spring-data-jpa) - Database access
- [Spring AI](https://spring.io/projects/spring-ai) - AI integration
- [MySQL](https://www.mysql.com/) - Database
- [Gemini AI](https://cloud.google.com/vertex-ai/docs/generative-ai/model-reference/gemini) - AI engine
- [Apache PDFBox](https://pdfbox.apache.org/) - PDF parsing
- [Apache POI](https://poi.apache.org/) - DOCX parsing
- [JJWT](https://github.com/jwtk/jjwt) - JWT implementation
- [Springdoc OpenAPI](https://springdoc.org/) - API documentation
- [Lombok](https://projectlombok.org/) - Boilerplate reduction

## 📖 Documentation

- [Implementation Plan](implementation_plan.md) - Detailed technical design
- [Walkthrough](walkthrough.md) - Complete setup and usage guide
- [API Documentation](http://localhost:8080/swagger-ui.html) - Interactive API docs (when running)

## 🔄 User Flow

```
Login/Register → Dashboard → Choose Action:
  ├── Resume Analysis
  │   └── Upload → AI Analysis → View Report
  └── AI Interview
      └── Setup Profile → Start Interview → 
          Round 1 (HR) → Round 2 (Technical) → 
          Round 3 (Project) → Final Report
```

## 🎯 Future Enhancements

- [ ] Unit and integration tests
- [ ] Redis caching for performance
- [ ] Azure Blob Storage integration
- [ ] Email notifications
- [ ] Interview scheduling
- [ ] Video interview support
- [ ] Multi-language support
- [ ] Advanced analytics dashboard

## 📄 License

This project is created for educational and demonstration purposes.

## 👥 Author

Built with Spring Boot and Gemini AI

---

**Ready to revolutionize your interview preparation! 🚀**
