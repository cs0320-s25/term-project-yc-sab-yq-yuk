# Backend Progress Report

```bash
# Run the Spring Boot app
./mvnw spring-boot:run

# Build the project
./mvnw clean install
```

## Week 1 (Yumian)

This week, I drafted the recommendation system plan and collaborated with my groupmates to align on the approach and agree on the direction. Then, I set up the Spring Boot backend project for BrunoMap ([Spring Initializr](https://start.spring.io/)) and implemented a proof-of-concept /api/recommendations endpoint (http://localhost:8080/api/recommendations?userId=xyz will invoke recommendations and return a list of recommended events). The current recommendation engine serves as a prototype that combines mock user profiles `server/src/main/resources/data/mockUsers.json` and event data `server/src/main/resources/data/mockEvents.json` to calculate personalized scores. The scoring logic integrates a personal match score, trending score, and random score injection based on a 70/20/10 weighting scheme. In addition, a fallback cold-start mechanism is in place for new users without “like” history (90/10 weighting scheme without personal match score). Currently,

- Personal match score is mocked with a random score. TODO
- top 50 recommendations are returned for its ease of implementation; pagination support is desired and will likely be seeked and implemented at a later stage
  Also, it came to me during development as reflecting upon the current weighted score approach that we may optionally offer separate channels — “For You” (personalized feed, weighted 70/20/10), “Trending Now” (top trending), and “Discover Something New” (random events) if time allows; this would though add the workload a bit, so it’s marked as optional.
  This prototype demonstrates the core functionality of the recommendation logic, which lays the foundation for further development.

Next Sprint Plans:

- Complete personal match scoring with its real logic instead of mocking
- Refine and implement time decay logic for the personal match scoring
- Collaborate with teammates to finalize the database schema and ensure alignment with frontend and scraping components
- Coordinate with teammates for configuration to pre-calculate trending scores periodically
- Implement `/api/trending`
- Integrate real user likes and event data into the backend
- Add pagination or limit control for the recommendation feed
- Write unit tests!!!
