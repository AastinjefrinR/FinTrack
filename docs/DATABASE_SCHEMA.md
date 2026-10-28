# FinTrack — Database Relationship & Schema Documentation

## 1. Entity-Relationship Diagram (ERD)

```mermaid
erDiagram
    USER ||--|| USER_SETTINGS : configures
    USER ||--o{ TRANSACTION : records
    USER ||--o{ BUDGET : sets
    USER ||--o{ SAVINGS_GOAL : pursues

    USER {
        ObjectId _id PK
        string name
        string email UK
        string password "hashed with bcrypt"
        string currency "default INR"
        date createdAt
        date updatedAt
    }

    USER_SETTINGS {
        ObjectId _id PK
        ObjectId user FK
        string currency
        number monthlyIncomeTarget
        number monthlyBudgetLimit
        string theme "light | dark"
        number spendingAlertThreshold "default 80%"
        boolean notificationsEnabled
        string dateFormat
    }

    TRANSACTION {
        ObjectId _id PK
        ObjectId user FK
        string type "income | expense"
        number amount "rounded 2 decimals"
        string category
        string description
        date date "indexed"
        string paymentMethod
        string notes
        date createdAt
    }

    BUDGET {
        ObjectId _id PK
        ObjectId user FK
        string category
        number monthlyLimit
        number month "1-12"
        number year "2024-2030"
        date createdAt
    }

    SAVINGS_GOAL {
        ObjectId _id PK
        ObjectId user FK
        string name
        number targetAmount
        number currentAmount
        string category
        date deadline
        string status "In Progress | Completed | Paused"
        array contributions "history ledger"
        date createdAt
    }
```

## 2. Schema Specifications & Indexes

### A. User Schema
- **Purpose**: Authenticates users and isolates ownership of financial data.
- **Key Constraints**:
  - `email`: Required, unique, trimmed, lowercase regex validated.
  - `password`: Excluded by default (`select: false`) so password hashes are never exposed in queries.
  - Salted with bcrypt (10 rounds) automatically via `pre('save')` middleware.

### B. Transaction Schema
- **Purpose**: Records cash inflows and outflows.
- **Indexes**:
  - Compound Index: `{ user: 1, date: -1 }` (optimizes date-based dashboard queries)
  - Compound Index: `{ user: 1, type: 1, date: -1 }` (optimizes income/expense filtering)
- **Validation**:
  - `amount`: Number > 0, automatically formatted to 2 decimals using `Math.round((v + Number.EPSILON) * 100) / 100`.

### C. Budget Schema
- **Purpose**: Defines spending ceilings per category per calendar month.
- **Unique Compound Index**:
  - `{ user: 1, category: 1, month: 1, year: 1 }` (enforces uniqueness so duplicate budgets cannot be created for the same category in the same month).

### D. SavingsGoal Schema
- **Purpose**: Tracks long-term target savings with deadlines and historical deposits/withdrawals.
- **Nested Contribution Schema**:
  - `amount`: Number
  - `type`: 'deposit' | 'withdrawal'
  - `date`: Date
  - `note`: String
- **Status State Machine**:
  - Automatically flips to `'Completed'` when `currentAmount >= targetAmount`.
