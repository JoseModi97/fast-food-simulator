document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const arrivalIntervalInput = document.getElementById('arrival-interval');
    const fulfillmentIntervalInput = document.getElementById('fulfillment-interval');
    const numCooksInput = document.getElementById('num-cooks');
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
    const pickupQueue = [];
    let cookManager;

    // --- Actors ---
    class Customer {
        constructor(id) {
            this.id = id;
            this.orderId = null;
        }

        pickupOrder() {
            return new Promise(resolve => {
                setTimeout(() => {
                    console.log(`Customer #${this.id} picked up order #${this.orderId}`);
                    resolve(this);
                }, 1000); // 1 second to pick up order
            });
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
        constructor(id) {
            this.id = id;
            this.busy = false;
        }

        cookOrder(customer) {
            this.busy = true;
            return new Promise(resolve => {
                console.log(`Cook #${this.id}: Starting to cook order #${customer.orderId}`);
                const fulfillmentInterval = parseInt(fulfillmentIntervalInput.value, 10);
                setTimeout(() => {
                    console.log(`Cook #${this.id}: Finished cooking order #${customer.orderId}`);
                    this.busy = false;
                    resolve(customer);
                }, fulfillmentInterval);
            });
        }
    }

    class CookManager {
        constructor(numCooks) {
            this.cooks = [];
            for (let i = 1; i <= numCooks; i++) {
                this.cooks.push(new Cook(i));
            }
            this.orderQueue = [];
        }

        addOrder(customer) {
            return new Promise(resolve => {
                this.orderQueue.push({ customer, resolve });
                this.assignOrder();
            });
        }

        assignOrder() {
            if (this.orderQueue.length > 0) {
                const availableCook = this.cooks.find(cook => !cook.busy);
                if (availableCook) {
                    const { customer, resolve } = this.orderQueue.shift();
                    updateUI('cooking-order', `#${customer.orderId}`);
                    availableCook.cookOrder(customer)
                        .then(customer => {
                            resolve(customer);
                            this.assignOrder();
                        });
                }
            }
            this.updateKitchenQueueUI();
        }

        updateKitchenQueueUI() {
            kitchenQueueSpan.textContent = this.orderQueue.map(o => `#${o.customer.orderId}`).join(', ');
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
            const numCooks = parseInt(numCooksInput.value, 10);
            cookManager = new CookManager(numCooks);
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
                .then(customer => cookManager.addOrder(customer))
                .then(customer => Server.serveOrder(customer))
                .then(customer => {
                    pickupQueue.push(customer);
                    this.updatePickupQueueUI(true);
                    return customer.pickupOrder();
                })
                .then(customer => {
                    const index = pickupQueue.findIndex(c => c.id === customer.id);
                    if (index > -1) {
                        pickupQueue.splice(index, 1);
                    }
                    this.updatePickupQueueUI(false);
                });
        },

        updateCustomerQueueUI() {
            customersWaitingSpan.textContent = customerQueue.length;
            customerQueueDiv.innerHTML = customerQueue.map(c => `<div class="customer">🧍‍♂️</div>`).join('');
        },

        updatePickupQueueUI(isAdding) {
            pickupLineCountSpan.textContent = pickupQueue.length;
            pickupQueueDiv.innerHTML = pickupQueue.map(c => `<div class="customer">🍔</div>`).join('');

            if (isAdding) {
                const index = customerQueue.findIndex(cust => cust.id === pickupQueue[pickupQueue.length - 1].id);
                if (index > -1) {
                    customerQueue.splice(index, 1);
                }
            } else if (pickupQueue.length > 0) {
                readyForPickupSpan.textContent = `#${pickupQueue[pickupQueue.length - 1].orderId}`;
            } else {
                readyForPickupSpan.textContent = '#0';
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
