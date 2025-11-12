# 401(k) Contribution Manager

A full-stack web application for managing 401(k) retirement contributions, built with React, TypeScript, and Node.js.

## Features

- **Contribution Type Selection**: Choose between percentage of paycheck or fixed dollar amount
- **Interactive Rate Adjustment**: Use a slider or input field to set your contribution rate
- **Year-to-Date Display**: View your current YTD contributions
- **Retirement Impact Calculator**: See projected savings at age 65 based on your contribution rate
- **Persistent Storage**: Save your contribution settings via backend API

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Setup Instructions

### 1. Install Backend Dependencies

```bash
cd backend
npm install
```

### 2. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### 3. Run the Application

You'll need to run both the backend and frontend servers. Open two terminal windows:

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

The backend server will run on `http://localhost:3001`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

The frontend will automatically open in your browser at `http://localhost:3000`

## Troubleshooting

### Frontend won't start - "Invalid options object" error

If you encounter an error about `allowedHosts[0]` when starting the frontend, create a `.env` file in the `frontend` directory:

```bash
cd frontend
echo "DANGEROUSLY_DISABLE_HOST_CHECK=true" > .env
npm start
```

This is a known issue with `react-scripts 5.0.1` and webpack-dev-server.

## Project Structure

```
.
├── backend/
│   ├── server.js          # Express.js API server
│   └── package.json       # Backend dependencies
├── frontend/
│   ├── public/
│   │   └── index.html     # HTML template
│   ├── src/
│   │   ├── App.tsx        # Main React component
│   │   ├── App.css        # Component styles
│   │   ├── index.tsx      # React entry point
│   │   └── index.css      # Global styles
│   ├── package.json       # Frontend dependencies
│   └── tsconfig.json      # TypeScript configuration
└── README.md              # This file
```

## Mock Data

The application uses mock data for demonstration:
- Age: 30
- Annual Salary: $75,000
- Paychecks per Year: 26 (bi-weekly)
- Current YTD: $4,500

## Technologies Used

- **Frontend**: React 18, TypeScript, CSS3
- **Backend**: Node.js, Express.js
- **Development**: Create React App, nodemon

## Notes

- The backend uses in-memory storage. In a production environment, this would be replaced with a database.
- The retirement projection assumes a 7% average annual return.
- The application assumes bi-weekly paychecks (26 per year).

