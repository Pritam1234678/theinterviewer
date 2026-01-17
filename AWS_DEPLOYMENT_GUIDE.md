# 🚀 Complete AWS Deployment Guide - The Interviewer App

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [AWS Free Tier Setup](#aws-free-tier-setup)
3. [Backend Deployment (Spring Boot)](#backend-deployment)
4. [Database Setup (RDS PostgreSQL)](#database-setup)
5. [Frontend Deployment (Next.js)](#frontend-deployment)
6. [Domain & SSL Setup](#domain-ssl-setup)
7. [Razorpay Live Integration](#razorpay-integration)
8. [Monitoring & Maintenance](#monitoring)

---

## 1. Prerequisites ✅

### What You Need:
- ✅ AWS Account (Free Tier)
- ✅ Credit/Debit Card (for AWS verification - won't be charged)
- ✅ Domain name (optional but recommended)
- ✅ Your application code ready

### Local Setup:
```bash
# Install AWS CLI
# Windows (using Chocolatey)
choco install awscli

# Or download from: https://aws.amazon.com/cli/

# Verify installation
aws --version
```

---

## 2. AWS Free Tier Setup 🎁

### Sign Up for AWS:
1. Go to https://aws.amazon.com/free/
2. Click **"Create a Free Account"**
3. Fill in details:
   - Email
   - Password
   - AWS Account name
4. **Payment Information** (required but won't be charged)
5. **Identity Verification** (phone call)
6. **Select Free Tier Plan**

### What You Get FREE (12 months):
- ✅ **750 hours/month** EC2 t2.micro (enough for 1 instance 24/7)
- ✅ **20 GB** RDS database storage
- ✅ **5 GB** S3 storage
- ✅ **15 GB** data transfer out
- ✅ **1 million** Lambda requests

---

## 3. Backend Deployment (Spring Boot) 🖥️

### Option A: EC2 Instance (Traditional)

#### Step 1: Launch EC2 Instance

1. **Login to AWS Console**: https://console.aws.amazon.com/
2. **Go to EC2** → Click **"Launch Instance"**
3. **Configure Instance**:
   - **Name**: `interviewer-backend`
   - **AMI**: Ubuntu Server 22.04 LTS (Free tier eligible)
   - **Instance Type**: `t2.micro` (Free tier)
   - **Key Pair**: Create new → Download `.pem` file (IMPORTANT!)
   - **Network Settings**:
     - ✅ Allow SSH (port 22)
     - ✅ Allow HTTP (port 80)
     - ✅ Allow HTTPS (port 443)
     - ✅ Allow Custom TCP (port 8080) - for Spring Boot
   - **Storage**: 8 GB (Free tier)
4. **Click "Launch Instance"**

#### Step 2: Connect to EC2

```bash
# Windows (using Git Bash or WSL)
# Change permission of .pem file
chmod 400 your-key.pem

# Connect to EC2
ssh -i "your-key.pem" ubuntu@your-ec2-public-ip
```

#### Step 3: Install Java & Dependencies

```bash
# Update system
sudo apt update
sudo apt upgrade -y

# Install Java 17
sudo apt install openjdk-17-jdk -y

# Verify Java
java -version

# Install Maven
sudo apt install maven -y

# Install Git
sudo apt install git -y

# Install PostgreSQL client (for local DB testing)
sudo apt install postgresql-client -y
```

#### Step 4: Clone & Build Your App

```bash
# Clone your repository
git clone https://github.com/yourusername/theinterviewer.git
cd theinterviewer

# Build the application
./mvnw clean package -DskipTests

# JAR file will be in target/ directory
ls -la target/*.jar
```

#### Step 5: Create Production Configuration

```bash
# Create production properties file
nano src/main/resources/application-prod.properties
```

**Add this content**:
```properties
# Server Configuration
server.port=8080
server.address=0.0.0.0

# Database Configuration (RDS)
spring.datasource.url=jdbc:postgresql://your-rds-endpoint:5432/interviewer_db
spring.datasource.username=your_db_username
spring.datasource.password=your_db_password
spring.jpa.hibernate.ddl-auto=update

# Razorpay Configuration
razorpay.key.id=${RAZORPAY_KEY_ID}
razorpay.key.secret=${RAZORPAY_KEY_SECRET}

# CORS Configuration (Update with your frontend URL)
cors.allowed-origins=https://yourfrontend.com

# Logging
logging.level.root=WARN
logging.level.com.example.theinterviewer=INFO

# JVM Optimization for t2.micro
spring.jpa.properties.hibernate.jdbc.batch_size=20
spring.datasource.hikari.maximum-pool-size=10
```

#### Step 6: Set Environment Variables

```bash
# Create .env file
nano ~/.env
```

**Add**:
```bash
export RAZORPAY_KEY_ID=rzp_live_XXXXXXXXXX
export RAZORPAY_KEY_SECRET=your_secret_key
export DB_PASSWORD=your_db_password
```

**Load environment variables**:
```bash
source ~/.env

# Add to .bashrc for persistence
echo "source ~/.env" >> ~/.bashrc
```

#### Step 7: Run Application as Service

**Create systemd service**:
```bash
sudo nano /etc/systemd/system/interviewer.service
```

**Add**:
```ini
[Unit]
Description=The Interviewer Spring Boot Application
After=syslog.target network.target

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/theinterviewer
ExecStart=/usr/bin/java -Xms512m -Xmx1024m -jar /home/ubuntu/theinterviewer/target/theinterviewer-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
SuccessExitStatus=143
Restart=always
RestartSec=10

Environment="RAZORPAY_KEY_ID=rzp_live_XXXXXXXXXX"
Environment="RAZORPAY_KEY_SECRET=your_secret"

[Install]
WantedBy=multi-user.target
```

**Start the service**:
```bash
# Reload systemd
sudo systemctl daemon-reload

# Enable service (start on boot)
sudo systemctl enable interviewer

# Start service
sudo systemctl start interviewer

# Check status
sudo systemctl status interviewer

# View logs
sudo journalctl -u interviewer -f
```

#### Step 8: Setup Nginx Reverse Proxy

```bash
# Install Nginx
sudo apt install nginx -y

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/interviewer
```

**Add**:
```nginx
server {
    listen 80;
    server_name your-domain.com;  # Replace with your domain or EC2 public IP

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Enable site**:
```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/interviewer /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

---

## 4. Database Setup (RDS PostgreSQL) 🗄️

### Step 1: Create RDS Instance

1. **Go to RDS Console**: https://console.aws.amazon.com/rds/
2. **Click "Create database"**
3. **Configuration**:
   - **Engine**: PostgreSQL
   - **Version**: PostgreSQL 14.x
   - **Templates**: Free tier
   - **DB Instance Identifier**: `interviewer-db`
   - **Master Username**: `postgres`
   - **Master Password**: (create strong password)
   - **DB Instance Class**: `db.t3.micro` (Free tier)
   - **Storage**: 20 GB (Free tier)
   - **Public Access**: Yes (for now, secure later)
   - **VPC Security Group**: Create new
     - Allow PostgreSQL (port 5432) from your EC2 security group
4. **Click "Create database"**
5. **Wait 5-10 minutes** for creation

### Step 2: Configure Security Group

1. **Go to EC2** → **Security Groups**
2. **Find RDS security group**
3. **Edit Inbound Rules**:
   - **Type**: PostgreSQL
   - **Port**: 5432
   - **Source**: EC2 security group ID
4. **Save**

### Step 3: Initialize Database

```bash
# Connect from EC2 instance
psql -h your-rds-endpoint.rds.amazonaws.com -U postgres -d postgres

# Create database
CREATE DATABASE interviewer_db;

# Exit
\q
```

### Step 4: Update Backend Configuration

Update `application-prod.properties`:
```properties
spring.datasource.url=jdbc:postgresql://your-rds-endpoint.rds.amazonaws.com:5432/interviewer_db
spring.datasource.username=postgres
spring.datasource.password=your_password
```

**Restart backend**:
```bash
sudo systemctl restart interviewer
```

---

## 5. Frontend Deployment (Next.js) 🎨

### Option A: Vercel (Easiest - Recommended)

#### Step 1: Prepare Frontend

**Update `frontend/.env.production`**:
```bash
NEXT_PUBLIC_API_URL=http://your-ec2-ip:8080
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_XXXXXXXXXX
```

#### Step 2: Deploy to Vercel

1. **Push code to GitHub**
2. **Go to**: https://vercel.com
3. **Sign up with GitHub**
4. **Click "Import Project"**
5. **Select your repository**
6. **Configure**:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
7. **Add Environment Variables**:
   ```
   NEXT_PUBLIC_API_URL=https://api.yourdomain.com
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_XXXXXXXXXX
   ```
8. **Click "Deploy"**
9. **Get URL**: `https://yourapp.vercel.app`

### Option B: AWS S3 + CloudFront

#### Step 1: Build Frontend

```bash
cd frontend
npm run build
npm run export  # If using static export
```

#### Step 2: Create S3 Bucket

1. **Go to S3**: https://s3.console.aws.amazon.com/
2. **Create bucket**:
   - **Name**: `interviewer-frontend`
   - **Region**: Same as EC2
   - **Uncheck "Block all public access"**
3. **Enable Static Website Hosting**:
   - **Index document**: `index.html`
   - **Error document**: `404.html`

#### Step 3: Upload Files

```bash
# Install AWS CLI (if not already)
aws configure
# Enter your AWS Access Key ID and Secret

# Upload files
aws s3 sync out/ s3://interviewer-frontend --acl public-read
```

#### Step 4: Setup CloudFront (CDN)

1. **Go to CloudFront**
2. **Create Distribution**:
   - **Origin**: Your S3 bucket
   - **Viewer Protocol Policy**: Redirect HTTP to HTTPS
3. **Get CloudFront URL**: `https://d111111abcdef8.cloudfront.net`

---

## 6. Domain & SSL Setup 🔒

### Step 1: Get Domain (Optional)

**Free Options**:
- Freenom.com (free .tk, .ml domains)
- Namecheap (cheap .com domains ~$10/year)

### Step 2: Point Domain to AWS

**For Backend (EC2)**:
1. **Go to Route 53** (or your domain provider)
2. **Create A Record**:
   - **Name**: `api.yourdomain.com`
   - **Type**: A
   - **Value**: Your EC2 public IP

**For Frontend (Vercel)**:
- Vercel handles this automatically
- Or create CNAME to Vercel

### Step 3: Setup SSL (Let's Encrypt - FREE)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d api.yourdomain.com

# Auto-renewal (already setup by certbot)
sudo certbot renew --dry-run
```

**Nginx will auto-update to HTTPS!**

---

## 7. Razorpay Live Integration 🔐

### Step 1: Submit Website to Razorpay

1. **Go to Razorpay Dashboard**
2. **Account & Settings** → **Website Details**
3. **Add**:
   - **Website URL**: `https://yourapp.vercel.app`
   - **Business Name**: Your business name
   - **Category**: Education/Technology
4. **Submit**
5. **Wait 24-48 hours for approval**

### Step 2: Generate Live Keys

After approval:
1. **Settings** → **API Keys**
2. **Switch to Live Mode**
3. **Generate Live Keys**
4. **Copy**:
   - Key ID: `rzp_live_XXXXXXXXXX`
   - Key Secret: `XXXXXXXXXX`

### Step 3: Update Environment Variables

**Backend (EC2)**:
```bash
# Update .env
nano ~/.env

# Change to live keys
export RAZORPAY_KEY_ID=rzp_live_XXXXXXXXXX
export RAZORPAY_KEY_SECRET=your_live_secret

# Restart service
sudo systemctl restart interviewer
```

**Frontend (Vercel)**:
1. **Go to Vercel Dashboard**
2. **Settings** → **Environment Variables**
3. **Update**:
   ```
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_XXXXXXXXXX
   ```
4. **Redeploy**

### Step 4: Setup Webhook

1. **Razorpay Dashboard** → **Webhooks**
2. **Add Webhook**:
   - **URL**: `https://api.yourdomain.com/api/payments/webhook`
   - **Events**: payment.captured, payment.failed
3. **Copy Webhook Secret**
4. **Add to backend env**:
   ```bash
   export RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
   ```

---

## 8. Monitoring & Maintenance 📊

### Setup CloudWatch (AWS Monitoring)

1. **EC2 Console** → **Monitoring**
2. **Enable Detailed Monitoring**
3. **Create Alarms**:
   - CPU > 80%
   - Memory > 80%
   - Disk > 80%

### Application Logs

```bash
# View backend logs
sudo journalctl -u interviewer -f

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Backup Database

```bash
# Create backup script
nano ~/backup-db.sh
```

**Add**:
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -h your-rds-endpoint -U postgres interviewer_db > backup_$DATE.sql
aws s3 cp backup_$DATE.sql s3://your-backup-bucket/
rm backup_$DATE.sql
```

**Schedule daily backup**:
```bash
chmod +x ~/backup-db.sh
crontab -e

# Add this line (runs daily at 2 AM)
0 2 * * * /home/ubuntu/backup-db.sh
```

---

## 🎯 Final Checklist

### Before Going Live:
- [ ] EC2 instance running
- [ ] RDS database created and connected
- [ ] Backend deployed and accessible
- [ ] Frontend deployed (Vercel/S3)
- [ ] Domain configured (optional)
- [ ] SSL certificate installed
- [ ] Razorpay live keys configured
- [ ] Webhook setup
- [ ] Monitoring enabled
- [ ] Backups scheduled
- [ ] Test payment successful

### Security Checklist:
- [ ] Change default passwords
- [ ] Restrict security groups (only necessary ports)
- [ ] Enable AWS MFA
- [ ] Setup IAM users (don't use root)
- [ ] Enable CloudTrail (audit logs)
- [ ] Regular security updates

---

## 💰 Cost Estimate (After Free Tier)

**Monthly Costs**:
- EC2 t2.micro: $8-10
- RDS t3.micro: $15-20
- Data Transfer: $5-10
- **Total**: ~$30-40/month

**Free Tier (First 12 months)**:
- **Cost**: $0/month

---

## 🆘 Troubleshooting

### Backend Not Starting:
```bash
# Check logs
sudo journalctl -u interviewer -n 100

# Check if port 8080 is listening
sudo netstat -tulpn | grep 8080

# Test locally
curl http://localhost:8080/actuator/health
```

### Database Connection Failed:
```bash
# Test connection
psql -h your-rds-endpoint -U postgres -d interviewer_db

# Check security group
# Make sure EC2 can access RDS on port 5432
```

### Frontend Not Loading:
```bash
# Check Nginx
sudo nginx -t
sudo systemctl status nginx

# Check logs
sudo tail -f /var/log/nginx/error.log
```

---

## 📞 Support

**AWS Support**:
- Free Tier: https://aws.amazon.com/free/
- Documentation: https://docs.aws.amazon.com/

**Razorpay Support**:
- Dashboard: https://dashboard.razorpay.com/
- Docs: https://razorpay.com/docs/

---

**🎉 Congratulations! Your app is now LIVE on AWS!**

**Next Steps**:
1. Test everything thoroughly
2. Monitor for 24 hours
3. Submit to Razorpay for live keys
4. Start accepting real payments!

**Good luck! 🚀**
