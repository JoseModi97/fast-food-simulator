# Fast Food Simulator

This is a simple web-based application that simulates the operation of a fast-food takeaway. It's built using HTML, CSS, and vanilla JavaScript, with Bootstrap 5 for layout and a Fluent UI-inspired theme for styling.

## How it Works

The simulation is based on a series of actors and queues, with the flow of events managed by JavaScript Promises.

### Actors

*   **Customer:** A simulated agent that arrives at the restaurant and places an order.
*   **Order Taker:** Takes the customer's order and adds it to the kitchen queue.
*   **Cook:** Prepares the order. The time it takes to cook an order is configurable.
*   **Server:** Delivers the completed order to the pickup area.

### Simulation Flow

1.  **Start:** The user starts the simulation by clicking the "Start" button. They can configure the customer arrival interval and the order fulfillment (cooking) time.
2.  **Customer Arrival:** Customers are generated at a fixed interval. When a customer arrives, they are added to the order line.
3.  **Order Taking:** The Order Taker immediately takes the order from the new customer. The order is then added to the kitchen queue.
4.  **Cooking:** The Cook takes the next order from the kitchen queue and starts preparing it.
5.  **Serving:** Once the Cook has finished preparing an order, the Server delivers it to the pickup area.
6.  **Pickup:** The customer who placed the order picks it up from the pickup area.
7.  **Stop:** The user can stop the simulation at any time by clicking the "Stop" button.

### Technical Details

*   **Promises:** The entire order fulfillment process (from taking the order to serving it) is managed using a chain of Promises. This allows for a clean, asynchronous workflow that mimics the real-world process.
*   **SOLID Principles:** The application is designed with the SOLID principles in mind:
    *   **Single Responsibility:** Each actor (class) has a single responsibility.
    *   **Open/Closed:** The system is open to extension (e.g., adding new actors or features) but closed for modification.
    *   **Liskov Substitution:** The actor classes could be replaced with other implementations without breaking the system.
    *   **Interface Segregation:** The UI logic and the simulation logic are kept separate.
    *   **Dependency Inversion:** The use of Promises decouples the actors from each other. For example, the Cook doesn't need to know about the Server.

## How to Run

1.  Clone this repository.
2.  Open the `index.html` file in a web browser.

That's it! You can now start the simulation and watch the fast-food restaurant in action.
