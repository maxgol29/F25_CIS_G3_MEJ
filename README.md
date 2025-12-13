# LocalPromo

**LocalPromo** is website where San Antonio Restaurants can send you loyalty as promos. To be granted for this loyalty, you need to be registed and pick the restaurant within 2 miles. This B2C platform allows restaurants and customers have much deeper tie thaqn other web platforms. 

---

## Key Features

- **Customer**
    1. Browse nearby local restaurants, bars, and coffee shops
    2. Filter by categories & search
    3. View menu & order
    4. Redeem promo codes
    5. See statistic of savings
    6. Track order history
    7. All types of payment
    8. Relocation request
    9. Integrated with Google Places
- **Business Owner**
  1. Create / activate / deactivate promo codes
  2. Analytical dashboard
  3. Manage menu items
  4. Accept & Decline oreders
  5. See full report of sales & revenue
- **Security**
   1. JWT Authentication
   2. Input Validation
   3. SQL injection sanitized queries
   4. Role-Based Access Control
   5. CORS limitation
- **Architecture**
   1. Microservice-like structure (Flask BLuprints + React)
   2. Redis caching
   3. Docker deployment
   4. CI/CD pipeline
   5. Postgres
---

<h2 align="center">Technology Stack</h2>

- **Frontend**
  1. React, Context API, CSS Modules
  2. Google Places
  3. Rechart lib
- **Backend**
  1. Python Flask
  2. Redis caching
  3. JWT
  4. psycopg
- **Database**
  1. PostgresSQL
  2. Constrains, FK, Indexes 
- **Deployment**
  1. Docker
  2. Cloud Run with Containarization

##Installation & Setup Steps

**Manual Installation (Option 1)**
```git clone https://github.com/maxgol29/F25_CIS_G3_MEJ
cd F25_CIS_G3_MEJ
cd backend
pip install -r requirements.txt
cd ..
cd frontend
npm install
```

**Docker Installation (Option2)**

```git clone https://github.com/maxgol29/F25_CIS_G3_MEJ
cd F25_CIS_G3_MEJ
docker-compose build
docker-compose up
```

**Environment Variables**

```DB_HOST=
DB_USER=
DB_PASSWORD=
DB_NAME=
JWT_SECRET_KEY=
REDIS_URL=
GOOGLE_API_KEY=
JWT_COOKIE_SECURE=
JWT_COOKIE_SAMESITE=
REACT_APP_API_BASE_URL=
REACT_APP_GOOGLE_PLACES_API_KEY=
```

**Launch (Option 1.1)**

```cd frontend
npm start
cd ..
cd backend
py app.py
```
##Docker Deployment

```
services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: python_backend
    environment:
      DATABASE_URL: postgresql://postgres:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}
      FLASK_ENV: development
      REDIS_HOST: redis
      REDIS_PORT: 6379
    ports:
      - "5000:5000"
    volumes:
      - ./backend:/app
    networks:
      - app-network
    depends_on:
      - redis
    command: python app.py

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: react_frontend
    environment:
      REACT_APP_API_URL: ${API_BASE_URL}
      REACT_APP_GOOGLE_PLACES_API_KEY: ${REACT_APP_GOOGLE_PLACES_API_KEY}
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    depends_on:
      - backend
    networks:
      - app-network
    stdin_open: true
    tty: true

  redis:
    image: redis:7.2-alpine
    container_name: redis
    ports:
      - "6379:6379"
    networks:
      - app-network

volumes:
  postgres_data:

networks:
  app-network:
    driver: bridge
```

## File Architecture
```
F25_CIS_G3_MEJ
├── backend/                  # Flask backend API
│   ├── routes/               # REST endpoint definitions
│   ├── services/             # Business logic layer
│   ├── db/                   # Database models & redis
│   ├── migrations/           # DB initialization scripts
│   └── tests/                # Unit + integration tests
│
├── frontend/                 # React web client
│   ├── components/           # UI Components
│   ├── context/              # Global state providers
│   ├── styles/               # CSS Modules
│   └── utils/                # Helper function
│
├── other/                    # Extra scripts & tools
├── .github/                  # CI workflows and templates
├── docker-compose.yml        # Dev environment orchestration
└── README.md                 # Documentation
```
---

# Developed by:

<h2> Maxym Holubnychyi <br> Joseph Montez <br> Everett Getchell </h2>


---

University of the Incarnate Word (UIW), 2025







