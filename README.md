# BusWise


### Features

1. Bus Stops
- Click on the map to add a new bus stop
- Click on a bus stop in the list to select it and again to deselect it
- Actions
    - Click the edit icon to edit the bus stop
    - Click the delete icon to delete the bus stop
- Map
    - Hover over bus stops to see their info
    - Drag a bus stop to change the location

2. Routes
- With no route selected, click on a bus stop in the map to create a route and automatically add the bus stop to it
- Click a route in the list to select it, then click on other bus stops to add to the route or create a new route
- Google Routes API integration provides real route paths
- Actions
    - Click the eye icon to toggle route visibility in the map
    - If a route has several bus stops, click the list icon to view the last changes in the map. The previous route state is displayed in red.
    - Click the edit icon to edit the route
    - Click the delete icon to delete the route
- Bus Stop list actions
    - Click on a route to see a list of its bus stops
    - Drag and drop bus stops over one another to change the order
    - Click the delete icon to remove the bus stop from the route
- Map
    - Route colors are based on their names for consistency
    - Selected route bus stops are colored the same as the route for better visibility
    - Click the Bus Stops checkbox to toggle bus stop visibility
    - Hover over a route
        - Brings it over any other routes
        - Shows an info panel with the bus stops
    - With a selected route
        - Total travel time and total distance information are displayed under the first bus stop
        - Under each of the other bus stops approximate travel time and distance coming from the previous bus stop are displayed
        - Clicking on a route's bust stop will show a control panel with the option to remove it from the route
        - Clicking on a bus stop not part of the route will show a control panel with the option to add it to the route or create a new route
        - Changing a bus stop's location will recalculate the route paths in each route that uses the bus stop


### Missing Features

- "Double click to add a new stop." - The map events for double click also trigger click and single click does the same job
- "Right-click context menu" - In routes mode, clicking on the map to add a bus stop also starts a route if no route is selected or adds a new stop to the current selected route
- "Multi-select" - to be implemented
- "Future Planning" - assuming this is covered by displaying multiple routes in the map


### Technical
- DB structure and indexing
- API
    - REST structure
    - Query, Body and resource validation
    - API error handler
    - Due to time constraint
        - Didn't use enough DB transactions
        - There may be some functionality repetition
        - Structure can be improved by adding separate actions to be called by the APIs which will combine functionality from the entity modules
- Client
    - UI and State managers
    - SVG Icon components
    - Reusable modal components
    - UI blocking on load
    - API client
    - Due to time constraint
        - More components can be decoupled from the business logic and turned into reusable components
        - Larger components can be broken down into smaller
        - DataStore can be better organized and some controls can be moved to UiController
        - API client can provide specific HTTP methods
        - Sidebar is responsive but touch actions are not handled properly
        - Add CSS modules to extract Tailwind classes

### More Info
If you're interested in more map work I've done you can check out my personal project [apotravels.asia](https://apotravels.asia/)
