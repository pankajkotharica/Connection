# Organization Management API Documentation

## Overview
API for managing organization members with Bhag-based access control. Members can be created by admins and updated by users to add nagar_code and basti_code.

## Base URL
`/api/organization`

## Authentication
Some endpoints require authentication via login endpoint.

## Endpoints

### 1. Login
**POST** `/api/organization/login`

Authenticate a user and get their bhag_code.

**Request Body:**
```json
{
  "username": "admin_b01",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "bhag_code": "B01"
}
```

---

### 2. Create Member (Admin Only)
**POST** `/api/organization/members`

Create a new member. Bhag code is assigned by admin.

**Request Body:**
```json
{
  "member_id": "M102",
  "reg_date": "2024-01-15",
  "first_name": "Jane",
  "last_name": "Smith",
  "gender": "Female",
  "address": "123 Main Street",
  "city": "Nagpur",
  "bhag_code": "B01",
  "email": "jane@example.com",
  "phone": "9876543210",
  "age": 30,
  "occupation": "Engineer",
  "remark": "Registered via website"
}
```

**Required Fields:**
- `member_id` (unique)
- `first_name`
- `last_name`
- `bhag_code` (assigned by admin)

**Optional Fields:**
- `reg_date` (defaults to current date if not provided)
- `gender`
- `address`
- `city`
- `email`
- `phone`
- `age`
- `occupation`
- `remark`

**Response:**
```json
{
  "success": true,
  "data": [{
    "id": 1,
    "member_id": "M102",
    "first_name": "Jane",
    ...
  }]
}
```

---

### 3. Get Members by Bhag Code
**GET** `/api/organization/dashboard?bhag=B01`

Get all members for a specific bhag_code. Users can see members in their assigned bhag.

**Query Parameters:**
- `bhag` (required) - The bhag_code to filter by

**Response:**
```json
[
  {
    "id": 1,
    "member_id": "M101",
    "reg_date": "2024-01-15",
    "first_name": "John",
    "last_name": "Doe",
    "gender": "Male",
    "address": "456 Oak Ave",
    "city": "Nagpur",
    "bhag_code": "B01",
    "email": "john@example.com",
    "phone": "1234567890",
    "age": 25,
    "occupation": "Developer",
    "remark": "Active member",
    "nagar_code": null,
    "basti_code": null,
    "activation": "Pending",
    "activation_dt": null,
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-01-15T10:00:00Z"
  }
]
```

---

### 4. Get Single Member
**GET** `/api/organization/members/<member_id>`

Get details of a single member by ID.

**Response:**
```json
{
  "id": 1,
  "member_id": "M101",
  "first_name": "John",
  ...
}
```

---

### 5. Update Member (User Updates)
**POST** `/api/organization/update/<member_id>`

Users can update nagar_code, basti_code, and activation status for members.

**Request Body:**
```json
{
  "nagar_code": "N001",
  "basti_code": "B001",
  "activation": "Contacted"
}
```

**Updatable Fields:**
- `nagar_code` - Nagar code assigned by user
- `basti_code` - Basti code assigned by user
- `activation` - Activation status (Pending, Contacted, etc.)

**Note:** If `activation` is set to "Contacted", `activation_dt` will be automatically set to the current timestamp.

**Response:**
```json
{
  "success": true,
  "data": [{
    "id": 1,
    "nagar_code": "N001",
    "basti_code": "B001",
    "activation": "Contacted",
    "activation_dt": "2024-01-15 14:30:00",
    ...
  }]
}
```

---

### 6. Health Check
**GET** `/api/organization/health`

Check if the API is running.

**Response:**
```json
{
  "status": "ok"
}
```

## Member Data Fields

All fields available in the members table:

| Field Name | Database Column | Description | Editable By |
|------------|----------------|-------------|-------------|
| Member ID | `member_id` | Unique member identifier | Admin only |
| Date | `reg_date` | Registration date | Admin only |
| First Name | `first_name` | Member's first name | Admin only |
| Last Name | `last_name` | Member's last name | Admin only |
| Gender | `gender` | Member's gender | Admin only |
| Address | `address` | Member's address | Admin only |
| City | `city` | Member's city | Admin only |
| BHAG | `bhag_code` | Area code assigned by admin | Admin only |
| Email | `email` | Member's email | Admin only |
| Phone | `phone` | Member's phone number | Admin only |
| Age | `age` | Member's age | Admin only |
| Occupation | `occupation` | Member's occupation | Admin only |
| Activation | `activation` | Activation status | User |
| Activation Dt | `activation_dt` | Activation date/time | Auto-set |
| Remark | `remark` | Additional remarks | Admin only |
| Nagar Code | `nagar_code` | Nagar code | User |
| Basti Code | `basti_code` | Basti code | User |

## Error Responses

All endpoints return errors in the following format:

```json
{
  "error": "Error message here"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

## CORS

All endpoints include CORS headers to allow cross-origin requests:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: GET, POST, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type`

