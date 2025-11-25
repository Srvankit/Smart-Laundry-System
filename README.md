# Smart Laundry System 🧺🚀  
AI + IoT + UPI + Blockchain Prototype  

![Demo Screenshot](assets/screenshot.png)

This project demonstrates a futuristic smart laundry system using:
- UPI payments (PhonePe, Google Pay, Paytm, etc.)
- Aptos Blockchain payment verification (Petra Wallet)
- Firestore real-time order tracking
- Locker assignment & pickup system
- Machine (IoT) simulation
- Full multi-step UI workflow

---

## 🚀 Features
### 1️⃣ Step 1 — Order Creation
- Customer details
- IoT weight simulation
- Price auto-calculation  
- Firestore record creation

### 2️⃣ Step 2 — Payment  
- UPI QR Code (scannable)  
- Optional Aptos blockchain payment  
- Petra wallet support  
- Transaction hashing + timeline update

### 3️⃣ Step 3 — Processing Status  
- Real-time order updates  
- IoT machine animation  
- Timeline sync with Firestore  

### 4️⃣ Step 4 — Summary  
- Order ID  
- Final status  
- Full timeline  
- “Start New Order” reset

---

## 📁 Project Structure
smart-laundry-system/
│
├── index.html
├── payment.html
├── locker.html
├── status.html
├── summary.html
├── style.css
├── main.js
├── firebase-init.js
└── assets/
└── screenshot.png


---

## 🛠️ Local Development

Open folder in VS Code then:

```bash
python -m http.server 5500
