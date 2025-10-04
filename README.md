# EveShop - Flask + React E-commerce Application

A full-stack e-commerce application with Flask backend and React frontend, fully dockerized for easy deployment.

## 🏗️ Architecture

- **Backend**: Flask REST API with SQLAlchemy ORM
- **Frontend**: React application with Nginx
- **Database**: PostgreSQL 15
- **Web Server**: Gunicorn (backend) + Nginx (frontend)

## 📋 Prerequisites

- Docker (version 20.10 or higher)
- Docker Compose (version 2.0 or higher)
- Git

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd eveshop
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Flask Configuration
FLASK_CONFIG=development
FLASK_APP=app.py
SECRET_KEY=your-super-secret-key-change-this-in-production

# Database Configuration
DEVELOPMENT_DATABASE_URL=postgresql://eveshop:password@db:5432/eveshop
PRODUCTION_DATABASE_URL=postgresql://eveshop:password@db:5432/eveshop
STAGING_DATABASE_URL=postgresql://eveshop:password@db:5432/eveshop
TEST_DATABASE_URL=postgresql://eveshop:password@db:5432/eveshop_test

# PostgreSQL Configuration
POSTGRES_USER=eveshop
POSTGRES_PASSWORD=password
POSTGRES_DB=eveshop
```

### 3. Build and Run with Docker

```bash
# Build and start all services
docker-compose up --build

# Or run in detached mode
docker-compose up -d --build
```

### 4. Initialize Database

```bash
# Initialize migrations
docker-compose exec web flask db init

# Create migration
docker-compose exec web flask db migrate -m "Initial migration"

# Apply migrations
docker-compose exec web flask db upgrade
```

### 5. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Database**: localhost:5432

## 📁 Project Structure

```
eveshop/
├── app.py                      # Flask application entry point
├── requirements.txt            # Python dependencies
├── Dockerfile                  # Backend Dockerfile
├── docker-compose.yml          # Docker Compose configuration
├── .env                        # Environment variables
├── .dockerignore              # Docker ignore file
├── core/                      # Flask application core
│   ├── __init__.py           # App factory
│   ├── config.py             # Configuration classes
│   ├── products/             # Products module
│   ├── accounts/             # Accounts module
│   ├── categories/           # Categories module
│   ├── orders/               # Orders module
│   ├── cart/                 # Cart module
│   └── payments/             # Payments module
├── migrations/                # Database migrations
└── frontend/                  # React application
    ├── Dockerfile            # Frontend Dockerfile
    ├── nginx.conf            # Nginx configuration
    ├── .dockerignore         # Frontend Docker ignore
    ├── package.json          # Node dependencies
    ├── public/               # Static files
    └── src/                  # React source code
```

## 🛠️ Development

### Running in Development Mode

```bash
# Start all services
docker-compose up

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f web
docker-compose logs -f frontend
docker-compose logs -f db
```

### Backend Development

```bash
# Access backend container shell
docker-compose exec web bash

# Run Flask shell
docker-compose exec web flask shell

# Run tests
docker-compose exec web python -m pytest
```

### Frontend Development

```bash
# Access frontend container shell
docker-compose exec frontend sh

# Install new packages (rebuild required)
cd frontend
npm install <package-name>
docker-compose up --build frontend
```

### Database Management

```bash
# Access PostgreSQL shell
docker-compose exec db psql -U eveshop -d eveshop

# Backup database
docker-compose exec db pg_dump -U eveshop eveshop > backup.sql

# Restore database
docker-compose exec -T db psql -U eveshop eveshop < backup.sql

# Reset database (fresh start)
docker-compose down -v
docker-compose up -d
docker-compose exec web flask db upgrade
```

## 🔄 Database Migrations

### Create New Migration

```bash
# After modifying models
docker-compose exec web flask db migrate -m "Description of changes"
docker-compose exec web flask db upgrade
```

### Reset Migrations (Force Fresh Start)

```bash
# Stop containers and remove volumes
docker-compose down -v

# Start containers
docker-compose up -d

# Wait for database to be ready
sleep 5

# Remove existing migrations
docker-compose exec web rm -rf migrations

# Initialize fresh migrations
docker-compose exec web flask db init
docker-compose exec web flask db migrate -m "Initial migration"
docker-compose exec web flask db upgrade
```

## 🔧 Configuration

### Environment-Specific Configuration

Change the `FLASK_CONFIG` variable in `.env`:

- `development` - Development mode with debug enabled
- `staging` - Staging environment
- `production` - Production mode (debug disabled)
- `testing` - Testing environment

### Security Configuration

**Important**: Always change these in production:

1. Generate a secure `SECRET_KEY`:
   ```bash
   python -c "import secrets; print(secrets.token_hex(32))"
   ```

2. Update database credentials in `.env`

3. Set strong passwords for PostgreSQL

## 🐳 Docker Commands

### Container Management

```bash
# Start services
docker-compose up

# Start in background
docker-compose up -d

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Restart services
docker-compose restart

# Rebuild specific service
docker-compose up --build web
```

### Monitoring

```bash
# View running containers
docker-compose ps

# View logs
docker-compose logs -f

# View resource usage
docker stats

# Execute command in container
docker-compose exec web <command>
```

### Cleanup

```bash
# Remove stopped containers
docker-compose down

# Remove all unused Docker resources
docker system prune -a

# Remove specific service image
docker-compose rm web
docker rmi eveshop_web
```

## 🌐 API Endpoints

The backend API is accessible at `http://localhost:5000` or via the frontend proxy at `/api`:

- `GET /` - Health check
- `GET /api/products` - List products
- `GET /api/categories` - List categories
- `POST /api/accounts/register` - Register user
- `POST /api/accounts/login` - Login user
- `GET /api/cart` - Get cart items
- `POST /api/orders` - Create order
- `POST /api/payments` - Process payment

## 🧪 Testing

```bash
# Run backend tests
docker-compose exec web python -m pytest

# Run with coverage
docker-compose exec web python -m pytest --cov=core

# Run specific test file
docker-compose exec web python -m pytest tests/test_products.py
```

## 🚢 Production Deployment

### 1. Update Environment Variables

Set production values in `.env`:

```env
FLASK_CONFIG=production
SECRET_KEY=<your-secure-random-key>
PRODUCTION_DATABASE_URL=postgresql://user:password@db:5432/eveshop
```

### 2. Build Production Images

```bash
docker-compose -f docker-compose.yml build
```

### 3. Deploy

```bash
docker-compose up -d
```

### 4. Health Checks

```bash
# Check backend
curl http://localhost:5000

# Check frontend
curl http://localhost:3000

# Check database
docker-compose exec db pg_isready -U eveshop
```

## 📝 Troubleshooting

### Port Already in Use

```bash
# Find process using port
lsof -i :5000
lsof -i :3000

# Kill process
kill -9 <PID>

# Or change ports in docker-compose.yml
```

### Database Connection Issues

```bash
# Check database is running
docker-compose ps db

# Check database logs
docker-compose logs db

# Restart database
docker-compose restart db
```

### Migration Errors

```bash
# Reset migrations
docker-compose exec web rm -rf migrations
docker-compose exec web flask db init
docker-compose exec web flask db migrate -m "Initial"
docker-compose exec web flask db upgrade
```

### Container Build Failures

```bash
# Clear build cache
docker builder prune -a

# Rebuild without cache
docker-compose build --no-cache

# Check Dockerfile syntax
docker-compose config
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- Flask documentation
- React documentation
- Docker documentation
- PostgreSQL documentation