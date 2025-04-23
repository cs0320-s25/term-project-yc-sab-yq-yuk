> **GETTING STARTED:** The Maps gearup code is a great starting point for both the backend and frontend. You might also want to grab code snippets from your final REPL project.

# Project Details
Project Details

This project creates an interactive map using React and Mapbox GL JS for urban studies researchers. It handles three main user stories:

**User Story 1: Map Navigation**

The app provides standard map navigation centered on Providence, Rhode Island (41.8246, -71.4128) with a zoom level of 10. Users can pan and zoom using Mapbox's standard controls. This is implemented with the react-map-gl Map component that tracks viewState as users navigate.

**User Story 2: Historical Redlining Data Overlay**

The app displays historical redlining data as a map overlay. This works by loading GeoJSON data through the overlayData() function and rendering it with Mapbox's Source and Layer components. The overlay stays visible as users navigate and zoom, with styling defined in the geoLayer configuration.

**User Story 3: Collaborative Pin Placement**

Users can add location markers by clicking on the map. Only authenticated users can add pins, with each pin storing the creator's ID, coordinates, and timestamp.

Pin management uses a singleton PinStore class that stores pins in localStorage for persistence across sessions. The implementation includes:

    1. Map click handling to create pins
    2. Different colors for the user's pins (blue) versus others' pins (red)
    3. Popups showing pin details when clicked
    4. A "Clear My Pins" button for removing only your own pins

Authentication is handled through Clerk, ensuring pins are properly associated with their creators.

While currently using localStorage instead of cloud storage, the design allows for easy migration to a cloud database later.

**Sprint 5.2 User Story 3(updated)**

We chose to persistently store pin data in Firestore, managing it entirely from our backend. Firestore’s document-based structure allows each user to have a dedicated subcollection (e.g., users/{uid}/pins), ensuring secure, isolated storage via robust security rules. In addition to geolocation data, we store a timestamp for each pin to facilitate temporal analysis. This design minimizes frontend complexity—keeping the UI focused on user interaction like adding, displaying, and clearing pins—while leveraging Firestore’s real‑time synchronization and scalability to meet the stakeholder’s needs.

Rather than allowing the frontend to access Firestore directly, all interactions with Firestore are managed from the backend server. This centralizes data processing, enforces security through backend-controlled access, and simplifies overall client logic.

**User Story 4: Bound Box**

The redlining data is now stored on the backend server. When the user drags across the map, they can select the button "reset overlays." This button extracts the coordinates at each corner of the mapbox map and passes these values into a backend query that extracts the filtered redlining geojson and passes it to the frontend, where it becomes an overlay.

**User Story 5: Searching the Map**

There is a search bar in the upper left corner of the page that accepts a query. Similar to the bound box feature, this query is sent to the backend and compared to the area descriptions contained in the redlining geojson. This geojson is filtered based on area descriptions with matching keywords and is sent to the frontend, where it is processed to create red overlays on the map for the corresponding areas.

**Supplement for Sprint5.2**

The solution introduces a caching proxy—**GeoJsonCacheProxy**—to avoid repeatedly filtering the same GeoJSON data for identical bounding box parameters. Instead of recalculating the filtered features every time a request comes in, the proxy checks whether the query has been processed before by looking in its cache. If so, it returns the cached result. The BoundBoxHandler acts as the entry point for HTTP requests, parses the query parameters, and delegates filtering to the proxy before serializing and returning the output.


# Design Choices
**Singleton Pattern for Pin Management**

Used a singleton PinStore class to centralize all pin operations, ensuring data consistency across components without complex state management.

**Client-Side Storage with localStorage**

Chose browser localStorage for pin persistence to allow rapid development without backend dependencies while still meeting core persistence requirements.

**Authentication Integration**

Integrated Clerk authentication to restrict pin creation to authenticated users and enable user-specific pin management.

**Visual Pin Differentiation**

Implemented color-coding (blue for user's pins, red for others) to provide immediate visual cues about pin ownership.

**Interactive Information Display**

Used on-demand popups rather than permanent displays to keep the map clean while providing details when needed.

**Bound Box Query**

Used the coordinates from the map on display to form the bound box query.

**Map Search Query**

Used a text field search form to process queries for area descriptions. Displayed the overlays as filled-in red.

**Cloud Storage with Firestore**

Pin data is stored persistently in a Firestore database rather than using client‑side localStorage. This guarantees secure, scalable, and real‑time data persistence across sessions and devices, meeting the stakeholder’s requirement for data to persist on reload.

**Backend Management of Firestore:**
Rather than allowing the frontend to access Firestore directly, all interactions with Firestore are managed from the backend server. This centralizes data processing, enforces security through backend-controlled access, and simplifies overall client logic.

**Caching Filtering Queries on the Backend**

I introduced a caching proxy—GeoJsonCacheProxy—to handle filtering queries. This proxy intercepts queries using bounding box parameters, checks if the same query has been processed before, and, if so, returns the pre‑computed filtered result from the cache. This strategy minimizes repeated, expensive computations on identical datasets and reduces the load on our data source. The BoundBoxHandler serves as the entry point for HTTP requests; it parses the bounding box parameters, delegates filtering to the GeoJsonCacheProxy, and then serializes the cached (or freshly computed) GeoJSON output for the client. 

# Errors/Bugs

# Tests

We tested the following properties on the frontend:

1) proper clerk login
2) bad clerk login with invalid email
3) bad clerk login with invalid password
4) proper load of map at correct zoom with overlays
5) adding 1 pin
6) adding multiple pins
7) keeping pins across reloads
8) adding pins for multiple users
9) differentiating between pins for 2 users
10) clearing pins with 1 user
11) clearing pins with 2 users

