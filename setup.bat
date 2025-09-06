@echo off
echo 🚀 Setting up Global Expansion Management API...

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

REM Install dependencies
echo 📦 Installing dependencies...
npm install

REM Copy environment file
if not exist .env (
    echo 📝 Creating environment file...
    copy .env.example .env
    echo ✅ Created .env file. Please update it with your configuration.
) else (
    echo ℹ️  .env file already exists
)

REM Create data directory for SQLite
if not exist data mkdir data

REM Seed databases
echo 🌱 Seeding databases...
npm run seed:sqlite

echo.
echo ✅ Setup complete!
echo.
echo 🎯 Next steps:
echo    1. Update .env file with your configuration
echo    2. Start MongoDB: docker run -d -p 27017:27017 mongo:7
echo    3. Seed MongoDB: npm run seed:mongo
echo    4. Start the development server: npm run start:dev
echo    5. Visit http://localhost:3000/api for API info
echo.
echo 🧪 Test credentials:
echo    Admin: admin@expanders360.com / admin123
echo    Client: client@techcorp.com / client123
echo.
echo 📚 API Documentation: See README.md
pause