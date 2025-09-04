# Rental Management System API

A comprehensive REST API for managing rental properties, tenants, owners, agreements, and payments.

## Table of Contents
- [Installation](#installation)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
  - [Users](#users)
  - [Tenants](#tenants)
  - [Owners](#owners)
  - [Properties](#properties)
  - [Agreements](#agreements)
  - [Payments](#payments)
- [File Upload](#file-upload)
- [Authentication](#authentication)

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure your database in `config/sqlConfig.json`
4. Set up environment variables in `.env`
5. Start the server:
   ```bash
   npm start
   ```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    users_id INT AUTO_INCREMENT PRIMARY KEY,
    user_name VARCHAR(45),
    password LONGTEXT,
    role VARCHAR(45),
    role_id INT,
    profile_image LONGTEXT,
    is_deleted TINYINT DEFAULT 0
);
```

### Tenants Table
```sql
CREATE TABLE tenent (
    tenent_id INT AUTO_INCREMENT PRIMARY KEY,
    tenent_name VARCHAR(45),
    tenent_details VARCHAR(45),
    tenent_image LONGTEXT,
    is_deleted TINYINT DEFAULT 0
);
```

### Owners Table
```sql
CREATE TABLE owner (
    owner_id INT AUTO_INCREMENT PRIMARY KEY,
    owner_name VARCHAR(45),
    owner_details VARCHAR(45),
    owner_image LONGTEXT,
    is_deleted TINYINT DEFAULT 0
);
```

### Properties Table
```sql
CREATE TABLE property (
    property_id INT AUTO_INCREMENT PRIMARY KEY,
    property_name VARCHAR(45),
    property_details VARCHAR(45),
    property_images LONGTEXT,
    is_deleted TINYINT DEFAULT 0
);
```

### Agreements Table
```sql
CREATE TABLE agreement (
    agreement_id INT AUTO_INCREMENT PRIMARY KEY,
    agreement_no VARCHAR(45),
    property_id INT,
    owner_id INT,
    tenent_id INT,
    agreement_image LONGTEXT,
    start_date DATE,
    end_date DATE,
    rent_amount DECIMAL(10,2),
    deposit_amount DECIMAL(10,2),
    status TINYINT DEFAULT 1,
    is_deleted TINYINT DEFAULT 0
);
```

### Payments Table
```sql
CREATE TABLE payment (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    agreement_id INT,
    tenent_id INT,
    owner_id INT,
    amount_paid DECIMAL(10,2),
    payment_date DATETIME,
    status TINYINT DEFAULT 1,
    method VARCHAR(45),
    ss_upload LONGTEXT
);
```

## API Endpoints

### Users

#### List Users
```
GET /api/user/list
Query Parameters:
- searchKey (optional): Search in user_name and role
- page (optional): Page number (default: 0)
- size (optional): Page size (default: 10)
```

#### Add User
```
POST /api/user/add
Content-Type: multipart/form-data

Body:
- user_name: string
- password: string
- role: string
- role_id: number (optional)
- profile_image: file (optional)
```

#### Update/Delete User
```
PUT /api/user/editDelete
Content-Type: multipart/form-data

Body:
- users_id: number
- changedUpdatedValue: "edit" or "delete"
- user_name: string (optional)
- password: string (optional)
- role: string (optional)
- role_id: number (optional)
- profile_image: file (optional)
```

### Tenants

#### List Tenants
```
GET /api/tenant/list
Query Parameters:
- searchKey (optional): Search in tenent_name and tenent_details
- page (optional): Page number (default: 0)
- size (optional): Page size (default: 10)
```

#### Add Tenant
```
POST /api/tenant/add
Content-Type: multipart/form-data

Body:
- tenent_name: string
- tenent_details: string
- tenent_image: file (optional)
```

#### Update/Delete Tenant
```
PUT /api/tenant/editDelete
Content-Type: multipart/form-data

Body:
- tenent_id: number
- changedUpdatedValue: "edit" or "delete"
- tenent_name: string (optional)
- tenent_details: string (optional)
- tenent_image: file (optional)
```

### Owners

#### List Owners
```
GET /api/owner/list
Query Parameters:
- searchKey (optional): Search in owner_name and owner_details
- page (optional): Page number (default: 0)
- size (optional): Page size (default: 10)
```

#### Add Owner
```
POST /api/owner/add
Content-Type: multipart/form-data

Body:
- owner_name: string
- owner_details: string
- owner_image: file (optional)
```

#### Update/Delete Owner
```
PUT /api/owner/editDelete
Content-Type: multipart/form-data

Body:
- owner_id: number
- changedUpdatedValue: "edit" or "delete"
- owner_name: string (optional)
- owner_details: string (optional)
- owner_image: file (optional)
```

### Properties

#### List Properties
```
GET /api/property/list
Query Parameters:
- searchKey (optional): Search in property_name and property_details
- page (optional): Page number (default: 0)
- size (optional): Page size (default: 10)
```

#### Add Property
```
POST /api/property/add
Content-Type: multipart/form-data

Body:
- property_name: string
- property_details: string
- property_images: files (multiple, optional)
```

#### Update/Delete Property
```
PUT /api/property/editDelete
Content-Type: multipart/form-data

Body:
- property_id: number
- changedUpdatedValue: "edit" or "delete"
- property_name: string (optional)
- property_details: string (optional)
- property_images: files (multiple, optional)
```

### Agreements

#### List Agreements
```
GET /api/agreement/list
Query Parameters:
- searchKey (optional): Search in agreement_no, property_name, owner_name, tenent_name
- page (optional): Page number (default: 0)
- size (optional): Page size (default: 10)
```

#### Add Agreement
```
POST /api/agreement/add
Content-Type: multipart/form-data

Body:
- agreement_no: string
- property_id: number
- owner_id: number
- tenent_id: number
- start_date: string (YYYY-MM-DD)
- end_date: string (YYYY-MM-DD)
- rent_amount: number
- deposit_amount: number
- status: number (default: 1)
- agreement_image: file (optional)
```

#### Update/Delete Agreement
```
PUT /api/agreement/editDelete
Content-Type: multipart/form-data

Body:
- agreement_id: number
- changedUpdatedValue: "edit" or "delete"
- agreement_no: string (optional)
- property_id: number (optional)
- owner_id: number (optional)
- tenent_id: number (optional)
- start_date: string (optional)
- end_date: string (optional)
- rent_amount: number (optional)
- deposit_amount: number (optional)
- status: number (optional)
- agreement_image: file (optional)
```

### Payments

#### List Payments
```
GET /api/payment/list
Query Parameters:
- searchKey (optional): Search in agreement_no, tenent_name, owner_name, method
- page (optional): Page number (default: 0)
- size (optional): Page size (default: 10)
```

#### Get Payment Statistics
```
GET /api/payment/stats
Returns payment statistics including total payments, total amount, average amount, etc.
```

#### Add Payment
```
POST /api/payment/add
Content-Type: multipart/form-data

Body:
- agreement_id: number
- tenent_id: number
- owner_id: number
- amount_paid: number
- payment_date: string (YYYY-MM-DD HH:mm:ss, optional)
- status: number (default: 1)
- method: string
- ss_upload: file (optional)
```

#### Update/Delete Payment
```
PUT /api/payment/editDelete
Content-Type: multipart/form-data

Body:
- payment_id: number
- changedUpdatedValue: "edit" or "delete"
- agreement_id: number (optional)
- tenent_id: number (optional)
- owner_id: number (optional)
- amount_paid: number (optional)
- payment_date: string (optional)
- status: number (optional)
- method: string (optional)
- ss_upload: file (optional)
```

## File Upload

All file uploads are stored in the `uploads/` directory and are accessible via the `/uploads/` endpoint.

### Supported File Types
- Images: JPG, PNG, GIF, etc.
- Documents: PDF, DOC, DOCX, etc.

### File Naming
Files are automatically renamed with a timestamp prefix to avoid conflicts.

## Authentication

The system uses JWT tokens for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Login
```
POST /api/login/login
Body:
{
    "userName": "string",
    "loginPassword": "string"
}
```

## Response Format

All API responses follow this format:

### Success Response
```json
{
    "message": "Operation successful",
    "result": {...},
    "totalCount": 100
}
```

### Error Response
```json
{
    "message": "Error description"
}
```

## Environment Variables

Create a `.env` file with the following variables:

```env
PORT=5000
URL=http://localhost:5000/
pKey=your-jwt-secret-key
tokenexpireIn=24
```

## Database Configuration

Update `config/sqlConfig.json` with your database credentials:

```json
{
    "host": "localhost",
    "user": "root",
    "password": "your-password",
    "database": "rental_management_system",
    "connectionLimit": 50,
    "queueLimit": 0,
    "waitForConnections": true,
    "port": 3306,
    "dateStrings": true,
    "timezone": "local"
}
``` 