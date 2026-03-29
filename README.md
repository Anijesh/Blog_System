# Scalable Blog Platform 

A high-performance, full-stack blogging platform engineered with a heavily optimized RESTful API backend and a dynamic, reactive frontend dashboard. 

This project was built from the ground up to prioritize **security, rapid data delivery, and modular scalability**, utilizing modern architectural patterns to handle user authentication, strict role-based data access, and continuous frontend synchronization.

---

## 🚀 Built With

### Backend Stack (Core API)
- **Python / Flask**: Lightweight, robust web framework.
- **Flask-RESTful**: Class-based modularity for strictly modeled REST architectural patterns.
- **SQLAlchemy (ORM)**: Clean database modeling and migration handling (PostgreSQL / SQLite ready).
- **Flask-JWT-Extended & Bcrypt**: Secure token issuing, request validation, and irreversible password hashing.
- **Flasgger (Swagger)**: Dynamic, inline OpenAPI 2.0 API documentation.

### Frontend Stack (Supportive UI)
- **React.js 19 (Vite)**: Lightning-fast rendering and build optimization.
- **SWR (Stale-While-Revalidate)**: Deep component-level API caching for optimistic UI rendering and minimal network latency.
- **Tailwind CSS + framer-motion**: Premium, scalable design tokens and fluid micro-animations.
- **React-Router-DOM**: Secure protected-route wrapper for Dashboard logic.

---

## 🔥 Core Features

### 1. Robust API Backend & Role-Based Security
- **JWT Standard Authentication**: Generates secure access tokens injected with custom claims (User IDs & Roles) for stateless session handling.
- **Cryptographic Hashing**: All passwords are irreversibly hashed and salted via `bcrypt` prior to database commits, protecting user credentials natively.
- **Role-Based Access Control (RBAC)**: Strictly enforces API boundaries. A standard `user` can only mutate or delete their own resources, while an `admin` role holds elevated API credentials to forcefully prune malicious users or immediately delete any post.
- **RESTful Architecture**: Employs rigorous request sanitization, intercepting missing schemas with explicit `400 Bad Request` or `404 Not Found` payload messages.

### 2. Full CRUD Workflow Integration
- **Protected Dashboards**: A fully reactive React frontend requiring JWT Bearer token authentication to access the platform feeds and profiles.
- **Entity Management**: Complete visual interfaces mapping directly to the underlying `POST`, `GET`, `PUT`, and `DELETE` API methods for Posts, Comments, and Likes.
- **Optimistic UI Interactions**: Validates API response codes immediately natively in the React layer via localized notifications, ensuring error/success feedback is instantly synced to the user without jarring page reloads.

### 3. API Versioning 
The backend routes are deliberately decoupled into a cleanly versioned router setup (`/api/v1/`) to guarantee future feature expansions do not break existing integrations.

---

## 📖 Interactive API Documentation

All Controller methods globally include embedded OpenAPI 2.0 YAML specification definitions, natively rendering a fully interactive Swagger UI dashboard for rapid endpoint testing.

## ▶️ How to Test APIs (Swagger)

1. Start the backend server.
2. Open Swagger UI: http://localhost:5001/apidocs
3. Login using `/api/v1/auth/login` to get JWT token.
4. Click the **Authorize** button.
5. Enter: `Bearer <your_token>`
6. Now you can test protected APIs like creating posts, comments, and likes.

![Swagger API Documentation](./backend/Swagger/Screenshot%202026-03-29%20at%208.19.48%E2%80%AFPM.png)

---

## 🏗️ Scalability & Deployment Architecture

This monolithic implementation is specifically architected to be effortlessly scaled horizontally for large-volume traffic instances:

1. **Stateless Authentication Protocol (JWT)**: Because user sessions are not stored in server memory natively, this unified Flask app can be instantly cloned and scaled horizontally across multiple instances behind a **Load Balancer** (like AWS ALB or NGINX). It perfectly handles split routing because backend workers don't need to synchronously verify session states in RAM.
2. **Database Sharding Readiness**: SQLAlchemy abstractly queries relations, making the migration to heavy-duty distributed databases (like horizontally-scaled PostgreSQL partitions) trivial. Heavy `GET` requests (`/posts`) can be effortlessly routed to dedicated Read-Replicas, while standard `POST`/`PUT` operations write firmly to the Master Database.
3. **Decoupled Architecture (Microservices potential)**: Because the React Frontend solely consumes data over JSON API constraints (`/api/v1/`), standard application logic can easily be sheared off into distinct microservices in the future (e.g. decoupling an `Auth Server` instance from the core `Content` application layer).
4. **CDN Offloading**: The entire React build bundle is 100% static, meaning it can permanently live on edge CDNs (like Cloudflare or Vercel), shielding the Python API server from serving heavy DOM HTML and static asset requests.

---

## ⚙️ Local Development Setup

### Backend (Server)
Navigate to the backend directory, initialize the environment, and spin up the server on port 5001.
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python3 run.py
```

### Frontend (Client UI)
Navigate to the frontend directory, install the required packages, and launch Vite.
```bash
cd frontend
npm install
npm run dev
```
