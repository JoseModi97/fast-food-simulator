document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const arrivalIntervalInput = document.getElementById('arrival-interval');
    const fulfillmentIntervalInput = document.getElementById('fulfillment-interval');
    const startSimButton = document.getElementById('start-sim');
    const stopSimButton = document.getElementById('stop-sim');

    const customersWaitingSpan = document.getElementById('customers-waiting');
    const customerQueueDiv = document.getElementById('customer-queue');
    const orderTakenSpan = document.getElementById('order-taken');
    const cookingOrderSpan = document.getElementById('cooking-order');
    const kitchenQueueSpan = document.getElementById('kitchen-queue');
    const readyForPickupSpan = document.getElementById('ready-for-pickup');
    const pickupLineCountSpan = document.getElementById('pickup-line-count');
    const pickupQueueDiv = document.getElementById('pickup-queue');

    // --- Simulation State ---
    let simulationRunning = false;
    let customerIdCounter = 1;
    let orderIdCounter = 1;
    let customerArrivalInterval;
    const customerQueue = [];
    const orderQueue = [];
    const pickupQueue = [];

    // --- Actors ---
    class Customer {
        constructor(id) {
            this.id = id;
            this.orderId = null;
        }
    }

    class OrderTaker {
        static takeOrder(customer) {
            return new Promise(resolve => {
                const orderId = orderIdCounter++;
                customer.orderId = orderId;
                console.log(`Order Taker: Taking order #${orderId} for customer #${customer.id}`);
                updateUI('order-taken', `#${orderId}`);
                resolve(customer);
            });
        }
    }

    class Cook {
        static cookOrder(customer) {
            return new Promise(resolve => {
                console.log(`Cook: Starting to cook order #${customer.orderId}`);
                updateUI('cooking-order', `#${customer.orderId}`);
                const fulfillmentInterval = parseInt(fulfillmentIntervalInput.value, 10);
                setTimeout(() => {
                    console.log(`Cook: Finished cooking order #${customer.orderId}`);
                    resolve(customer);
                }, fulfillmentInterval);
            });
        }
    }

    class Server {
        static serveOrder(customer) {
            return new Promise(resolve => {
                console.log(`Server: Serving order #${customer.orderId}`);
                updateUI('ready-for-pickup', `#${customer.orderId}`);
                resolve(customer);
            });
        }
    }

    // --- Simulation Controller ---
    const simulationController = {
        start() {
            if (simulationRunning) return;
            simulationRunning = true;

            startSimButton.classList.add('loading');
            startSimButton.disabled = true;

            console.log('Simulation Started');
            const arrivalInterval = parseInt(arrivalIntervalInput.value, 10);
            customerArrivalInterval = setInterval(this.generateCustomer.bind(this), arrivalInterval);

            setTimeout(() => {
                startSimButton.classList.remove('loading');
                // The button remains disabled while the simulation is running
            }, 1000);
        },

        stop() {
            if (!simulationRunning) return;
            simulationRunning = false;
            console.log('Simulation Stopped');
            clearInterval(customerArrivalInterval);
        },

        generateCustomer() {
            const customer = new Customer(customerIdCounter++);
            console.log(`New customer #${customer.id} arrived.`);
            customerQueue.push(customer);
            this.updateCustomerQueueUI();

            OrderTaker.takeOrder(customer)
                .then(customer => {
                    orderQueue.push(customer);
                    this.updateKitchenQueueUI();
                    return Cook.cookOrder(customer);
                })
                .then(customer => {
                    const index = orderQueue.findIndex(c => c.id === customer.id);
                    if (index > -1) {
                        orderQueue.splice(index, 1);
                    }
                    this.updateKitchenQueueUI();
                    return Server.serveOrder(customer);
                })
                .then(customer => {
                    pickupQueue.push(customer);
                    this.updatePickupQueueUI();
                });
        },

        updateCustomerQueueUI() {
            customersWaitingSpan.textContent = customerQueue.length;
            customerQueueDiv.innerHTML = customerQueue.map(c => `<div class="customer">🧍‍♂️</div>`).join('');
        },

        updateKitchenQueueUI() {
            kitchenQueueSpan.textContent = orderQueue.map(c => `#${c.orderId}`).join(', ');
        },

        updatePickupQueueUI() {
            pickupLineCountSpan.textContent = pickupQueue.length;
            pickupQueueDiv.innerHTML = pickupQueue.map(c => `<div class="customer">🍔</div>`).join('');
            // Remove the customer from the original waiting line
            const index = customerQueue.findIndex(cust => cust.id === pickupQueue[pickupQueue.length-1].id);
            if(index > -1) {
                customerQueue.splice(index, 1);
            }
            this.updateCustomerQueueUI();
        }
    };

    // --- UI Update Function ---
    function updateUI(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = value;
        }
    }

    // --- Event Listeners ---
    startSimButton.addEventListener('click', () => simulationController.start());
    stopSimButton.addEventListener('click', () => simulationController.stop());
});
