# Quick Storage Project

A complete application for file storage and management with user authentication and role-based access. The project implements the MVC architecture and includes both a backend and frontend.

---

## Table of Contents

1. [Features](#features)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Test Users](#test-users)
5. [API Endpoints](#api-endpoints)
6. [Database Structure](#database-structure)
7. [License](#license)

---

## Features

### File Management

-   Upload files with options for:
    -   Public or private access.
    -   Password protection.
    -   Expiration dates and download limits.
-   Secure file sharing via links.

### User Authentication

-   JWT-based authentication for secure sessions.
-   Role-based access control (Admin and Regular Users).

### Admin Dashboard

-   Approve or reject user registrations.
-   Manage all users (activate, deactivate, or remove accounts).
-   View system logs and activity reports.

### Security

-   Password-protected files.
-   Activity and access logging for audit trails.
-   Authorization for sensitive actions.

---

## Installation

### Prerequisites

-   **Node.js**: Version 16 or higher.
-   **SQLite**: For database management.

### Steps

1. Clone the repository:
    ```bash
    git clone https://github.com/sergiusz-x/quick-storage.git
    cd quick-storage
    ```
2. Install dependencies for the backend:
    ```bash
    cd backend
    npm install
    ```
3. Install dependencies for the frontend:
    ```bash
    cd ../frontend
    npm install
    ```
4. Set up the `.env` file for the backend:
    - Create a file named `.env` in the `backend` and `frontend` folder.
    - Example content for `backend .env`:
        ```env
        PORT=5000
        JWT_SECRET=YOUR_JWT_SECRET
        DATABASE_URL=../database.db
        ```
    - Example content for `frontend .env`:
        ```env
        REACT_APP_API_URL=http://localhost:5000/api
        ```
5. Make directory `uploads` in backend folder
6. Start the backend:
    ```bash
    cd ../backend
    npm start
    ```
7. Start the frontend:
    ```bash
    cd ../frontend
    npm start
    ```

---

## Configuration

-   **Database**: SQLite database file is automatically created during the first run.
-   **Environment Variables**:
    -   `PORT`: Port on which the backend runs.
    -   `DATABASE_URL`: Path to the SQLite database.
    -   `JWT_SECRET`: Secret for JWT token generation.
    -   `REACT_APP_API_URL`: Path to backend endpoint.

---

## Test Users

### Default Users

| Username | Password | Role    |
| -------- | -------- | ------- |
| admin    | admin    | Admin   |
| user     | user     | Regular |

---

## API Endpoints

#### **Authentication**

| Method | Endpoint                    | Description                         |
| ------ | --------------------------- | ----------------------------------- |
| POST   | `/api/auth/register`        | Register a new user.                |
| POST   | `/api/auth/login`           | Login a user.                       |
| PATCH  | `/api/auth/change-password` | Change the password of a user.      |
| POST   | `/api/auth/logout`          | Logout the user (invalidate token). |

#### **File Management**

| Method | Endpoint                     | Description                                       |
| ------ | ---------------------------- | ------------------------------------------------- |
| POST   | `/api/files/upload`          | Upload a new file.                                |
| GET    | `/api/files`                 | Get a list of user files.                         |
| GET    | `/api/files/:id`             | Retrieve details of a specific file.              |
| PATCH  | `/api/files/:id`             | Edit file properties (e.g., privacy, expiration). |
| DELETE | `/api/files/:id`             | Delete a file.                                    |
| GET    | `/api/files/download/:id`    | Download a file.                                  |
| POST   | `/api/files/verify-password` | Verify the password for a protected file.         |

#### **Admin**

| Method | Endpoint                          | Description                               |
| ------ | --------------------------------- | ----------------------------------------- |
| GET    | `/api/admin/users`                | Retrieve all users with pagination.       |
| PATCH  | `/api/admin/users/:id/activate`   | Activate a user account.                  |
| PATCH  | `/api/admin/users/:id/deactivate` | Deactivate a user account.                |
| GET    | `/api/admin/pending-accounts`     | Get list of accounts pending approval.    |
| PATCH  | `/api/admin/approve-account/:id`  | Approve a pending user account.           |
| PATCH  | `/api/admin/reject-account/:id`   | Reject and delete a pending user account. |
| GET    | `/api/admin/logs`                 | Retrieve activity logs.                   |
| GET    | `/api/admin/file-access-logs`     | Retrieve file access logs.                |

---

## Database Structure

### **Users Table**

| **Column**  | **Type**     | **Description**                             |
| ----------- | ------------ | ------------------------------------------- |
| `id`        | INTEGER (PK) | Unique identifier for each user.            |
| `username`  | VARCHAR(255) | Unique username of the user.                |
| `password`  | VARCHAR(255) | Hashed password of the user.                |
| `isAdmin`   | BOOLEAN      | Indicates if the user has admin privileges. |
| `isActive`  | BOOLEAN      | Indicates if the user account is active.    |
| `createdAt` | DATETIME     | Timestamp of record creation.               |
| `updatedAt` | DATETIME     | Timestamp of last record update.            |

#### **Description:**

Stores user data, including login credentials, account status, and roles (admin or regular user).

---

### **Files Table**

| **Column**     | **Type**         | **Description**                                   |
| -------------- | ---------------- | ------------------------------------------------- |
| `id`           | VARCHAR (16, PK) | Unique identifier for each file.                  |
| `userId`       | INTEGER (FK)     | Reference to the user who owns the file.          |
| `filename`     | VARCHAR(255)     | Randomly generated filename stored on the server. |
| `originalName` | VARCHAR(255)     | Original filename provided by the user.           |
| `isPrivate`    | BOOLEAN          | Indicates if the file is private.                 |
| `password`     | VARCHAR(255)     | Optional password for accessing the file.         |
| `expiresAt`    | DATETIME         | Timestamp indicating when the file expires.       |
| `accessLimit`  | INTEGER          | Maximum number of downloads allowed.              |
| `downloads`    | INTEGER          | Count of file downloads.                          |
| `size`         | INTEGER          | File size in bytes.                               |
| `createdAt`    | DATETIME         | Timestamp of record creation.                     |
| `updatedAt`    | DATETIME         | Timestamp of last record update.                  |

#### **Description:**

Holds metadata for files uploaded by users, including privacy settings, expiration dates, and download limits.

---

### **FileAccessLogs Table**

| **Column**   | **Type**     | **Description**                              |
| ------------ | ------------ | -------------------------------------------- |
| `id`         | INTEGER (PK) | Unique identifier for each access log.       |
| `userId`     | INTEGER (FK) | Reference to the user who accessed the file. |
| `fileId`     | INTEGER (FK) | Reference to the accessed file.              |
| `ipAddress`  | VARCHAR(255) | IP address of request.                       |
| `accessType` | VARCHAR(255) | Type of access (e.g., DOWNLOAD).             |
| `accessedAt` | DATETIME     | Timestamp when the file was accessed.        |
| `createdAt`  | DATETIME     | Timestamp of record creation.                |
| `updatedAt`  | DATETIME     | Timestamp of last record update.             |

#### **Description:**

Logs file access events, including downloads and attempted accesses.

---

### **ActivityLogs Table**

| **Column**  | **Type**     | **Description**                               |
| ----------- | ------------ | --------------------------------------------- |
| `id`        | INTEGER (PK) | Unique identifier for each activity log.      |
| `userId`    | INTEGER (FK) | Reference to the user performing the action.  |
| `action`    | VARCHAR(255) | Type of action performed (e.g., UPLOAD_FILE). |
| `details`   | TEXT         | Additional details about the action.          |
| `createdAt` | DATETIME     | Timestamp of the activity.                    |
| `updatedAt` | DATETIME     | Timestamp of last record update.              |

#### **Description:**

Tracks user and system activities, such as uploads, logins, and other actions.

---

### **Settings Table**

| **Column**  | **Type**         | **Description**                                 |
| ----------- | ---------------- | ----------------------------------------------- |
| `key`       | VARCHAR(255, PK) | Unique key representing a configuration option. |
| `value`     | VARCHAR(255)     | Value associated with the configuration option. |
| `createdAt` | DATETIME         | Timestamp of record creation.                   |
| `updatedAt` | DATETIME         | Timestamp of last record update.                |

#### **Description:**

Stores global configuration settings, such as file size limits and expiration times.

---

### **Relationships**

| **From Table** | **To Table**     | **Relationship Type** |
| -------------- | ---------------- | --------------------- |
| `Users`        | `Files`          | One-to-Many           |
| `Files`        | `FileAccessLogs` | One-to-Many           |
| `Users`        | `ActivityLogs`   | One-to-Many           |

## License

This project is licensed under the [MIT License](https://github.com/sergiusz-x/quick-storage/blob/main/LICENSE)
