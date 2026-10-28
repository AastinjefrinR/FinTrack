# FinTrack — Comprehensive Test Case Suite & Verification Table

This document details the functional and security test cases executed across the FinTrack application, covering Authentication, Transactions, Budgets, Savings Goals, Financial Health Score, CSV Exports, and Cross-User Data Isolation.

| Test ID | Module | Description | Input / Precondition | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-AUTH-01** | Authentication | User Registration | Valid name, email, password (>=6 chars), currency | 201 Created, returns signed JWT token, user object (password excluded) | 201 Created, token returned, password omitted | **PASS** |
| **TC-AUTH-02** | Authentication | Duplicate Email Rejection | Attempt to register with already registered email | 400 Bad Request, "An account with this email address already exists" | 400 Bad Request returned with descriptive error | **PASS** |
| **TC-AUTH-03** | Authentication | Password Length Validation | Register with password < 6 characters | 400 Bad Request, "Password must be at least 6 characters long" | 400 Bad Request returned | **PASS** |
| **TC-AUTH-04** | Authentication | Valid Login | Correct email and password | 200 OK, returns new JWT token and user profile | 200 OK, authentication successful | **PASS** |
| **TC-AUTH-05** | Authentication | Invalid Credentials Login | Wrong password or nonexistent email | 401 Unauthorized, "Invalid email or password" | 401 Unauthorized returned | **PASS** |
| **TC-AUTH-06** | Authentication | Rate Limiting | 100+ requests to `/api/auth/login` within 15 min | 429 Too Many Requests, blocking brute-force attacks | 429 response triggered after limit exceeded | **PASS** |
| **TC-TX-01** | Transactions | Record Income Transaction | Type: income, amount: 50,000, category: "Salary" | 201 Created, transaction saved, scoped to authenticated user | 201 Created, balance updated | **PASS** |
| **TC-TX-02** | Transactions | Record Expense Transaction | Type: expense, amount: 3,500, category: "Food & Dining" | 201 Created, expense saved, balance deducted by 3,500 | 201 Created, dynamic balance updated | **PASS** |
| **TC-TX-03** | Transactions | Non-Positive Amount Validation | Amount: -500 or 0 | 400 Bad Request, "Amount must be a positive number" | 400 Bad Request returned | **PASS** |
| **TC-TX-04** | Transactions | Edit Existing Transaction | Update amount from 3,500 to 4,200 | 200 OK, updated in MongoDB, KPIs dynamically recomputed | 200 OK, new total reflected immediately | **PASS** |
| **TC-TX-05** | Transactions | Delete Transaction | Delete confirmation modal confirmed | 200 OK, document removed from MongoDB | 200 OK, record removed | **PASS** |
| **TC-TX-06** | Transactions | Cross-User Isolation (IDOR) | User B attempts to access or delete User A's transaction | 404 Not Found / Unauthorized, User A record untouched | 404 Not Found returned; zero leakage | **PASS** |
| **TC-TX-07** | Transactions | CSV Ledger Export | Click "Export to CSV" | Browser triggers download of `FinTrack_Transactions_*.csv` with formatted headers | CSV generated with date, category, amount, payment method | **PASS** |
| **TC-BDG-01** | Budgets | Create Category Limit | Category: "Shopping", monthlyLimit: 8,000 | 200 OK, stored with month & year | 200 OK, budget created | **PASS** |
| **TC-BDG-02** | Budgets | 80% Caution Alert Trigger | Spent 6,800 on 8,000 budget (85% usage) | Status set to "warning", amber progress bar, alert generated | Warning alert generated in Insights & Budgets page | **PASS** |
| **TC-BDG-03** | Budgets | 100% Exceeded Alert Trigger | Spent 8,500 on 8,000 budget (106% usage) | Status set to "exceeded", red progress bar, exceeded alert | Danger alert triggered and Health Score penalized | **PASS** |
| **TC-BDG-04** | Budgets | Dynamic Remaining Calculation | Limit: 10,000, Spent: 4,000 | Remaining = 6,000 dynamically calculated from Transaction table | Exact remaining calculation confirmed | **PASS** |
| **TC-SVG-01** | Savings Goals | Create Savings Goal | Name: "Emergency Fund", Target: 150,000, Deadline: +90d | 201 Created, status: "In Progress" | 201 Created, displayed on dashboard | **PASS** |
| **TC-SVG-02** | Savings Goals | Deposit Contribution | Add 25,000 deposit with note | Current amount increased to 25,000, progress % recalculated | Amount updated, contribution ledger entry added | **PASS** |
| **TC-SVG-03** | Savings Goals | Withdrawal Contribution | Withdraw 5,000 from accumulated savings | Current amount reduced, validation prevents overdraft | Balance safely reduced | **PASS** |
| **TC-SVG-04** | Savings Goals | Auto Completion State | Deposit brings current >= target | Status automatically changes to "Completed" | Status badge changed to "Completed" | **PASS** |
| **TC-HLT-01** | Health Score | Transparent Rubric Evaluation | Income: 75,000, Expense: 42,000, Budgets adhered | Score computed across 4 pillars: Savings Rate, Budget, Ratio, Goals | Grade: "Good/Excellent" with itemized points breakdown | **PASS** |
| **TC-JQR-01** | jQuery Feature | Isolated DOM Calculator | Click floating bubble, toggle SIP/EMI sliders | jQuery `slideToggle()` opens panel, calculates formulas without Virtual DOM conflict | Smooth slideToggle and live mathematical estimation | **PASS** |
| **TC-JQR-02** | jQuery Feature | Animated Toast Banner | Click "Toast Demo" or complete financial action | jQuery dynamically appends element to body, calls `slideDown()`, auto-dismisses | Toast animates and removes cleanly | **PASS** |
| **TC-DEMO-01**| Demo Mode | 1-Click Sample Data Seeding | Click "Demo Data" in navbar | Clears prior user sample data and inserts comprehensive realistic transactions, budgets, goals | Dashboard immediately populated with rich charts | **PASS** |
