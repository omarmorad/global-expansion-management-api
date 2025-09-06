# 🧪 Global Expansion Management API - Complete Testing Guide

## 📋 Quick Setup Checklist

- ✅ **Dependencies installed**: `npm install --legacy-peer-deps`
- ✅ **Environment configured**: `.env` file created
- ✅ **SQLite seeded**: `npm run seed:sqlite`
- ✅ **MongoDB running**: `docker start mongodb`
- ✅ **MongoDB seeded**: `npm run seed:mongo`
- ✅ **API running**: `npm run start:dev`

## 🔑 Test Credentials

```
👤 ADMIN ACCOUNT:
Email: admin@expanders360.com
Password: admin123
Role: admin (can manage vendors, view all analytics)

👤 CLIENT ACCOUNT:
Email: client@techcorp.com
Password: client123
Role: client (can manage own projects only)
```

## 📊 Seeded Data Overview

### SQLite Database (Relational)

- **2 Clients**: 1 admin, 1 client
- **5 Vendors**: Covering different regions (USA, Europe, Asia-Pacific, Americas, Nordic)
- **4 Projects**: Active projects in Germany, Japan, USA, Sweden
- **Matches**: Generated dynamically when you test matching endpoints

### MongoDB Database (Documents)

- **6 Research Documents**: Market analyses, legal guides, cultural insights
- **Various Tags**: germany, japan, usa, sweden, legal, market-analysis, etc.
- **Different File Types**: PDF, DOCX with realistic file sizes

---

## 🚀 Import Collections

### Option 1: Postman

1. Open Postman
2. Click **Import** button
3. Select `Global-Expansion-API.postman_collection.json`
4. Collection will be imported with all endpoints and tests

### Option 2: Bruno

1. Open Bruno
2. Import the `bruno-collection` folder
3. Select the **Local** environment

---

## 🧪 Testing Workflow

### Step 1: Authentication Flow

1. **Login Client** → Get `client_token`
2. **Login Admin** → Get `admin_token`
3. **Get Profile** → Verify token works

### Step 2: Project Management

1. **Get All Projects** → See existing projects
2. **Create New Project** → Add France expansion project
3. **Get Project by ID** → Verify project details
4. **Update Project** → Modify budget/services

### Step 3: Vendor Matching (Core Feature)

1. **Get All Vendors** → See available vendors
2. **Rebuild Project Matches** → Generate matches for new project
3. **Get Project Matches** → View matched vendors with scores

### Step 4: Research Documents

1. **Upload Document** → Add France market research
2. **Search Documents** → Find by text/tags
3. **Get Documents by Project** → Project-specific documents

### Step 5: Analytics (Cross-Database)

1. **Get Top Vendors** → Country-wise vendor rankings
2. **Get Project Stats** (Admin) → System statistics
3. **Get Vendor Stats** (Admin) → Vendor performance metrics

---

## 🔍 Key Testing Scenarios

### Scenario 1: New Client Expansion

```
1. Login as client
2. Create project for new country (e.g., "Italy")
3. Upload market research document
4. Rebuild matches to find suitable vendors
5. Review matched vendors and scores
6. Check analytics for the country
```

### Scenario 2: Admin Management

```
1. Login as admin
2. Create new vendor
3. View all system statistics
4. Check matching performance
5. Monitor vendor SLA compliance
```

### Scenario 3: Cross-Database Analytics

```
1. Create projects in multiple countries
2. Upload research documents with country tags
3. Generate vendor matches
4. View top vendors analytics (combines SQLite + MongoDB data)
```

---

## 📈 Expected Results

### Matching Algorithm Results

- **Score Formula**: `(Service Overlap × 2) + Vendor Rating + SLA Weight`
- **High Scores**: 8.0+ (excellent matches)
- **Medium Scores**: 5.0-7.9 (good matches)
- **Low Scores**: 1.0-4.9 (basic matches)

### Sample Match Scores

```
France Project (legal, marketing, hr):
- European Business Solutions: ~8.5 (perfect country + service match)
- Global Expansion Partners: ~7.8 (good match with fast SLA)
- Nordic Business Network: ~0 (no country support)
```

### Analytics Data

```json
{
  "country": "Germany",
  "topVendors": [
    {
      "vendor": { "name": "European Business Solutions" },
      "avgMatchScore": 8.5,
      "matchCount": 3
    }
  ],
  "researchDocumentCount": 2
}
```

---

## 🚨 Common Issues & Solutions

### Issue: "Cannot find module '@nestjs/mapped-types'"

**Solution**: `npm install @nestjs/mapped-types`

### Issue: MongoDB connection failed

**Solution**:

```bash
docker start mongodb
# or
docker run -d -p 27017:27017 --name mongodb mongo:7
```

### Issue: 401 Unauthorized

**Solution**:

1. Login first to get token
2. Copy token to Authorization header
3. Use format: `Bearer YOUR_TOKEN_HERE`

### Issue: 403 Forbidden (Admin endpoints)

**Solution**: Use admin token for admin-only endpoints

### Issue: Empty matches array

**Solution**:

1. Ensure vendors exist for the project's country
2. Check service overlap between project and vendors
3. Verify vendors are active (`is_active: true`)

---

## 🔧 Advanced Testing

### Custom Test Scripts

Each Postman request includes test scripts that:

- Verify response status codes
- Check response structure
- Extract and store variables (tokens, IDs)
- Validate business logic

### Environment Variables

The collection automatically manages:

- `client_token` - Set after client login
- `admin_token` - Set after admin login
- `project_id` - Set from project responses
- `vendor_id` - Set from vendor responses
- `document_id` - Set from document responses

### Automated Testing

Run entire collection with:

1. Postman Runner
2. Newman CLI: `newman run Global-Expansion-API.postman_collection.json`

---

## 📊 Performance Benchmarks

### Expected Response Times

- **Authentication**: < 200ms
- **CRUD Operations**: < 100ms
- **Matching Algorithm**: < 500ms
- **Analytics Queries**: < 1000ms
- **Document Search**: < 300ms

### Database Performance

- **SQLite**: Handles 1000+ records efficiently
- **MongoDB**: Full-text search on documents
- **Cross-DB Queries**: Optimized joins in service layer

---

## 🎯 Success Criteria

### ✅ Authentication & Authorization

- [x] JWT tokens generated and validated
- [x] Role-based access control working
- [x] Protected routes secured

### ✅ Core Business Logic

- [x] Project-vendor matching algorithm
- [x] Score calculation accurate
- [x] Cross-database analytics

### ✅ Data Management

- [x] SQLite CRUD operations
- [x] MongoDB document storage
- [x] Data consistency maintained

### ✅ API Quality

- [x] Proper HTTP status codes
- [x] Consistent response formats
- [x] Error handling implemented
- [x] Input validation working

---

## 🚀 Next Steps

1. **Import Collection**: Use the provided JSON files
2. **Run Authentication**: Get your tokens first
3. **Test Core Features**: Focus on matching algorithm
4. **Explore Analytics**: See cross-database queries in action
5. **Create Custom Scenarios**: Test your specific use cases

## 📞 Support

If you encounter issues:

1. Check the console logs in your terminal
2. Verify all services are running (API + MongoDB)
3. Ensure you're using the correct tokens
4. Review the test credentials and seeded data

**Happy Testing! 🎉**
