# 🚀 Deployment Guide - Disaster Preparedness App

## 📋 Prerequisites
- GitHub repository: `sahil0m/sih-2025`
- MongoDB Atlas account
- Vercel account
- Render account

## 🔧 Configuration Files Created
- `vercel.json` - Vercel deployment configuration
- `render.yaml` - Render deployment configuration
- `env.example` - Environment variables template
- `src/config/api.js` - Centralized API configuration

## 📦 Step-by-Step Deployment

### Phase 1: Deploy Backend on Render

1. **Go to [render.com](https://render.com)**
2. **Sign up with GitHub account**
3. **Click "New +" → "Web Service"**
4. **Connect GitHub repository: `sahil0m/sih-2025`**
5. **Configure service:**
   - **Name:** `disaster-prep-backend`
   - **Root Directory:** `backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Plan:** Free

6. **Set Environment Variables:**
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: Any random string (e.g., `mysecretkey123`)
   - `NODE_ENV`: `production`
   - `PORT`: `10000`

7. **Deploy and copy the backend URL** (e.g., `https://disaster-prep-backend.onrender.com`)

### Phase 2: Deploy Frontend on Vercel

1. **Go to [vercel.com](https://vercel.com)**
2. **Sign up with GitHub account**
3. **Click "Import Project"**
4. **Select `sahil0m/sih-2025`**
5. **Configure build settings:**
   - **Framework Preset:** Create React App
   - **Root Directory:** `./` (root)
   - **Build Command:** `npm run build`
   - **Output Directory:** `build`

6. **Set Environment Variables:**
   - `REACT_APP_API_URL`: Your Render backend URL from Phase 1

7. **Deploy and copy the frontend URL** (e.g., `https://sih-2025.vercel.app`)

### Phase 3: Update Backend CORS

1. **Go back to Render dashboard**
2. **Update your backend CORS in `backend/server.js`** to include your Vercel URL:
   ```javascript
   origin: [
     'http://localhost:3000',
     'http://localhost:5001',
     'https://*.vercel.app',
     'https://sih-2025.vercel.app' // Your actual Vercel URL
   ]
   ```
3. **Redeploy backend**

### Phase 4: Test Deployment

1. **Visit your Vercel URL**
2. **Test all major features:**
   - User authentication
   - Video playback
   - Points system
   - Real-time alerts
   - File uploads

## 🔗 Final URLs
- **Frontend:** `https://sih-2025.vercel.app`
- **Backend:** `https://disaster-prep-backend.onrender.com`
- **Database:** MongoDB Atlas (cloud)

## ⚠️ Important Notes
- **Free Tier Limits:** Both Vercel and Render have free tier limits
- **Cold Starts:** Render free tier has cold starts (first request might be slow)
- **Environment Variables:** Keep your MongoDB URI and JWT secret secure
- **CORS:** Make sure to update CORS with your actual Vercel URL

## 🐛 Troubleshooting
- **CORS Errors:** Check backend CORS configuration
- **API Errors:** Verify environment variables are set correctly
- **Build Errors:** Check build logs in Vercel/Render dashboards
- **Database Errors:** Verify MongoDB Atlas connection string

## 📝 Environment Variables Reference

### Frontend (Vercel)
```
REACT_APP_API_URL=https://your-backend.onrender.com
```

### Backend (Render)
```
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=production
PORT=10000
```

## 🎉 Success!
Your full-stack disaster preparedness app is now live and accessible via a single GitHub repository!
