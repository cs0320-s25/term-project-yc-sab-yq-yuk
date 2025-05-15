# April 21 - April 26 (yli795)
## Dev Details
I am in charge of the frontend development this week.

I built a Mapbox integration centered on campus coordinates that displays event locations as clickable markers. When students click these markers, they see detailed popups with event information including name, description, time, location, and categories. I also implemented engagement features where users can track views, like events, and bookmark them for later.

I developed comprehensive filtering capabilities that are currently implemented in the frontend using JavaScript filtering functions. All of these filters, including categories, time ranges, and locations, will eventually be moved to API endpoints for better performance and scalability. For now, I've built the UI and interaction logic to demonstrate how the filtering will work when connected to real backend services.

My application currently runs entirely on mock data for events, user preferences, and engagement metrics. I created a structured mock dataset with realistic event information including geographic coordinates, categories, and engagement statistics to simulate the real application experience. All user interactions like liking, bookmarking, and viewing events currently only modify this frontend state. When implemented with a real backend, these actions will call API endpoints to persist data.


My UI design features a responsive split-screen layout combining the map with a scrollable event list showing event cards with hover effects and category color-coding. I built three different view modes (Map, Likes, Bookmarks) so students can easily switch between discovering new events and managing ones they're interested in. 

## Demo

https://brown.zoom.us/rec/share/pJv8jLM4bcP0TnARKxvr00OkZj6FM91CGvN_cmwvGD-j-74P5ImaQqOwde8FOx8N.5BeJ6tRdUHC6aKzf?startTime=1745599479000