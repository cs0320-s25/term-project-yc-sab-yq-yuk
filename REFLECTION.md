**Reflection 1.1**
The original purpose of the project is to study the trends between redlining and landlord-tenant relationships. Thus, the primary stakeholder is the Urban Studies Research Student and we should prioritize their interests. However, this is not to say that the tenant stakeholders do not deserve protection as well. If we were to implement this project in real life, we think it would make sense to make the pins identifiable so the researcher can avoid the risk of false reviews. Here are two potential options for how we think we can still protect the privacy of the tenants if we were to pursue this approach:

1) Since the researcher is driving this project, they should be the only one who can see all of the pins (all of the end users can only see their own pin).

2) We can keep all of the information visible to all end users and include clear warnings about identifiability.

The second option will likely cause a strong decrease in the number of end users, as many tenants may feel at risk for jeopardizing their landlord relationship. This option does ensure, though, that users are at least aware that their information will be visible (and comes with associated risks). However, we think that there will still be plenty of users who are comfortable exposing fraught relationships with current or previous landlords (especially previous landlords), so hopefully the impact on data collection will not be too significant. Moreover, the identifiable information may actually be of use to other tenants who are seeking out opportunities to move. Perhaps they could also connect with tenants who are having issues with the same landlord. The second option seems much more easy to implement for the sake of our project and will likely be the approach we take.

------------ Update: For our implementation, we ended up deciding to stick with our approach as listed above. Last week we considered how we could mitigate safety concerns. If we were to continue working on this project, we might add warnings for the user that their data would be publicly visible. As for now, though, all of the pins are mapped to user IDs that inform other users who placed the pin on the map.

**Reflection 1.2**
In sprint 5.1, I chose to store the user data associated with pins using localStorage through a PinStore class that acts as a centralized data manager. Each pin contains five key pieces of information: a unique ID, the user's ID who created it, latitude, longitude, and a timestamp. I implemented this as a singleton pattern to ensure all components throughout the application share the same pin data store.

This approach provides a clean, centralized way to manage pin operations while keeping the implementation relatively simple. The PinStore class encapsulates all the logic for adding, retrieving, and clearing pins, making the code more maintainable. Using localStorage offers persistence without requiring backend infrastructure setup, which allows for quicker development and testing.

My implementation directly addresses several key stakeholder requirements:

"The end user should be able to add a pin to the map on click" - This is handled by the onMapClick function which captures click coordinates and calls addPin() to create a new pin at that location.

"All authenticated users should be able to see pins they dropped and pins dropped by other users" - By storing all pins in a single collection with userIDs, the map renders everyone's pins while still distinguishing between the current user's pins (blue) and others' pins (red).

"My pins should persist on reload" - The saveToLocalStorage() method automatically saves pins whenever they're modified, and the loadFromLocalStorage() method loads them when the store is initialized, ensuring pins persist across browser sessions.

"I also want some way to clear my pins" - The clearUserPins() method allows users to remove only their own pins while preserving others', connected to the UI through the "Clear My Pins" button.

In Sprint 5.2, I chose to store the pin data persistently in Firestore because it offers a scalable, real‑time, and secure solution that aligns perfectly with the needs of our application. Firestore's document-oriented structure allows each user to have their own subcollection of pins (e.g., under users/{uid}/pins), which makes it straightforward to perform both user-specific queries and aggregated queries using collection group queries. 

This design not only logically separates user data but also ensures that each user's pins are isolated and secured via Firestore's robust security rules. Moreover, Firestore supports real‑time updates, allowing the application to immediately reflect changes such as pin additions, modifications, or deletions without requiring a full page refresh. This real‑time capability is crucial for our interactive map experience where all authenticated users should see pins dropped by themselves and others. Finally, as a fully managed cloud service, Firestore takes care of infrastructure concerns like scaling, backups, and maintenance, enabling us to focus on building a dynamic and reliable application.