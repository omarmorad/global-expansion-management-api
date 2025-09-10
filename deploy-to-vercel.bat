@echo off
echo 🚀 Deploying to Vercel...

echo 🔨 Building application locally...
npm run build

if errorlevel 1 (
    echo ❌ Build failed. Please fix the errors before deploying.
    pause
    exit /b 1
)

echo ✅ Build successful!

echo 📦 Committing changes...
git add .
git commit -m "Deploy to Vercel - %date% %time%"

echo 📤 Pushing to GitHub...
git push origin main

if errorlevel 1 (
    echo ❌ Failed to push to GitHub. Please check your git configuration.
    pause
    exit /b 1
)

echo ✅ Successfully pushed to GitHub!
echo.
echo 🎯 Next Steps:
echo 1. Go to https://vercel.com/dashboard
echo 2. Import your GitHub repository
echo 3. Add environment variables:
echo    - NODE_ENV=production
echo    - DATABASE_PATH=/tmp/database.sqlite
echo    - MONGODB_URI=your-mongodb-connection-string
echo    - JWT_SECRET=your-jwt-secret
echo 4. Deploy!
echo.
echo 🔗 Your API will be available at: https://your-project.vercel.app/api
echo 📚 Full deployment guide: VERCEL_DEPLOYMENT.md
pause