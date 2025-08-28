# 🌍 Country Distance Challenge

A web application for calculating distances between countries using the Haversine formula.

## 🚀 Live Deployment

- **API Base**: [https://full-stack-challenge-ruddy.vercel.app](https://full-stack-challenge-ruddy.vercel.app)  
- **Frontend**: [https://full-stack-challenge-4ap3.vercel.app/](https://full-stack-challenge-4ap3.vercel.app/)


## 🚀 Features

- Country selection interface
- Real-time distance calculations
- Interactive results table
- CSV export functionality

## Prerequisites

- Node.js 18+
- npm

## How to Run Locally

1. **API Setup:**

   ```bash
   cd api
   npm install
   npm run dev
   ```

2. **Client Setup:**
   ```bash
   cd client
   npm install
   npm run dev
   ```

## How to Run Tests

```bash
cd api
npm test
```

## Design Notes

### Data Source Choice

- **Source**: Local JSON file with country data (ISO codes, names, capitals, coordinates)
- **Why**: Fast lookups, no external API dependencies, works offline
- **Format**: Each country has iso2, name, capital, lat, lon fields

### Technical Decisions

- **Backend**: Node.js/Express with TypeScript for type safety and modern development
- **Frontend**: React with Vite for fast development and hot reload
- **Real-time Updates**: Server-Sent Events (SSE) - works well with Vercel free tier
- **Distance Algorithm**: Haversine formula for great-circle distance calculations

### Limits

- **Dataset**: Fixed set of ~250 countries, capital cities only
- **Accuracy**: ±0.5% due to spherical Earth assumption (ignores terrain)
- **Performance**: O(n²) complexity limits practical use to ~250 countries max
- **Real-time**: SSE timeout limits for very large datasets

## Where I Used AI and Why

**Kiro AI Usage:**

- **Project Setup**: Generated initial folder structure and configuration files - saved time on boilerplate
- **UI/UX Design**: Created responsive layouts and component structure - ensured modern, accessible design
- **Testing**: Generated comprehensive test cases and edge case scenarios - improved code reliability
- **Error Fixing**: Helped debug and fix syntax errors, type issues, and configuration problems during development

**Why AI Was Helpful:**

- Accelerated development by handling repetitive setup tasks
- Provided best practices for modern web development
- Generated thorough test coverage I might have missed manually

## Time Complexity Analysis

### Core Algorithm: O(n²)

```
For n countries, we generate n*(n-1)/2 unique pairs
Examples:
- 4 countries = 6 pairs
- 10 countries = 45 pairs
- 50 countries = 1,225 pairs
- 250 countries = 31,125 pairs
```

### Performance Breakdown

- **Pair Generation**: O(n²) - unavoidable for all unique combinations
- **Distance Calculation**: O(1) per pair using Haversine formula
- **Sorting**: O(n² log n²) = O(n² log n) for sorting all pairs by distance
- **Overall**: O(n² log n) dominated by sorting step

### Optimization Strategies

- **Batching**: Process pairs in chunks to prevent UI blocking
- **Streaming**: Use SSE to show progress and partial results
- **Early Termination**: Could limit to top N shortest distances if needed
- **Caching**: Store results for repeated country combinations
