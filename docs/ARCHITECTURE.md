# Architecture Overview

## Monorepo Structure

This project uses a monorepo architecture with clear separation between data processing (Python) and visualization (D3.js).

```
mastercard-data-challenge-2025/
├── src/                    # Python backend
│   ├── data/              # Data fetching & processing
│   ├── models/            # ML models
│   ├── export/            # JSON export for frontend
│   └── utils/             # Shared utilities
├── dashboard/             # D3.js frontend
│   ├── index.html
│   ├── css/
│   ├── js/
│   │   ├── visualizations/
│   │   └── utils/
│   ├── data/             # Generated JSON files
│   └── server.py         # Simple HTTP server
├── data/                 # Raw and processed data
└── notebooks/            # Analysis notebooks
```

## Data Flow

1. **Data Collection**: Python scripts fetch data from APIs
2. **Processing**: Clean, merge, and analyze data
3. **Export**: Generate optimized JSON files to `dashboard/data/`
4. **Visualization**: D3.js reads JSON and renders interactive charts

## Technology Stack

### Backend (Python)
- Data fetching and processing
- Machine learning models
- JSON export pipeline

### Frontend (D3.js)
- Interactive visualizations
- County-level maps
- Time series charts
- Static file serving

## Design Principles

- Minimalistic UI
- Clean code with no bloat
- Good separation of concerns
- Data-driven decisions
- Fast, responsive visualizations

