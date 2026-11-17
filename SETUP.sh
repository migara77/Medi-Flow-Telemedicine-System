#!/bin/bash

echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║           MediFlow - Complete System Setup Script                  ║"
echo "║          Initializing Database & Backend Configuration             ║"
echo "╚════════════════════════════════════════════════════════════════════╝"

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$PROJECT_DIR/mediflow-backend"
FRONTEND_DIR="$PROJECT_DIR/mediflow-frontend"

echo ""
echo "📂 Project Directory: $PROJECT_DIR"
echo ""

# Step 1: Backend Setup
echo "═══════════════════════════════════════════════════════════════════"
echo "STEP 1: Backend Configuration"
echo "═══════════════════════════════════════════════════════════════════"

cd "$BACKEND_DIR"

if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env 2>/dev/null || cat > .env << 'ENVEOF'
APP_NAME=MediFlow
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost:8001

LOG_CHANNEL=stack
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=debug

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=mediflow
DB_USERNAME=root
DB_PASSWORD=

BROADCAST_DRIVER=log
CACHE_DRIVER=file
FILESYSTEM_DISK=local
QUEUE_CONNECTION=sync
SESSION_DRIVER=file
SESSION_LIFETIME=120

MEMCACHED_HOST=127.0.0.1

REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

MAIL_MAILER=log
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="hello@example.com"
MAIL_FROM_NAME="${APP_NAME}"

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=
AWS_USE_PATH_STYLE_URLS=false

PUSHER_APP_ID=
PUSHER_APP_KEY=
PUSHER_APP_SECRET=
PUSHER_HOST=
PUSHER_PORT=443
PUSHER_SCHEME=https
PUSHER_APP_CLUSTER=mt1

VITE_PUSHER_APP_KEY="${PUSHER_APP_KEY}"
VITE_PUSHER_HOST="${PUSHER_HOST}"
VITE_PUSHER_PORT="${PUSHER_PORT}"
VITE_PUSHER_SCHEME="${PUSHER_SCHEME}"
VITE_PUSHER_APP_CLUSTER="${PUSHER_APP_CLUSTER}"

JWT_SECRET=your_jwt_secret_here
JWT_ALGORITHM=HS256
ENVEOF
    echo "✅ .env file created"
fi

echo ""
echo "🔑 Generating JWT Secret..."
if ! grep -q "JWT_SECRET=base64:" .env; then
    JWT_SECRET=$(php -r 'echo base64_encode(random_bytes(32));')
    sed -i '' "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" .env 2>/dev/null || sed -i "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" .env
    echo "✅ JWT Secret generated and added to .env"
fi

echo ""
echo "🔄 Installing Composer Dependencies..."
if [ ! -d "vendor" ]; then
    composer install --no-interaction --prefer-dist
    echo "✅ Composer dependencies installed"
else
    echo "✅ Composer dependencies already installed"
fi

echo ""
echo "🗝️ Generating App Key..."
if ! grep -q "APP_KEY=base64:" .env; then
    php artisan key:generate
    echo "✅ App key generated"
fi

echo ""
echo "🗄️ Setting up Database..."
echo "   Running migrations..."
php artisan migrate:fresh --seed --force

if [ $? -eq 0 ]; then
    echo "✅ Database migrations completed"
else
    echo "⚠️  Database migration had issues. Check your MySQL connection."
fi

echo ""
echo "═══════════════════════════════════════════════════════════════════"
echo "STEP 2: Frontend Configuration"
echo "═══════════════════════════════════════════════════════════════════"

cd "$FRONTEND_DIR"

if [ ! -f ".env" ]; then
    echo "📝 Creating frontend .env file..."
    cat > .env << 'ENVEOF'
REACT_APP_API_URL=http://127.0.0.1:8001/api
ENVEOF
    echo "✅ Frontend .env file created"
fi

if [ ! -d "node_modules" ]; then
    echo ""
    echo "📦 Installing npm dependencies..."
    npm install
    echo "✅ npm dependencies installed"
else
    echo "✅ npm dependencies already installed"
fi

echo ""
echo "═══════════════════════════════════════════════════════════════════"
echo "SETUP COMPLETE! ✅"
echo "═══════════════════════════════════════════════════════════════════"
echo ""
echo "🚀 TO RUN THE SYSTEM:"
echo ""
echo "   TERMINAL 1 - Start Backend:"
echo "   $ cd $BACKEND_DIR"
echo "   $ php artisan serve --port=8001"
echo ""
echo "   TERMINAL 2 - Start Frontend:"
echo "   $ cd $FRONTEND_DIR"
echo "   $ npm start"
echo ""
echo "🔑 Demo Credentials:"
echo "   Patient:  patient1@example.com / password"
echo "   Doctor:   doctor1@example.com / password"
echo "   Admin:    admin@example.com / password"
echo ""
echo "🌐 Access at: http://localhost:3000"
echo ""
