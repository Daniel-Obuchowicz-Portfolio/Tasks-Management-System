# Task & User Management Application

This is a **Task & User Management Application** built using Angular for the frontend and Node.js with Express and MySQL for the backend. The application allows users to manage tasks and assign multiple users to each task. It includes a user management feature where you can create, edit, delete, and search users.

## Table of Contents
- [Features](#features)
- [Installation](#installation)
- [Backend Setup](#backend-setup)
- [Frontend Setup](#frontend-setup)
- [API Endpoints](#api-endpoints)
- [Usage](#usage)
- [Screenshots](#screenshots)
- [License](#license)

## Features
- **Task Management**: Create, edit, delete tasks.
- **User Assignment**: Assign multiple users to tasks with a user search feature.
- **User Management**: Create, edit, delete, and search users.
- **Task & User Details View**: View task and user details, including assigned tasks for each user.
- **Responsive Design**: The application is responsive and works across different devices.

## Installation

### Backend Setup
1. Clone the repository:

2. Install the backend dependencies:
    ```bash
    npm install
    ```

3. Create a `.env` file in the root of the `backend` directory and add the following environment variables:
    ```env
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=yourpassword
    DB_NAME=management_db
    JWT_SECRET=your_jwt_secret
    ```

4. Run the migrations or set up the MySQL database:
    ```bash
    npx sequelize-cli db:migrate
    ```

5. Start the backend server:
    ```bash
    npm start
    ```

### Frontend Setup
1. Navigate to the `frontend` directory:
    ```bash
    cd ../frontend
    ```

2. Install the frontend dependencies:
    ```bash
    npm install
    ```

3. Start the frontend development server:
    ```bash
    npm start
    ```

The frontend will be running on `http://localhost:4200` and the backend will be running on `http://localhost:3000`.

## API Endpoints
Here are the key API endpoints:

### Task Endpoints
| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| `GET`  | `/api/tasks` | Fetch all tasks |
| `GET`  | `/api/tasks/:id` | Fetch task by ID |
| `POST` | `/api/tasks/create` | Create a new task |
| `PUT`  | `/api/tasks/:id` | Update a task |
| `DELETE` | `/api/tasks/:id` | Delete a task |

### User Endpoints
| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| `GET`  | `/api/users` | Fetch all users |
| `GET`  | `/api/users/:id` | Fetch user by ID |
| `POST` | `/api/users/create` | Create a new user |
| `PUT`  | `/api/users/:id` | Update a user |
| `DELETE` | `/api/users/:id` | Delete a user |
| `GET`  | `/api/users/search?q=:query` | Search for users by username |

## Usage
### Task Management
1. **Create a Task**: Navigate to the task creation page and fill in the details. You can assign users by searching for them in the user field.
2. **Edit a Task**: Navigate to the task list and click on a task to edit its details.
3. **View Task Details**: View all task details, including assigned users, by clicking on a task in the task list.
4. **Delete a Task**: Tasks can be deleted directly from the task list.

### User Management
1. **Create a User**: Navigate to the user creation page, fill in the required fields, and submit.
2. **Edit a User**: Navigate to the user list, select a user to edit, and update their details.
3. **View User Details**: View detailed information about each user and their assigned tasks.
4. **Search for Users**: Use the search feature to find users by their username.
5. **Delete a User**: Users can be deleted directly from the user list.

## Screenshots
![Edit User](https://media1.tenor.com/m/a7aeZxrntk8AAAAC/intensifies-sooning.gif)

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
