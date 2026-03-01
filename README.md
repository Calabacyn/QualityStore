# QualityStore: E2E Testing Framework & Resilient Hub

QualityStore is a professional QA Automation portfolio project designed to demonstrate skills in building resilient software and implementing a robust, multi-layered testing strategy.

## 🚀 Vision

The project consists of a modern E-commerce interface (React) backed by a resilient Node.js middleware that ensures data availability even when external APIs fail, providing a perfect environment for End-to-End (E2E) and API testing.

## 🏗️ Architecture

- **Backend**: Node.js/Express. Consumes FakeStoreAPI with fallback logic and Auth proxy.
- **Frontend**: React + Vite + Tailwind CSS. Multi-route SPA with `AuthContext` and `CartContext`.
- **Testing Suite**: Jest (API) and Playwright (E2E).

## 🚀 E-commerce Full-Flow Evolution

The project has evolved to a complete shopping experience:
- **Authentication**: Secure login against Fake Store API with local token persistence.
- **Dynamic Routing**: Dedicated pages for Login, Cart, and Product Details.
- **Cart Logic**: advanced state management allowing quantity updates and persistence.
- **Checkout**: Simulated flow that validates session state.

## 📐 The Testing Pyramid

1.  **API Tests (Jest)**: Validates core data integrity and auth proxy.
2.  **E2E Tests (Playwright)**:
    - **Security**: Verifies that protected routes (like `/cart`) are inaccessible to unauthorized users.
    - **Logic**: Validates cart total calculations and quantity adjustments.
    - **Navigation**: Full flow from discovery to checkout.


## 🛠️ Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm

### Installation

1.  **Clone the repository**.
2.  **Install dependencies**:
    ```bash
    npm install
    cd api && npm install
    cd ../web && npm install
    ```
3.  **Install Playwright Browsers**:
    ```bash
    npx playwright install
    ```

### Running the Project

1.  **Start Backend**: `cd api && npm start` (Runs on http://localhost:3001)
2.  **Start Frontend**: `cd web && npm run dev -- --host 127.0.0.1 --port 3002` (Runs on http://localhost:3002)


### Running Tests

- **API Tests**: `cd api && npm test`
- **E2E Tests**: `npx playwright test`

## 🛡️ Resilience Logic

The backend implements a timeout-aware proxy. If `fakestoreapi.com` takes longer than 5 seconds or returns an error, the system automatically switches to `mock-products.json`, ensuring the user never sees a broken page.

---
*Created for QA Professionals who value resilience and automation.*
