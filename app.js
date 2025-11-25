/* -------------------------------------------
 Smart Laundry Frontend Logic
--------------------------------------------*/

console.log("🔧 Smart Laundry Frontend Loaded");

const RATE_PER_KG = 50; // Pricing logic

// Selecting main DOM elements
const weightInput     = document.getElementById("weightInput");
const priceInput      = document.getElementById("priceInput");
const fetchWeightBtn  = document.getElementById("fetchWeightBtn");
const generateQrBtn   = document.getElementById("generateQrBtn");
const qrContainer     = document.getElementById("qrContainer");
const payloadPreview  = document.getElementById("payloadPreview");
const statusText      = document.getElementById("statusText");
const simulatePaymentBtn = document.getElementById("simulatePaymentBtn");
const simulateFlowBtn = document.getElementById("simulateFlowBtn");

const steps = {
  created:   document.getElementById("step-created"),
  paid:      document.getElementById("step-paid"),
  washing:   document.getElementById("step-washing"),
  ready:     document.getElementById("step-ready"),
  collected: document.getElementById("step-collected"),
};

let currentOrder = null;

/* -------------------------------------------
 Helper Functions
--------------------------------------------*/

// Remove active style from steps
function resetSteps() {
  Object.values(steps).forEach(step => step.classList.remove("active"));
}

// Animate element briefly
function animate(el) {
  el.classList.add("fade-in");
  setTimeout(() => el.classList.remove("fade-in"), 500);
}

// Change active status
function setStatus(stepKey, label) {
  resetSteps();
  steps[stepKey].classList.add("active");
  statusText.textContent = "Status: " + label;
  animate(statusText);
}

/* -------------------------------------------
 STEP 1: Fetch weight (simulated for now)
--------------------------------------------*/

fetchWeightBtn.addEventListener("click", () => {
  const weight = (Math.random() * 5 + 1).toFixed(2); // 1–6kg random
  weightInput.value = weight;

  const price = (weight * RATE_PER_KG).toFixed(0);
  priceInput.value = price;

  setStatus("created", "Order Created (Weight & Price Calculated)");
});

/* -------------------------------------------
 STEP 2: Generate QR with order payload
--------------------------------------------*/

generateQrBtn.addEventListener("click", () => {
  if (!weightInput.value) return alert("Fetch weight first!");

  const customerName = document.getElementById("customerName").value || "Guest";
  const orderId = "ORD-" + Date.now();
  const lockerId = Math.floor(Math.random() * 20) + 1;

  currentOrder = {
    order_id: orderId,
    customer_name: customerName,
    weight_kg: weightInput.value,
    price_inr: priceInput.value,
    locker_id: lockerId,
    status: "Created",
    timestamp: new Date().toLocaleString(),
  };

  qrContainer.innerHTML = ""; // Clear old QR

  new QRCode(qrContainer, {
    text: JSON.stringify(currentOrder),
    width: 200,
    height: 200,
  });

  qrContainer.classList.add("fade-in");
  payloadPreview.textContent = JSON.stringify(currentOrder, null, 2);

  setStatus("created", "Order & QR Generated");
});

/* -------------------------------------------
 STEP 3: Simulate payment only
--------------------------------------------*/

simulatePaymentBtn.addEventListener("click", () => {
  if (!currentOrder) return alert("Generate QR first!");

  currentOrder.status = "Paid";
  setStatus("paid", "Payment Confirmed (Simulated)");
});

/* -------------------------------------------
 STEP 4: Full automated demo flow
--------------------------------------------*/

simulateFlowBtn.addEventListener("click", () => {
  if (!currentOrder) return alert("Generate QR first!");

  currentOrder.status = "Paid";
  setStatus("paid", "Payment Confirmed");

  setTimeout(() => {
    currentOrder.status = "Washing";
    setStatus("washing", "Clothes in Washing Machine");
  }, 2000);

  setTimeout(() => {
    currentOrder.status = "Ready";
    setStatus("ready", `Order Ready (Locker: ${currentOrder.locker_id})`);
  }, 5000);

  setTimeout(() => {
    currentOrder.status = "Collected";
    setStatus("collected", "Order Collected");
  }, 8000);
});

/* -------------------------------------------
 Console message
--------------------------------------------*/
console.log("🚀 Frontend is ready!");
