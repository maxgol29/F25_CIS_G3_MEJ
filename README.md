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

<h2 align="center">Business Architecture</h2>

<div align="center">

<img alt="Business Architecture" width="900"
     src="https://github.com/user-attachments/assets/d379e7ec-27e9-416c-bb4f-c94f23383e54"/>

</div>


<h2 align="center">System Architecture</h2>

<div align="center">

<img alt="System Architecture" width="900"
     src="https://github.com/user-attachments/assets/be658172-fe3f-4f2a-8a1b-14682c87d375"/>

</div>


<h2 align="center">Data Flow Diagram (Context + Level 0)</h2>

<div align="center">

<img alt="DFD" width="900"
     src="https://github.com/user-attachments/assets/2a4e2d82-875c-4cc2-ae17-09f9f97c82a9"/>

</div>

<h2 align="center">Database Architecture ERD</h2>

<div align="center">

<img alt="DB Architecture" width="900"
     src="https://github.com/user-attachments/assets/520dc86d-c1b3-4e6d-b18d-ca92cb91ef44"/>

</div>

<h2 align="center">Deploy Architecture</h2>

<p align="center">
       <img width="931" height="762" alt="Service Architecture" src="https://github.com/user-attachments/assets/c79285ef-3025-4760-860e-541c1bd714eb" />
</p>

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
  2. Frontend Vercel
  3. Backend on Railway

## API Documentation

| Area          | Method | Endpoint                                              | Description                                                        |
| ------------- | ------ | ----------------------------------------------------- | ------------------------------------------------------------------ |
| Health        | GET    | `/api/health`                                         | API healthcheck                                                    |
| Auth          | POST   | `/api/auth/signup`                                    | Register a new user (customer or owner)                            |
| Auth          | POST   | `/api/auth/login`                                     | Login and return JWT tokens                                        |
| User          | GET    | `/api/auth/users/:user_id`                            | Get user details (JWT required)                                    |
| User          | POST   | `/api/users/:user_id/request`                         | User requests address change                                       |
| Items         | GET    | `/api/items`                                          | Get items (filters: limit, business_id, google_place_id, category) |
| Items         | POST   | `/api/business/:business_id/items`                    | Create item for business                                           |
| Items         | PUT    | `/api/business/:business_id/items/:item_id`           | Update item                                                        |
| Items         | DELETE | `/api/business/:business_id/items/:item_id`           | Delete item                                                        |
| Items         | GET    | `/api/business/:business_id/items/popular`            | Get popular items                                                  |
| Businesses    | POST   | `/api/businesses/save-from-places`                    | Save Google Places search results                                  |
| Businesses    | GET    | `/api/businesses/get-all`                             | Get all businesses (optional limit)                                |
| Businesses    | GET    | `/api/businesses/:business_id`                        | Get specific business                                              |
| Businesses    | GET    | `/api/businesses/:business_id/items`                  | Get business items                                                 |
| Businesses    | GET    | `/api/businesses/business/:business_id/items/popular` | Popular items by business                                          |
| Businesses    | GET    | `/api/businesses/business/:business_id/orders/daily`  | Get daily orders summary                                           |
| Businesses    | GET    | `/api/businesses/business/:business_id/income`        | Get income statistics                                              |
| Orders        | POST   | `/api/orders/create`                                  | Create new order                                                   |
| Orders        | GET    | `/api/orders/:order_id`                               | Get order by ID                                                    |
| Orders        | GET    | `/api/orders/user/:user_id`                           | Get order history for user                                         |
| Orders        | GET    | `/api/orders/business/:business_id`                   | Get orders for business                                            |
| Orders        | PUT    | `/api/orders/:order_id/status`                        | Update order status                                                |
| Orders        | GET    | `/api/orders/:order_id/qr-code`                       | Generate QR code for order                                         |
| Promos        | POST   | `/api/promo/create`                                   | Create promo code                                                  |
| Promos        | GET    | `/api/promo/types`                                    | List promo code types                                              |
| Promos        | GET    | `/api/promo/business/:business_id`                    | Get business promos                                                |
| Promos        | GET    | `/api/promo/:promo_id/business/:business_id/usage`    | Promo usage history                                                |
| Promos        | GET    | `/api/promo/business/:business_id/promos/usage`       | Usage history of all promos                                        |
| Promos        | POST   | `/api/promo/validate`                                 | Validate promo and calculate discount                              |
| Promos        | GET    | `/api/promo/users/:user_id/savings`                   | Total savings for user                                             |
| Google Places | POST   | `/api/places/nearby-search`                           | Nearby businesses via Places API                                   |

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



## Distribution

<p align="center"><b>Detailed Distribution</b></p>

<p align="center">
  <img width="902" height="130" alt="DetailedDistr"
       src="https://github.com/user-attachments/assets/f8ca1b0a-3e1e-4626-8327-d2e39d8bd77b" />
</p>

<p align="center"><b>Final Distribution</b></p>

<p align="center">
  <img width="744" height="172" alt="TotalDistr"
       src="https://github.com/user-attachments/assets/852b2bea-ca8b-455a-8651-3fecc1a8aaa8" />
</p>


## Chart of Issues & PRs

<p align="center">
  <img width="1012" height="520" alt="Chart"
       src="https://github.com/user-attachments/assets/829721aa-6f87-40b4-9abe-e6343098dc36" />
</p>



## User Stories


| Issue | Description | Area | Status |
|------:|-------------|------|--------|
| [#65](https://github.com/maxgol29/F25_CIS_G3_MEJ/issues/65) | Owner receives promo code when customer pays cash | Backend | Completed |
| [#64](https://github.com/maxgol29/F25_CIS_G3_MEJ/issues/64) | Customer avoids sharing location | Backend | Completed |
| [#63](https://github.com/maxgol29/F25_CIS_G3_MEJ/issues/63) | Owner receives money from online purchases | Backend | Completed |
| [#62](https://github.com/maxgol29/F25_CIS_G3_MEJ/issues/62) | Customer buys item via cash or online | Backend + Frontend | Completed |
| [#61](https://github.com/maxgol29/F25_CIS_G3_MEJ/issues/61) | Owner uses promo codes with POS dashboard | Backend + DB | Completed |
| [#60](https://github.com/maxgol29/F25_CIS_G3_MEJ/issues/60) | Customer navigates items and promo codes | Backend + Frontend | Completed |
| [#59](https://github.com/maxgol29/F25_CIS_G3_MEJ/issues/59) | Customer sees total savings from promos | Backend | Completed |
| [#58](https://github.com/maxgol29/F25_CIS_G3_MEJ/issues/58) | Customer changes address after relocation | Backend + Frontend | Completed |
| [#57](https://github.com/maxgol29/F25_CIS_G3_MEJ/issues/57) | Owner sees statistics to detect promo leaks | Backend | Completed |
| [#56](https://github.com/maxgol29/F25_CIS_G3_MEJ/issues/56) | Owner sees analytical stream of customers | Backend + DB | Completed |
| [#55](https://github.com/maxgol29/F25_CIS_G3_MEJ/issues/55) | Customer gets promo codes | Frontend | Completed |
| [#54](https://github.com/maxgol29/F25_CIS_G3_MEJ/issues/54) | Owner makes more profit | Backend | Completed |
| [#53](https://github.com/maxgol29/F25_CIS_G3_MEJ/issues/53) | Business-level improvement | Backend | Completed |

---

# Developed by:

<h2> Maxym Holubnychyi <br> Joseph Montez <br> Everett Getchell </h2>


---

University of the Incarnate Word (UIW), 2025







