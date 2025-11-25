// ------------------------------
// FIREBASE IMPORTS
// ------------------------------
import {
  doc,
  setDoc,
  updateDoc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

// ------------------------------
// CONSTANTS
// ------------------------------
const STORAGE_KEY = "SmartLaundryOrder";
const RATE_PER_KG = 0.5;
const UPI_ID = "ajeet212009@fam";
const MERCHANT_ADDRESS = "0x7e14c764065e7c0f96dfe365251ddd50f4a1940916c67e87464c08ce5f520d82";
const APT_RATE = 0.001;

// ------------------------------
// HELPERS
// ------------------------------
const saveOrder = (order) => localStorage.setItem(STORAGE_KEY, JSON.stringify(order));
const loadOrder = () => JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
const newOrderID = () => "ORD-" + Date.now();
const nowString = () => new Date().toLocaleString();
const disable = (btn) => { if (btn) { btn.disabled = true; btn.style.opacity = "0.5"; } };

function addTimeline(order, label) {
  order.timeline.push({ label, time: nowString() });
}


// ------------------------------
// PAGE ROUTER
// ------------------------------
document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.dataset.page;

  if (page === "step1") initStep1();
  if (page === "step2") initStep2();
  if (page === "step3") initStep3();
  if (page === "step4") initStep4();
  if (page === "locker") initLocker();      // 👈 locker page hook
});


// ------------------------------
// STEP 1 — ORDER CREATION
// ------------------------------
function initStep1() {

  document.getElementById("btnSimWeight").addEventListener("click", () => {
    const w = (Math.random() * 5 + 1).toFixed(2);
    document.getElementById("weightInput").value = w;
    document.getElementById("priceInput").value = (w * RATE_PER_KG).toFixed(0);
  });

  document.getElementById("btnStep1Next").addEventListener("click", async () => {
    const weight = document.getElementById("weightInput").value;
    if (!weight) return alert("⚠ Please simulate weight first.");

    const order = {
      id: newOrderID(),
      name: document.getElementById("custName").value || "Guest",
      phone: document.getElementById("custPhone").value,
      email: document.getElementById("custEmail").value,
      weightKg: weight,
      priceInr: document.getElementById("priceInput").value,
      status: "Created",
      timeline: []
    };

    addTimeline(order, "Order Created");
    saveOrder(order);

    await setDoc(doc(window.db, "orders", order.id), order);
    window.location.href = "payment.html";
  });
}


