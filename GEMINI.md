# Gemini Code Understanding

This document provides a comprehensive overview of the "Automated Environmental Gateway" project, designed to facilitate understanding and development.

## Project Overview

The **Automated Environmental Gateway** is a full-stack application for real-time environmental monitoring across Kolkata. It features a web-based dashboard for visualizing data such as Air Quality Index (AQI), water levels, and temperature.

-   **Frontend:** A React application built with Vite and TypeScript, using Tailwind CSS for styling. It provides a user-friendly interface for monitoring sensor data, device health, and system status.
-   **Backend:** A Node.js application built with Express and TypeScript, responsible for data ingestion, processing, and serving data to the frontend via a REST API.
-   **Database:** PostgreSQL is used for data storage, including time-series data for sensor readings.

## Architecture

The project is structured as a monorepo with separate `frontend` and `backend` directories.

### Frontend

-   **Framework:** React with TypeScript
-   **Build Tool:** Vite
-   **Routing:** React Router
-   **Styling:** Tailwind CSS
-   **State Management:** React Context (`AppState.tsx`)
-   **API Communication:** A custom API client in `frontend/src/utils/apiClient.ts` handles requests to the backend.

### Backend

-   **Framework:** Node.js with Express and TypeScript
-   **Entry Point:** `backend/src/server.ts`
-   **API:** A versioned REST API (`/api/v1`) with modular routing for different services (e.g., `SensorService`, `DeviceService`).
-   **Database Interaction:** The `pg` library is used to connect to the PostgreSQL database. Database-related utilities can be found in `backend/src/utils/db.ts`.

## Key Directories

-   `backend/src`: Contains the backend source code, organized by modules (`modules`), services (`services`), types (`types`), and utilities (`utils`).
-   `frontend/src`: Contains the frontend source code, with a clear separation of components (`components`), pages (`pages`), services (`services`), and styles (`styles`).
-   `docs`: Contains project documentation, including the `API_REFERENCE.md`.
-   `DevelopmentPhases`: Contains markdown files detailing the planning and architecture for each backend module.

## Getting Started

### Backend

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Create a `.env` file:**
    Copy the `.env.example` to `.env` and configure the environment variables, especially the database connection details.
4.  **Run the development server:**
    ```bash
    npm start
    ```
    The backend server will start on the port specified in your `.env` file (default is 3000).

### Frontend

1.  **Navigate to the frontend directory:**
    ```bash
    cd frontend
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The frontend development server will start, typically on port 5173.

## Available Scripts

### Backend

-   `npm start`: Starts the backend server using `ts-node`.
-   `npm run build`: Compiles the TypeScript code to JavaScript.
-   `npm test`: Runs the backend tests using Jest.

### Frontend

-   `npm run dev`: Starts the Vite development server.
-   `npm run build`: Builds the frontend application for production.
-   `npm run preview`: Previews the production build locally.

## API Endpoints

The backend exposes a comprehensive REST API for interacting with the environmental data. For a full list of endpoints and their specifications, please refer to the [API Reference](docs/API_REFERENCE.md).

## Development Conventions

-   **Code Style:** The project uses Prettier for code formatting and ESLint for linting. Configuration files (`.prettierrc`, `.eslintrc.cjs`) are available in the `frontend` directory.
-   **Testing:** The backend uses Jest for unit and integration testing. Test files are located in the `backend/tests` directory.
-   **API Design:** The API follows a consistent structure, with a base path of `/api/v1` and a standardized JSON response envelope.
-   **Modularity:** The backend code is organized into modules, each corresponding to a specific feature or service (e.g., `SensorService`, `AlertService`). This modular design is mirrored in the frontend's page structure.
