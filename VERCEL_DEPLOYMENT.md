# 🚀 Vercel Deployment Guide

## ⚠️ Important: Database Considerations

**Vercel is serverless** - this means:

- ❌ **No persistent file system** (SQLite won't work)
- ✅ **Must use external databases** (MongoDB Atlas, PostgreSQL, etc.)
- ⚡ **Functions have execution limits** (30 seconds max)

## 🗄️ Database Strategy for Vercel

### **Option 1: MongoDB Atlas Only (Recommended)**

- Move all data to MongoDB Atlas
- Remove SQLite dependency
- Use MongoDB for users, projects, clients, and documents

### **Option 2: PostgreSQL + MongoDB**

- **PostgreSQL**: For structured data (users, projects, clients)
- **MongoDB**: For documents and file storage
- Use services like Neon, Supabase, or PlanetScale

## 📋 **Step 1: Prepare for Vercel**

### **Update Package.json**

```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "vercel-build": "npm run build"
  }
}
```

### **Create Vercel Configuration**

Already created: `vercel.json`

## 🍃 **Step 2: Setup MongoDB Atlas**

Follow the existing guide: `MONGODB_ATLAS_SETUP.md`

**Additional Collections Needed:**

```javascript
// Users collection (replace SQLite users)
{
  _id: ObjectId,
  email: "admin@expanders360.com",
  password: "hashed_password",
  role: "admin",
  name: "Admin User",
  createdAt: Date,
  updatedAt: Date
}

// Clients collection (replace SQLite clients)
{
  _id: ObjectId,
  name: "TechCorp Solutions",
  email: "client@techcorp.com",
  industry: "Technology",
  country: "United States",
  createdAt: Date,
  updatedAt: Date
}

// Projects collection (replace SQLite projects)
{
  _id: ObjectId,
  clientId: ObjectId,
  name: "European Market Entry",
  description: "Expansion into European markets",
  status: "active",
  budget: 150000,
  startDate: Date,
  endDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔧 **Step 3: Update Database Models**

### **Create MongoDB-Only Models**

```typescript
// src/models/User.ts
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'client'], default: 'client' },
    name: { type: String, required: true },
    company: String,
    phone: String,
  },
  { timestamps: true },
);

export const User = mongoose.model('User', userSchema);
```

### **Update Database Connection**

```typescript
// src/database/connection.ts
import mongoose from 'mongoose';

export const connectMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
};
```

## 🚀 **Step 4: Deploy to Vercel**

### **Method 1: Vercel CLI**

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

### **Method 2: GitHub Integration**

1. Push code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "New Project"
4. Import your GitHub repository
5. Configure environment variables
6. Deploy!

## 🔐 **Step 5: Environment Variables**

Add these in Vercel dashboard:

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/global_expansion_api
JWT_SECRET=your-super-secure-jwt-secret
JWT_EXPIRES_IN=24h
ENABLE_EMAIL_NOTIFICATIONS=false
```

## ⚡ **Step 6: Optimize for Serverless**

### **Cold Start Optimization**

```typescript
// Keep MongoDB connection alive
let cachedConnection: typeof mongoose | null = null;

export const connectDB = async () => {
  if (cachedConnection) {
    return cachedConnection;
  }

  cachedConnection = await mongoose.connect(process.env.MONGODB_URI!);
  return cachedConnection;
};
```

### **Function Timeout Handling**

```typescript
// Add timeout middleware
app.use((req, res, next) => {
  res.setTimeout(25000, () => {
    res.status(408).json({ error: 'Request timeout' });
  });
  next();
});
```

## 🧪 **Step 7: Test Deployment**

Your API will be available at: `https://your-project.vercel.app`

Test endpoints:

- `GET /api/health`
- `POST /api/auth/login`
- `GET /api/clients`

## 📊 **Vercel Limitations & Solutions**

### **Limitations**

- ❌ No persistent file system
- ⏱️ 30-second function timeout (Hobby plan)
- 💾 Limited memory per function
- 🔄 Cold starts

### **Solutions**

- ✅ Use external databases only
- ✅ Optimize database queries
- ✅ Implement connection pooling
- ✅ Add proper error handling

## 💰 **Cost Comparison**

### **Vercel Hobby (Free)**

- 100GB bandwidth/month
- Serverless functions
- Custom domains
- **Database**: External (MongoDB Atlas free tier)

### **Vercel Pro ($20/month)**

- Unlimited bandwidth
- Faster builds
- Team collaboration
- Advanced analytics

## 🎯 **Recommendation**

For your Global Expansion API:

1. **Start with MongoDB Atlas only** (simplest migration)
2. **Use Vercel Hobby plan** (free)
3. **Migrate SQLite data to MongoDB**
4. **Test thoroughly** before going live

## 📚 **Next Steps**

1. Decide on database strategy (MongoDB only vs. PostgreSQL + MongoDB)
2. Update your models and database layer
3. Create migration scripts
4. Deploy to Vercel
5. Update Postman collection with new URL

Would you like me to help you migrate from SQLite to MongoDB-only setup?
