# 1. Library Management System API

A complete RESTful API for managing books, members, transactions, fines, and overdue workflows.
Built with Node.js, Express.js, MySQL, and Sequelize, this project demonstrates real-world backend engineering concepts such as state machines, business rule enforcement, and transactional workflows.

## 2. Features

- Full CRUD for Books & Members  
- Borrow/Return system with automatic due dates  
- Book state machine (available → borrowed → overdue → returned)  
- Overdue fine calculation ($0.50/day)  
- Borrowing limit (max 3 active loans per member)  
- Block members with unpaid fines  
- Auto-suspend members with 3+ overdue books  
- Overdue reporting endpoint  
- Postman collection for testing  

## 3. Setup Guide

### Prerequisites

- Node.js  
- Express.js  
- MySQL Server installed & running  
- Postman  

### 4. Clone Repository
```bash
git clone https://github.com/23MH1A05M8/Build-a-Library-Management-System-API
cd Build-a-Library-Management-System-API
```

### 5. Install Dependencies
```bash
npm install
```

### 6. Create `.env` File

Create a `.env` file in the project root:

```
DB_HOST=localhost
DB_USER=root
DB_PASS=yourpassword
DB_NAME=library_system
DB_DIALECT=mysql
PORT=3000
```

### 7. Start Server
```bash
npm run dev
```

Server runs at: `http://localhost:3000`

---

## 8. Database Schema

### Books Table

| Column           | Type    | Notes                                   |
|------------------|---------|-----------------------------------------|
| id               | INT     | Primary Key (PK)                        |
| isbn             | VARCHAR | Unique book ISBN                        |
| title            | VARCHAR | Book title                              |
| author           | VARCHAR | Author name                             |
| category         | VARCHAR | Genre                                   |
| status           | ENUM    | available, borrowed, reserved, maintenance |
| total_copies     | INT     | Total physical copies                   |
| available_copies | INT     | Updates on borrow/return                |
| createdAt        | DATETIME |                                        |

### Members Table

| Column            | Type    |
|------------------|---------|
| id                | INT     |
| name              | VARCHAR |
| email             | VARCHAR |
| membership_number | VARCHAR |
| status            | ENUM: active/suspended |
| createdAt         | DATETIME |

### Transactions Table

| Field        | Type                  |
|--------------|-----------------------|
| id           | INT                   |
| book_id      | FK                    |
| member_id    | FK                    |
| borrowed_at  | TIMESTAMP             |
| due_date     | TIMESTAMP             |
| returned_at  | TIMESTAMP (nullable)  |
| status       | active/returned/overdue |

### Fines Table

| Field          | Type                  |
|----------------|----------------------|
| id             | INT                  |
| member_id      | FK                   |
| transaction_id | FK                   |
| amount         | DECIMAL              |
| paid_at        | TIMESTAMP (nullable) |

---

## 9. Database Diagram

![Library Management System Schema](./assets/schema-diagram.png)

---

## Book State Machine

| Current State | Action                 | New State |
|---------------|------------------------|-----------|
| available     | borrow                 | borrowed  |
| borrowed      | overdue after due date | overdue   |
| borrowed      | return on time         | available |
| overdue       | return                 | available |
| reserved      | borrow                 | borrowed  |
| maintenance   | (blocked)              | —         |

---

## 10. State Machine Implementation (How It Works in Code)

When a book is borrowed:
- `status = "borrowed"`
- `available_copies -= 1`
- `due_date = borrowed_at + 14 days`

When returned before due date:
- `status = "available"`
- `available_copies += 1`

When returned late:
- Transaction becomes `overdue`
- Fine = `$0.50 * late_days`

Member may be suspended (if >= 3 overdue books)

Before borrowing, system prevents:
- Borrowing if book is not available  
- Borrowing if member has unpaid fines  
- Borrowing if member already has 3 active transactions  

---

## 11. Business Rules (Implemented)

- Rule 1: Member can borrow max 3 books  
- Rule 2: Loan period = 14 days  
- Rule 3: Overdue fine = $0.50/day  
- Rule 4: Member with unpaid fines cannot borrow  
- Rule 5: Member suspended at 3+ overdue books  
- Rule 6: Book cannot be borrowed if status != available  

---

## 12. API Endpoints

### I. Books API

- **POST /books** – Create a new book  
- **GET /books** – Get all books  
- **GET /books/:id** – Get one book  
- **GET /books/available** – List all available books  
- **PUT /books/:id** – Update book  
- **DELETE /books/:id** – Delete book  

### II. Members API

- **POST /members** – Create member  
- **GET /members** – Get all members  
- **GET /members/:id** – Get one member  
- **GET /members/:id/borrowed** – Books currently borrowed  
- **PUT /members/:id** – Update member  
- **DELETE /members/:id** – Delete member  

### III. Transactions API

- **POST /transactions/borrow** – Borrow a book  
Example request:
```json
{
  "book_id": 1,
  "member_id": 2
}
```

- **POST /transactions/:id/return** – Return book (fine if overdue)  
- **GET /transactions/overdue** – List overdue transactions  

### IV. Fines API

- **POST /fines/:id/pay** – Mark fine as paid  

---

## 13. Postman Collection (Included)

This project includes a Postman collection for testing.

**How to Use:**
1. Open Postman  
2. Go to Collections  
3. Click **Import**  
4. Select: `Library Management System API.postman_collection.json`

Includes:

- Book CRUD  
- Member CRUD  
- Borrow & return flows  
- Overdue detection  
- Fine payment tests  
- Suspension logic verification  

---

# 14. Testing Overdue, Fines, and Suspension Rules

To verify the system rules for overdue books, fine calculation, and member suspension, we manually updated the `due_date` values directly in MySQL.  
These updates were done **only for verification and testing**, because Postman cannot modify `due_date` after borrowing.

### SQL Commands Used

#### 1. Make a specific transaction overdue by 10 days (Transaction ID = 5):

```sql
UPDATE transactions
SET due_date = DATE_SUB(NOW(), INTERVAL 10 DAY)
WHERE id = 5;
```

#### 2. Make all transactions of a specific member overdue by 10 days (Member ID = 4):

```sql
UPDATE transactions
SET due_date = DATE_SUB(NOW(), INTERVAL 10 DAY)
WHERE member_id = 4;
```

### These were used to verify:

- Overdue penalty = **$0.50 per day**
- Member with unpaid fines **cannot borrow**
- Member becomes **suspended** when having **3 or more overdue books**

> **Note:**  
> These SQL updates are only for testing and not part of normal API usage.

---

## Conclusion

This project demonstrates:  

- REST API design  
- Real-world business logic  
- State machine implementation  
- Data integrity with Sequelize  
- Automatic fine calculation  
- Full test collection for reviewers  

