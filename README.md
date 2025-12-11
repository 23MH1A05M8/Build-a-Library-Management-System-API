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

## 8. Database Schema

### Books Table

| Column           | Type   | Notes                       |
|-----------------|--------|-----------------------------|
| id               | INT    | Primary Key (PK)            |
| isbn             | STRING | Unique book ISBN            |
| title            | STRING | Book title                  |
| author           | STRING | Author name                 |
| category         | STRING | Genre                       |
| status           | ENUM   | available, borrowed, reserved, maintenance |
| total_copies     | INT    | Total physical copies       |
| available_copies | INT    | Updates on borrow/return    |

### Members Table

| Column            | Type          |
|------------------|---------------|
| id                | INT           |
| name              | STRING        |
| email             | STRING        |
| membership_number | STRING        |
| status            | ENUM: active/suspended |

### Transactions Table

| Field        | Type                  |
|-------------|-----------------------|
| id           | INT                  |
| book_id      | FK                   |
| member_id    | FK                   |
| borrowed_at  | TIMESTAMP            |
| due_date     | TIMESTAMP            |
| returned_at  | TIMESTAMP (nullable) |
| status       | active/returned/overdue |

### Fines Table

| Field          | Type                  |
|----------------|----------------------|
| id             | INT                  |
| member_id      | FK                   |
| transaction_id | FK                   |
| amount         | DECIMAL              |
| paid_at        | TIMESTAMP (nullable) |


### 9. Database Diagram

![Library Management System Schema](./assets/schema-diagram.png)

##  Book State Machine

| Current State | Action                 | New State |
|---------------|-----------------------|-----------|
| available     | borrow                | borrowed  |
| borrowed      | overdue after due-date| overdue   |
| borrowed      | return on time        | available |
| overdue       | return                | available |
| reserved      | borrow                | borrowed  |
| maintenance   | (blocked)             | —         |


## 10. State Machine Implementation (How It Works in Code)

When a book is borrowed:
status = "borrowed"
available_copies -= 1
due_date = borrowed_at + 14 days

When returned before due date:
status = "available"
available_copies += 1

When returned late:
Transaction becomes "overdue"
Fine = $0.50 * late_days

Member may be suspended (if >= 3 overdue books)

Before borrowing, system prevents:
- Borrowing if book is not available
- Borrowing if member has unpaid fines
- Borrowing if member already has 3 active transactions

## 11. Business Rules (Implemented)

-  Rule 1: Member can borrow max 3 books (checked before borrow request)  
-  Rule 2: Loan period = 14 days (set automatically on borrow)  
-  Rule 3: Overdue fine = $0.50 per day (generated at return)  
-  Rule 4: Member with unpaid fines cannot borrow (borrow API blocks request)  
-  Rule 5: Member suspended at 3+ overdue books (status auto-updates)  
-  Rule 6: Book cannot be borrowed if status != available (prevents double borrowing)  

## 12. API Endpoints

### I. Books API

- **POST /books** – Create a new book  
- **GET /books** – Get all books  
- **GET /books/:id** – Get one book  
- **GET /books/available** – List all available books  
- **PUT /books/:id** – Update book  
- **DELETE /books/:id** – Delete book  

### II Members API

- **POST /members** – Create member  
- **GET /members** – Get all members  
- **GET /members/:id** – Get one member  
- **GET /members/:id/borrowed** – Books currently borrowed by member  
- **PUT /members/:id** – Update member  
- **DELETE /members/:id** – Delete member  

### III Transactions API

- **POST /transactions/borrow** – Borrow a book  

Example request:
```json
{
  "book_id": 1,
  "member_id": 2
}
```

- **POST /transactions/:id/return** – Return a book and generate fine if overdue  
- **GET /transactions/overdue** – List overdue transactions  

### VI Fines API

- **POST /fines/:id/pay** – Mark fine as paid  

## 13. Postman Collection (Included)

This project includes a Thunder Client collection for testing.

**How to Use:**

1. Open VS Code  
2. Go to Thunder Client → Collections  
3. Click Import  
4. Choose `Library Management System API.postman_collection.json`  

Includes:  

- Book CRUD tests  
- Member CRUD tests  
- Borrow & return flows  
- Overdue detection  
- Fine payment tests  
- Suspension validation  

##  Conclusion

This project demonstrates:  

-  REST API design  
-  Real-world business logic  
-  State machine implementation  
-  Data integrity with Sequelize  
-  Automatic fine calculation  
-  Full test collection for reviewers  





