# FinTrack — System Architecture & Data Flow

## 1. System Overview

FinTrack is an enterprise-grade full-stack personal finance application architected with a decoupled Client-Server model.

```mermaid
flowchart TD
    subgraph ClientLayer ["Client Layer (React 18 + Vite + Bootstrap 5)"]
        UI["React SPA Components<br/>(Dashboard, Ledger, Budgets, Goals, Reports)"]
        JQ["Isolated jQuery Smart Widget<br/>(DOM Calculator & Toast Alerts)"]
        State["React Context & State<br/>(AuthContext, ThemeContext)"]
        Axios["Axios HTTP Client<br/>(JWT Bearer Interceptors)"]
        UI --> State
        UI -.-> JQ
        State --> Axios
    end

    subgraph APILayer ["Server Layer (Node.js + Express.js REST API)"]
        Server["Express App (server.js)<br/>Port 5000"]
        MW["Middleware Pipeline<br/>(CORS, Rate Limiter, Auth JWT, Error Handler)"]
        Controllers["Controllers<br/>(Auth, Tx, Budget, Goals, Reports, Insights)"]
        Services["Domain Engine Services<br/>(Health Score, Insights Engine, Demo Seeder)"]
        
        Axios -->|HTTP/REST with JWT| Server
        Server --> MW
        MW --> Controllers
        Controllers --> Services
    end

    subgraph PersistenceLayer ["Database Layer (MongoDB + Mongoose ODM)"]
        Mongoose["Mongoose Schemas & ODM Validation"]
        MongoDB[("MongoDB Database<br/>(Atlas / Local / Standalone Engine)")]
        
        Controllers --> Mongoose
        Services --> Mongoose
        Mongoose --> MongoDB
    end
```

## 2. Authentication & Authorization Flow

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant ReactClient as React Client
    participant AuthAPI as Express Auth Router
    participant JWT as JWT & Bcrypt Engine
    participant DB as MongoDB

    User->>ReactClient: Enters credentials (email, password)
    ReactClient->>AuthAPI: POST /api/auth/login
    AuthAPI->>DB: Query User by email
    DB-->>AuthAPI: User record with hashed password
    AuthAPI->>JWT: bcrypt.compare(plainPassword, hash)
    JWT-->>AuthAPI: Credentials Match (True)
    AuthAPI->>JWT: sign({ id, name, email }, JWT_SECRET, 7d)
    JWT-->>AuthAPI: Signed JWT Token
    AuthAPI-->>ReactClient: 200 OK + { token, user }
    ReactClient->>ReactClient: Store token in localStorage
    ReactClient->>AuthAPI: GET /api/reports/dashboard (Bearer Token)
    AuthAPI->>DB: Aggregates scoped exclusively to user: req.user._id
    DB-->>AuthAPI: Financial metrics
    AuthAPI-->>ReactClient: Dashboard summary
```

## 3. Technology Stack Justification

| Technology | Role | Justification |
| :--- | :--- | :--- |
| **HTML5** | Semantic Document Structure | Native semantic tags (`<header>`, `<nav>`, `<main>`, `<aside>`, `<footer>`) ensure SEO readability and screen reader accessibility. |
| **CSS3** | Visual Design & Animations | Custom CSS variables for emerald/navy SaaS theming, dark mode transitions, and `@keyframes` animations. |
| **Bootstrap 5** | Responsive Layout Grid | High-performance mobile-first flexbox grid, accessible modals, tooltips, and badges. |
| **JavaScript (ES6+)** | Logic & Mathematics | Strict calculation of savings rates, budget thresholds, and monetary formatting without floating-point errors. |
| **ReactJS (v18)** | Reactive User Interface | Component modularity, React Router v6 navigation, declarative Context API, and Virtual DOM rendering. |
| **jQuery (v3.7)** | Isolated UI Demonstrator | Isolated floating financial calculator and animated notification toasts demonstrating safe coexistence with React without DOM conflicts. |
| **Node.js & Express.js** | Backend API Runtime | Lightweight, non-blocking asynchronous event loop with modular router/controller/middleware separation. |
| **MongoDB & Mongoose** | Persistent Storage | Document model naturally supports hierarchical financial records, nested contribution arrays, and compound indexes. |
| **JWT & Bcrypt** | Security Engine | Stateless cryptographic authentication with salted password hashing (10 salt rounds). |
