### Prognosen Overview

- prognosen_routes.py (Backend):
    - Acts as the engine for the */api/prognosen* endpoint.
    - Fetches user financial profiles from the database (or uses dummy data if none found).
    - Uses *finance_math/calculator.py* to perform financial calculations (e.g., cash flow, net worth, investment growth).
    - Packages calculated data (KPIs, chart data) into JSON and sends it to the frontend.

- Prognosen.jsx (Frontend):
    - The React component for the "Prognosen" page.
    - Makes a *fetch* call to the */api/prognosen* backend endpoint to get data.
    - Renders the received JSON data visually using *recharts* for charts and displays KPIs.

- test_routes.py (Tests):
    - Contains *test_get_prognosen_with_dummy_data* to ensure the */api/prognosen* endpoint works.
    - Mocks database functions to simulate missing user profiles.
    - Verifies that the API returns a *200 OK* status and the expected data structure.

*prognosen_routes.py* handles the data processing and calculations (from *calculator.py*), *Prognosen.jsx* displays this data to the user, and *test_routes.py*  tests the functionality of the backend