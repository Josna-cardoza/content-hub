# Content Hub

A scalable, loosely coupled content platform built with modern web technologies. This application provides a platform for managing and reading articles with a robust microservice-inspired architecture.

## Architecture

The project consists of three main layers, all containerized and orchestrated seamlessly using Docker Compose:

1. **Frontend (`/frontend`)**
   - **Tech Stack**: React, Vite
   - **Responsibility**: A premium, visually engaging user interface designed with modern aesthetic choices (shadows, animations, and clean layouts). It interacts directly with the API Gateway.
   
2. **Middle Tier (API Gateway / BFF) (`/middle-tier`)**
   - **Tech Stack**: Python, FastAPI
   - **Responsibility**: Acts as a Backend-For-Frontend (BFF). It securely routes and aggregates traffic, handling requests between the React UI and the core `.NET` service.
   
3. **Data Service (`/data-service`)**
   - **Tech Stack**: C#, .NET 8, Entity Framework Core, PostgreSQL
   - **Responsibility**: Encapsulates all underlying business logic, models (Users, Articles), schema creations, and data seeding routines. Provides RESTful endpoints ingested by the Middle Tier.

## Quick Start

### Prerequisites
- Docker & Docker Compose
- (Optional) .NET 8 SDK, Python 3.11, and Node.js for local native development.

### Running the Application Structure

The platform is designed to be plug-and-play. Running the containers will automatically provision the databases and seed sample data.

1. Clone the repository and navigate into the root directory:
   ```bash
   cd content-hub
   ```

2. Build and run the services using Docker Compose:
   ```bash
   docker-compose up -d --build
   ```

3. **Access the Application**:
   - The React Frontend will be available at [`http://localhost:3000`](http://localhost:3000)
   - The FastAPI Middle Tier runs on `http://localhost:8000`
   - The .NET Core backend runs isolated on `http://localhost:8080`
   - The Postgres Database operates on port `5432`

## Features

- **Automated Seeding**: Starts right out of the box with dummy data for immediate use.
- **REST APIs**: Full CRUD structures configured across the data service.
- **Dynamic Content**: Connected frontend layout displaying interactive content natively.
- **Modularized**: Component-isolated architecture for scalable growth and clean deployments.
