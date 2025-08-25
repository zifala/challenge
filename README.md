# Zifala Full Stack Challenge

Build a small app end to end. Use AI tools if you like. Own the result.

## Goal

Given a list of countries, return all unique country pairs sorted by the
shortest distance between their capitals, from shortest to longest.

Example input:
["SO", "KE", "ET", "DJ"]

Example pair in output:
["DJ", "SO"] -> 1165.4 km

## Scope

You will deliver:
1) API, 2) Frontend, 3) Deployment, 4) Tests, 5) Live updates.

### 1) API

- Tech: any modern stack.
- Dataset: include a local JSON file of capitals with lat and lon.
  - Key by ISO 3166 alpha-2 or alpha-3, include the country name.
  - Example record:
    ```json
    {"iso2":"SO","name":"Somalia","capital":"Mogadishu","lat":2.0469,"lon":45.3182}
    ```
- Endpoints:
  - `GET /api/countries`  
    Returns the list from your dataset.
  - `POST /api/distances`  
    Body: `{"countries":["SO","KE","ET","DJ"]}`
    Behavior:
      - Validate codes against the dataset.
      - Compute great-circle distances using the Haversine formula.
      - Generate all unique pairs. n countries -> n*(n-1)/2 pairs.
      - Return pairs sorted ascending by kilometers.
    Response:
    ```json
    {
      "pairs": [
        {"a":"DJ","b":"SO","km":1165.4},
        {"a":"KE","b":"SO","km":1374.9}
      ],
      "count": 6,
      "unit": "km"
    }
    ```
  - Live updates: use **SSE** or **WebSockets**.
    - Stream progress as pairs complete.
    - Message format:
      ```json
      {"done": 10, "total": 6, "latest": {"a":"DJ","b":"SO","km":1165.4}}
      ```
    - SSE is preferred for Vercel free plans.

- Performance:
  - Target up to 250 countries, about 31,125 pairs.
  - Complexity is O(n²). Use simple batching to stream results.

### 2) Frontend

- Any modern framework. React, Svelte, Vue, or Solid.
- Features:
  - Search and select countries from `GET /api/countries`.
  - Submit to `POST /api/distances`.
  - Show a live progress bar fed by SSE or sockets.
  - Render a sortable table of pairs. Columns: A, B, km.
  - Button to download results as CSV.

### 3) Deployment

- Deploy to a free platform. Vercel is preferred.
- Provide one public URL for the app.
- Provide a second URL for the API base if separate.

### 4) Tests

- Add unit tests for the Haversine function.
- Add an API test for input validation and sorting.
- Add a small integration test that covers 4 countries.

### 5) Docs

- `README` must include:
  - How to run locally.
  - How to run tests.
  - Design notes. Data source choice, decisions, limits.
  - Where you used AI, and why.
  - Time complexity analysis.

## Bonus

- Map view with lines between capitals for the top 20 shortest pairs.
- GitHub Actions CI for tests on each push.
- CSV upload of custom country lists with coordinates.
- Caching repeated requests by set membership hash.

## Submission

- Fork this repo.
- Implement the app.
- Open source your fork.
- Share the live URL and repo URL.

## Evaluation

- Correctness. Sorted pairs, accurate distances.
- Code quality. Clear, small modules, helpful tests.
- Frontend UX. Fast, simple, accessible.
- Realtime. Streams work and do not block the UI.
- Deployment. Stable, public, and documented.


Good luck. We’re looking for creativity, not perfection.  
_Zifala Team_
