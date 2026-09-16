# URL Shortener Project Overview

## 1. Project Summary
This project is a full-stack URL shortening service built with Node.js and Express. It allows users to:

- create an account
- log in securely
- generate short URLs from long links
- optionally set a custom alias
- set expiration dates for shortened links
- view analytics such as click count
- access their own URL history

The system also supports redirecting a short code back to the original long URL and uses Redis caching for faster lookup performance.

---

## 2. Business Problem Solved
The app addresses a common need: compressing long URLs into short shareable links while keeping some traceability and analytics. In real usage, this is useful for:

- marketing campaigns
- social media sharing
- internal product links
- tracking engagement through click counts

---

## 3. Technology Stack
### Backend
- Node.js
- Express.js
- PostgreSQL
- Redis
- JWT for authentication
- bcrypt for password hashing
- express-validator for input validation
- express-rate-limit for API protection

### Frontend
- Plain HTML
- CSS
- Vanilla JavaScript
- Served from the Express app via static files in the public folder

### Infrastructure / runtime assumptions
- App runs on port 3000 by default
- PostgreSQL runs locally at localhost:5432
- Redis runs locally at localhost:6379
- environment variables are stored in .env

---

## 4. Project Architecture
The project follows a layered architecture that separates concerns cleanly:

### a) Route Layer
Handles incoming HTTP requests and maps them to controller actions.

Examples:
- src/routes/authRoutes.js
- src/routes/urlRoutes.js

Responsibilities:
- define API paths
- attach middleware
- delegate to controllers

### b) Controller Layer
Handles request/response logic and transforms HTTP requests into business operations.

Examples:
- src/controllers/authController.js
- src/controllers/urlController.js

Responsibilities:
- read body or params
- call services
- return JSON or redirect responses
- handle common HTTP status codes

### c) Service Layer
Contains the actual business logic.

Examples:
- src/services/authService.js
- src/services/urlService.js

Responsibilities:
- user registration and login logic
- password validation
- JWT creation
- short code generation
- URL creation and redirect logic
- click tracking and analytics

### d) Repository Layer
Responsible for database access.

Examples:
- src/repositories/userRepository.js
- src/repositories/urlRepository.js

Responsibilities:
- SQL queries against PostgreSQL
- CRUD operations
- retrieval of user and URL data

### e) Configuration Layer
Contains environment-specific configuration.

Examples:
- src/config/db.js
- src/config/redis.js

Responsibilities:
- database connection pooling
- Redis client setup
- environment variable wiring

### f) Middleware Layer
Used for cross-cutting concerns.

Examples:
- src/middlewares/authMiddleware.js
- src/middlewares/rateLimitMiddleware.js
- src/middlewares/validationMiddleware.js

Responsibilities:
- JWT verification
- request validation
- rate limiting

---

## 5. Core Functional Flow

### User Registration
1. User submits email and password through the frontend.
2. API calls /api/v1/auth/register.
3. Controller receives the payload.
4. Service checks whether the user already exists.
5. If not, password is hashed with bcrypt.
6. A new user is created in PostgreSQL.
7. Response returns created user data.

### User Login
1. User submits email and password.
2. API calls /api/v1/auth/login.
3. Service looks up the user by email.
4. Password is compared against the stored hash using bcrypt.
5. If valid, a JWT token is created.
6. Token is returned to the client and stored locally in the browser.

### Create Short URL
1. Authenticated user sends long URL plus optional custom alias and expiration date.
2. Request hits /api/v1/urls/.
3. Middleware validates the request.
4. Service checks whether alias already exists.
5. If no alias is provided, it generates a random short code using nanoid.
6. A record is inserted into the urls table in PostgreSQL.
7. A short URL is returned to the frontend.

### Redirect Long URL
1. User accesses /{shortCode}.
2. Controller calls urlService.getOriginalUrl(shortCode).
3. Service checks Redis first for the short code.
4. If not found, it queries PostgreSQL.
5. If the link is expired, it throws an error.
6. The original URL is returned and the click counter is incremented.

### View Stats
1. User requests /api/v1/urls/stats/:shortCode.
2. Service fetches the record from PostgreSQL.
3. Response includes fields like click_count, created_at, expires_at, and original_url.

---

## 6. Data Model
This app uses PostgreSQL tables for storing application data.

### Users table
Likely stores:
- id
- email
- password_hash
- created_at