// ------------------------------
// STEP 2 — PAYMENT PAGE
// ------------------------------
async function initStep2() {

  const order = loadOrder();
  if (!order) return window.location.href = "index.html";

  document.getElementById("orderSummary").innerHTML = `
    <p><strong>Order ID:</strong> ${order.id}</p>
    <p><strong>Name:</strong> ${order.name}</p>
    <p><strong>Total Amount:</strong> ₹${order.priceInr}</p>
  `;

  // UPI QR
  const upiString = `upi://pay?pa=${UPI_ID}&pn=SmartLaundry&am=${order.priceInr}&cu=INR`;
  document.getElementById("qrPayloadPreview").innerText = upiString;

  document.getElementById("qrContainer").innerHTML = "";
  new QRCode(document.getElementById("qrContainer"), {
    text: upiString,
    width: 220,
    height: 220
  });

  // PETRA WALLET BUTTONS
  const aptos = window.aptos;
  const aptAmount = (order.priceInr * APT_RATE).toFixed(6);

  const btnConnect = document.getElementById("btnConnectWallet");
  const btnPayAptos = document.getElementById("btnPayWithAptos");
  const btnManualVerify = document.getElementById("btnVerifyOnChain");

  if (btnConnect) {
    btnConnect.addEventListener("click", async () => {
      if (!aptos) {
        alert("Petra wallet not detected. Install Petra extension in desktop browser to use Aptos payments.");
        return;
      }
      try {
        await aptos.connect();
        order.userWallet = await aptos.account();
        saveOrder(order);
        alert("Wallet Connected: " + order.userWallet.address);
        disable(btnConnect);
        if (btnPayAptos) btnPayAptos.disabled = false;
      } catch {
        alert("❌ Wallet connection failed");
      }
    });
  }

  if (btnPayAptos) {
    btnPayAptos.addEventListener("click", async () => {
      if (!aptos) {
        alert("Petra wallet not detected.");
        return;
      }
      if (!order.userWallet) return alert("Connect wallet first!");

      const payload = {
        type: "entry_function_payload",
        function: "0x1::coin::transfer",
        arguments: [MERCHANT_ADDRESS, Math.floor(aptAmount * 1e8)],
        type_arguments: ["0x1::aptos_coin::AptosCoin"]
      };

      try {
        const txHash = await aptos.signAndSubmitTransaction(payload);

        order.aptosTxHash = txHash;
        order.status = "Blockchain Payment Confirmed";
        addTimeline(order, "Aptos Payment Successful");

        await updateDoc(doc(window.db, "orders", order.id), {
          status: order.status,
          aptosTxHash: txHash,
          blockchainAmountAPT: aptAmount,
          walletAddress: order.userWallet.address,
          paymentMethod: "UPI + Aptos",
          timeline: order.timeline
        });

        saveOrder(order);
        disable(btnPayAptos);

        alert("Payment Success!\nTX: " + txHash);
        window.open(`https://explorer.aptoslabs.com/txn/${txHash}?network=testnet`);

      } catch {
        alert("❌ Blockchain transaction failed");
      }
    });
  }

  if (btnManualVerify) {
    btnManualVerify.addEventListener("click", () => {
      alert("Manual verification coming soon. Use Aptos button or UPI for now.");
    });
  }

  // Move to locker assignment, not directly to status
  document.getElementById("btnStep2Next").addEventListener("click", () => {
    window.location.href = "locker.html";
  });
}


// ------------------------------
// LOCKER ASSIGNMENT PAGE
// ------------------------------
async function initLocker() {
  const order = loadOrder();
  if (!order) return window.location.href = "index.html";

  const lockerBox = document.getElementById("lockerBox");
  const btnNext = document.getElementById("btnLockerNext");
  if (!lockerBox || !btnNext) return;

  // If locker already assigned (user returns to page), just show it
  if (order.locker && order.pickupCode) {
    lockerBox.innerHTML = `
      <p><strong>Locker:</strong> #${order.locker}</p>
      <p><strong>Pickup Code:</strong> ${order.pickupCode}</p>
      <small>Use this code at the locker station to collect your clothes.</small>
    `;
    btnNext.style.display = "inline-flex";
    btnNext.onclick = () => window.location.href = "status.html";
    return;
  }

  // Simple mock locker assignment (later you can get this from Firestore)
  const availableLockers = [1, 2, 3, 4, 5];
  const assignedLocker = availableLockers[Math.floor(Math.random() * availableLockers.length)];
  const pickupCode = "PIN-" + Math.floor(1000 + Math.random() * 9000);

  order.locker = assignedLocker;
  order.pickupCode = pickupCode;
  order.status = "Locker Assigned";
  addTimeline(order, "Locker Assigned");
  saveOrder(order);

  try {
    await updateDoc(doc(window.db, "orders", order.id), {
      locker: assignedLocker,
      pickupCode,
      status: order.status,
      timeline: order.timeline
    });
  } catch (e) {
    console.error("Failed to update locker info in Firestore", e);
  }

  lockerBox.innerHTML = `
    <p><strong>Locker Assigned:</strong> #${assignedLocker}</p>
    <p><strong>Pickup Code:</strong> ${pickupCode}</p>
    <small>Share this code with the customer. It will be required to unlock the locker.</small>
  `;

  btnNext.style.display = "inline-flex";
  btnNext.onclick = () => window.location.href = "status.html";
}


