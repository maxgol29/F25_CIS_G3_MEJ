# Build Guide for LocalPromo

This document describes how to build the LocalPromo application from source.

## Prerequisites

### Backend
- Python 3.11+
- pip (Python package manager)
- PostgreSQL database (for running the application)
- Redis (for caching)

### Frontend
- Node.js 20+
- npm (Node package manager)

### Docker (Alternative)
- Docker Engine
- Docker Compose

## Building the Application

### Backend Build

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Verify installation:
   ```bash
   python -c "import flask; import psycopg2; import redis; print('Backend dependencies installed successfully')"
   ```

### Frontend Build

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install npm dependencies:
   ```bash
   npm install
   ```

3. Build for production:
   ```bash
   npm run build
   ```

   This creates an optimized production build in the `frontend/build/` directory.

4. The production build includes:
   - Minified JavaScript bundles
   - Optimized CSS files
   - Static assets (images, fonts, etc.)
   - Production-ready index.html

### Build Verification

After building, you should see:

**Backend:**
- All Python packages installed without errors
- `requirements.txt` dependencies satisfied

**Frontend:**
- `frontend/build/` directory created
- `build/static/js/` with minified JavaScript bundles
- `build/static/css/` with optimized CSS files
- `build/index.html` as the entry point

## Docker Build (Alternative)

### Build Individual Services

**Backend:**
```bash
cd backend
docker build -t localpromo-backend .
```

**Frontend:**
```bash
cd frontend
docker build -t localpromo-frontend .
```

### Build with Docker Compose

From the root directory:
```bash
docker-compose build
```

This builds all services defined in `docker-compose.yml`:
- Backend (Python Flask API)
- Frontend (React application with Nginx)
- Redis (caching service)

## Running the Built Application

### Development Mode

**Backend:**
```bash
cd backend
python app.py
```
Runs on `http://localhost:5000`

**Frontend:**
```bash
cd frontend
npm start
```
Runs on `http://localhost:3000`

### Production Mode

**Frontend:**
After building, serve the static files from `frontend/build/`:
```bash
npm install -g serve
serve -s build
```

**Docker:**
```bash
docker-compose up
```

## Build Artifacts

The following directories contain build artifacts and should NOT be committed to version control:

- `frontend/build/` - Production build output
- `frontend/node_modules/` - npm dependencies
- `backend/__pycache__/` - Python bytecode
- `backend/.pytest_cache/` - Test cache

These are excluded via `.gitignore`.

## Troubleshooting

### Frontend Build Issues

If you encounter ESLint errors during build:
- Check that all React hooks have proper dependency arrays
- Remove unused variables
- Ensure imports are used

### Backend Build Issues

If pip install fails:
- Verify Python version: `python --version`
- Update pip: `pip install --upgrade pip`
- Check for conflicting packages

### Docker Build Issues

If Docker build fails:
- Ensure Docker daemon is running
- Check network connectivity for package downloads
- Verify Dockerfile syntax

## Build Output Summary

**Frontend Build Stats:**
- Main JavaScript bundle: ~77 KB (gzipped)
- Google Maps bundle: ~125 KB (gzipped)
- Additional chunks: Various sizes for code-splitting
- Total CSS: ~14 KB (combined, gzipped)

The build process:
1. Compiles React JSX to JavaScript
2. Bundles modules using webpack
3. Minifies and optimizes code
4. Generates source maps for debugging
5. Creates production-ready static assets

## Next Steps

After building:
1. Run tests to verify functionality
2. Configure environment variables
3. Set up database schema
4. Deploy to production environment

See README.md for deployment instructions.
