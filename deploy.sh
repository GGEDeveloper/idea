#!/bin/bash

# ===========================================
# SCRIPT DE DEPLOY PARA PRODUÇÃO
# ===========================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if .env exists
check_env() {
    if [ ! -f .env ]; then
        log_error ".env file not found!"
        log_info "Copy env.example to .env and configure your environment variables"
        log_info "cp env.example .env"
        exit 1
    fi
    log_success ".env file found"
}

# Check required environment variables
check_required_vars() {
    log_info "Checking required environment variables..."
    
    source .env
    
    required_vars=(
        "NODE_ENV"
        "DATABASE_URL"
        "JWT_SECRET"
        "GEKO_API_KEY"
    )
    
    missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -ne 0 ]; then
        log_error "Missing required environment variables:"
        for var in "${missing_vars[@]}"; do
            echo "  - $var"
        done
        exit 1
    fi
    
    log_success "All required environment variables are set"
}

# Install dependencies
install_deps() {
    log_info "Installing dependencies..."
    npm ci --omit=dev
    log_success "Dependencies installed"
}

# Build application
build_app() {
    log_info "Building application..."
    npm run prod:build
    log_success "Application built successfully"
}

# Test database connection
test_db() {
    log_info "Testing database connection..."
    npm run health > /dev/null 2>&1 || {
        log_warning "Database connection test failed"
        log_info "Starting server to test connection..."
        timeout 10s npm run prod:start &
        SERVER_PID=$!
        sleep 5
        
        if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
            log_success "Database connection successful"
        else
            log_error "Database connection failed"
            kill $SERVER_PID 2>/dev/null || true
            exit 1
        fi
        
        kill $SERVER_PID 2>/dev/null || true
        wait $SERVER_PID 2>/dev/null || true
    }
}

# Create logs directory
create_logs_dir() {
    log_info "Creating logs directory..."
    mkdir -p logs
    log_success "Logs directory created"
}

# Deploy with PM2
deploy_pm2() {
    log_info "Deploying with PM2..."
    
    # Stop existing processes
    npm run prod:pm2:stop 2>/dev/null || log_warning "No existing PM2 processes found"
    
    # Start with PM2
    npm run prod:pm2
    
    # Wait for app to be ready
    sleep 5
    
    # Check if app is running
    if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
        log_success "Application deployed successfully with PM2"
        npm run prod:pm2:logs
    else
        log_error "Application failed to start"
        npm run prod:pm2:logs
        exit 1
    fi
}

# Deploy without PM2 (simple)
deploy_simple() {
    log_info "Starting application in production mode..."
    npm run prod:start
}

# Main deployment function
main() {
    echo "=========================================="
    echo "       IDEA E-COMMERCE DEPLOYMENT        "
    echo "=========================================="
    
    log_info "Starting deployment process..."
    
    check_env
    check_required_vars
    install_deps
    build_app
    create_logs_dir
    test_db
    
    # Choose deployment method
    if command -v pm2 &> /dev/null; then
        log_info "PM2 found, deploying with process manager..."
        deploy_pm2
    else
        log_warning "PM2 not found, deploying in simple mode..."
        deploy_simple
    fi
    
    log_success "Deployment completed successfully!"
    echo "=========================================="
    echo "Application is running on port 3000"
    echo "Health check: http://localhost:3000/api/health"
    echo "=========================================="
}

# Handle script arguments
case "$1" in
    "pm2")
        check_env
        check_required_vars
        create_logs_dir
        deploy_pm2
        ;;
    "simple")
        check_env
        check_required_vars
        deploy_simple
        ;;
    "build")
        check_env
        install_deps
        build_app
        ;;
    "test")
        check_env
        check_required_vars
        test_db
        ;;
    *)
        main
        ;;
esac 