// ------------------------------
// STEP 3 — LIVE STATUS + IoT SIMULATION
// ------------------------------
function initStep3() {

  const order = loadOrder();
  if (!order) return window.location.href = "index.html";

  const timelineBox = document.getElementById("timeline");
  const statusTitle = document.getElementById("statusTitle");
  const btnFlow = document.getElementById("btnStartFlow");
  const btnNext = document.getElementById("btnStep3Next");

  // IoT UI elements
  const iotStatus = document.getElementById("iotStatus");
  const machineAnimation = document.getElementById("machineAnimation");
  const simulateBtn = document.getElementById("simulateMachine");

  function renderTimeline() {
    timelineBox.innerHTML = order.timeline
      .map(e => `<div class="timeline-item">${e.label}<div class="time">${e.time}</div></div>`)
      .join("");
  }

  // IoT Simulation Logic
  function updateMachineUI(state) {
    if (!iotStatus || !machineAnimation) return;

    machineAnimation.style.display = "none";

    const states = {
      "Paid": "🔓 Machine Unlocked — Load Clothes",
      "Washing": "🌀 Washing... Machine Running",
      "Ready": "🔔 Wash Complete — Collect Clothes",
      "Collected": "💤 Machine Reset",
      default: "🛑 Machine Idle"
    };

    iotStatus.innerHTML = states[state] || states.default;
    if (state === "Washing") machineAnimation.style.display = "block";
  }

  if (simulateBtn) {
    simulateBtn.addEventListener("click", () => updateMachineUI(order.status));
  }

  // Realtime Firestore Sync
  onSnapshot(doc(window.db, "orders", order.id), (snap) => {
    const data = snap.data();
    if (!data) return;
    Object.assign(order, data);
    saveOrder(order);
    statusTitle.textContent = `Status: ${order.status}`;
    renderTimeline();
  });

  if (btnFlow) {
    btnFlow.addEventListener("click", async () => {
      disable(btnFlow);

      const flow = ["Paid", "Washing", "Ready", "Collected"];
      let i = 0;

      const timer = setInterval(async () => {
        if (i >= flow.length) {
          clearInterval(timer);
          if (btnNext) btnNext.disabled = false;
          return;
        }

        order.status = flow[i];
        addTimeline(order, flow[i]);
        saveOrder(order);

        await updateDoc(doc(window.db, "orders", order.id), {
          status: order.status,
          timeline: order.timeline
        });

        updateMachineUI(order.status);
        i++;
      }, 1600);
    });
  }

  if (btnNext) {
    btnNext.addEventListener("click", () => window.location.href = "summary.html");
  }
  renderTimeline();
}


// ------------------------------
// STEP 4 — SUMMARY PAGE
// ------------------------------
function initStep4() {

  const order = loadOrder();
  if (!order) return window.location.href = "index.html";

  document.getElementById("summaryOrderId").textContent = order.id;
  document.getElementById("summaryStatus").textContent = order.status;
  document.getElementById("summaryPrice").textContent = `₹${order.priceInr}`;

  const timelineEl = document.getElementById("summaryTimeline");
  if (timelineEl) {
    timelineEl.innerHTML = order.timeline
      .map(e => `<div class="timeline-item">${e.label}<div class="time">${e.time}</div></div>`)
      .join("");
  }

  // Optional: show locker + pickup code if you added elements in summary.html
  const lockerEl = document.getElementById("summaryLocker");
  const codeEl = document.getElementById("summaryCode");
  if (lockerEl) lockerEl.textContent = order.locker || "Not assigned";
  if (codeEl) codeEl.textContent = order.pickupCode || "N/A";

  document.getElementById("btnNewOrder").addEventListener("click", () => {
    localStorage.removeItem(STORAGE_KEY);
    window.location.href = "index.html";
  });
}