### URLs table
Likely stores:
- id
- original_url
- short_code
- click_count
- created_at
- expires_at
- user_id

The project uses user_id to associate links with the user who created them.

---

## 7. Caching Strategy
Redis is used as a fast lookup cache for shortened URLs.

Flow:
- If a short code is in Redis, the app serves the original URL immediately.
- It increments the click count.
- If not in Redis, it queries PostgreSQL and stores the result in Redis for one hour.

This improves application speed and reduces repeated database hits for popular short links.

---

## 8. Security Considerations
The app includes several security basics:

- password hashing with bcrypt
- JWT-based authentication
- protected routes using a middleware that checks authorization headers
- rate limiting to reduce abuse
- input validation for URL creation
- CORS enabled for browser-based API use
- Helmet for security headers

Important note:
The current app is a strong learning project, but it is not a production-grade security system by itself. For a real production deployment, it would also need things like:

- stronger API auth/session policies
- role-based access control
- HTTP-only cookies instead of localStorage tokens
- more robust validation and sanitization
- monitoring and alerting
- encryption at rest / secrets management
- proper deployment hardening

---

## 9. Methodology Used in the Project
This project demonstrates a practical, modular software development methodology:

### a) Layered architecture
The code is separated into route, controller, service, repository, and config layers. This is a classic clean-architecture style for Node.js backends because it keeps the app organized and testable.

### b) Separation of concerns
Each layer owns a specific responsibility:
- routes handle HTTP
- controllers handle request/response
- services contain business rules
- repositories manage database access

### c) Stateless service logic
Core business tasks are implemented as functions instead of embedding logic directly in the route handler.

### d) Validation-first design
The app validates URL input before creating records, helping prevent bad data.

### e) Performance-aware design
Redis caching is added to reduce database load and improve redirect speed.

### f) MVP-oriented development
This is a functional MVP for a URL shortener rather than a large enterprise system. It focuses on the essentials: auth, links, redirects, and basic analytics.

---

## 10. What I Would Say in an Interview
### Concise technical summary
"I built a URL shortener using Node.js and Express with PostgreSQL as the system of record and Redis for caching. The app includes user authentication with JWT and bcrypt, URL creation with optional aliases and expiration dates, redirect logic, and a basic stats dashboard. The design follows a layered MVC-like structure with routes, controllers, services, and repositories to keep the code organized and maintainable."

### Strengths to highlight
- clear separation of concerns
- backend modularity
- practical use of caching for performance
- working API design
- secure password handling and auth flow

### Good interview talking points
- I intentionally separated business logic from database logic.
- I used Redis for common reads to optimize redirect time.
- I handled validation and rate limiting to improve robustness.
- I designed the project to be easy to extend with more features like analytics dashboards, admin tools, or QR codes.

---

## 11. Project Structure Overview
Key directories and files:

- src/app.js — app setup, middleware, static frontend
- src/routes/authRoutes.js — auth endpoints
- src/routes/urlRoutes.js — URL operations
- src/controllers/authController.js — auth request handling
- src/controllers/urlController.js — URL request handling
- src/services/authService.js — login/register business logic
- src/services/urlService.js — URL generation and redirect logic
- src/repositories/userRepository.js — database access for users
- src/repositories/urlRepository.js — database access for URLs
- src/config/db.js — PostgreSQL connection
- src/config/redis.js — Redis connection
- src/middlewares/authMiddleware.js — JWT authorization guard
- src/middlewares/rateLimitMiddleware.js — request protection
- src/validators/urlValidator.js — validation rules
- public/index.html — frontend UI
- public/app.js — frontend logic
- public/styles.css — frontend styling

---

## 12. Challenges and Improvements
Areas that could be improved in a production version:

- use database migrations instead of manual schema management
- add tests (unit + integration)
- add a proper frontend framework like React
- move token storage to secure cookies
- add admin/user roles
- add metrics and observability
- improve error handling and API response consistency
- introduce database transactions for critical operations

---

## 13. Final Interview Takeaway
This project shows that I understand the full software lifecycle for a small backend-driven application: requirements, architecture, logic design, API development, database integration, security, and frontend integration. It is a solid demonstration of practical backend engineering and application design thinking.

If asked in an interview, I would frame it as:

"I built a functional URL shortener application that connects a Node.js backend to PostgreSQL and Redis, includes authentication and analytics, and follows a layered design that separates concerns while keeping the project simple, scalable, and understandable."