Bound-box tests:

1) query that returns geojson with 0 features
2) bad query (submitting a string instead of a number)
3) missing query param
4) "normal" successful search

**1340 Supplement: test with svg**
1. **Section Navigation**:  Verify smooth navigation between different application sections

        1. Successful navigation to Mapbox Demo section
        2. Successful navigation to Firestore Demo section
        3. Mapbox canvas visibility controlled by section navigation

2. **SVG Marker Rendering**: Ensure markers are correctly displayed as SVG elements

        1. Verified initial pin count (2 pins)
        2. Confirmed SVG element rendering for markers
        3. Markers pre-populated via mock localStorage data

3. **Pin Addition Functionality**: Test ability to add new pins by clicking on the map

        1. Click interaction with map canvas
        2. Verification of pin addition in localStorage
        3. Automatic increase in pin count after map click

4. **Pin Popup Interaction**: Validate popup functionality when clicking on existing pins

        1. Popup visibility after pin click
        2. Popup content verification
        3. Display of pin details (latitude, longitude, creator)

5. **Pin Management**: Test clearing user-specific pins
Key Checks:

        1. Successfully remove pins associated with current user
        2. Verification of pin removal in localStorage
        3. Filtering of pins by user ID

**backend_api.spec.ts**:

 integration tests (with a clearing step before each test) are appropriate for verifying that:

    /clear-user?uid=...: A user can clear their pins,

    /add-pin?uid=...&lat=...&lon=..., /listpins?uid=<uid>: Adding a pin is reflected in user-specific listing,

    /listpins?uid=all: The aggregation via uid=all returns the pin(s) from various users.

**frontend.spec.ts**:

Tests simulate a real user’s flow by logging in via Clerk, navigating to the Mapbox demo, and ensuring a clean start by clearing pins. They then click on the map to add a new pin, verify that a new marker and its popup appear, and finally confirm that the “Clear My Pins” button removes the user's markers from the UI. Also tested pins persistence during reloading.

**mocked.spec.ts**:

Added a front‑end test using mocks.


# How to

**To start app**: npm run start

**Test**: npx playwright test --workers=1

**To start server**: mvn package, ./run

# Collaboration

**Yunqi Li (yli795)**
For Sprint5.1, 
I was primarily responsible for implementing User Story 3 in Sprint 5.1, which focused on enabling interactive pin placement on the map. I developed a solution that allows authenticated users to add pins by clicking on the map, while ensuring all users can view pins placed by themselves and others.

I verified smooth section navigation, correct SVG marker rendering, dynamic pin addition and interaction, and user-specific pin management using localStorage and UI validations.


For Sprint5.2, 

I added (a) backend unit or integration tests; and (b) front-end tests for new backend API features(including /add-pin, /listpins, and /clear-user). Also I added a fornt-end test with mock data.

I stored the pin data persistently in a Firestore database and
manage it from backend server.

I completed supplement part.

**Kyle Wisialowski (kwisialo)**

I was primarily responsible for completing User Story 4 and User Story 5. I moved the redlining json onto the backend and set up 2 endpoints (bound-box and search-map) that handles queries to the backend and returns a filteres geojson to the frontend. I handled bound-box queries via the mapbox coordinates and user input searches for search-map queries.

**chatgpt**

In-text: When prompted “Hi! I am working on the 1340 supplement and I'm having some trouble because the handout says that the map elements are accessible via a SVG region on the page. However, when I run the map code (which is configured the same as the gearup), the map appears as a canvas element rather than a svg element when I inspect the page. does this conflict with requirement?"


The ChatGPT-generated text indicated that “There's actually no conflict with the requirements, but I can clear up the confusion:
Mapbox Rendering Technology Mix
Mapbox GL JS uses a combination of rendering technologies:

Canvas Element: The base map itself (terrain, streets, buildings) is rendered using an HTML Canvas element, which is what you're seeing when you inspect the page.
HTML/SVG Elements: Interactive elements like markers (pins), popups, and controls are implemented as HTML and SVG elements that are positioned on top of the canvas."(OpenAI, 2025) Entry in reference list: OpenAI. (2025).

_(state all of your sources of collaboration past your project partner. Please refer to the course's collaboration policy for any further questions.)_
