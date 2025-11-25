# Smart Laundry System 🧺🚀

**AI + IoT + UPI + Blockchain** — a Smart Laundry kiosk prototype demonstrating:
- UPI payments (scannable QR)
- Optional Aptos blockchain verification (Petra wallet)
- Locker assignment + pickup PIN
- Real-time order tracking (Firebase Firestore)
- IoT machine simulation (ESP32-ready logic)

![Demo Screenshot](assets/screenshot.png)

---

## Live demo
- If hosted: `https://your-username.github.io/smart-laundry-system/`  
- Or Firebase hosting: `https://smart-laundry-system-d845c.web.app` (if you deployed)

---

## Features
- Multi-step flow: **Create → Pay → Locker → Process → Summary**
- UPI QR generation for PhonePe / GPay / Paytm
- Optional Aptos payment via Petra Wallet (testnet)
- Locker assignment with a secure pickup code
- Real-time status timeline synced via Firestore
- Simple IoT simulation UI for demo (ready to connect ESP32)

---

## Project structure
```
smart-laundry-system/
├── index.html
├── payment.html
├── locker.html
├── status.html
├── summary.html
├── style.css
├── main.js
├── firebase-init.js
├── qrcode.min.js
├── assets/
│   └── screenshot.png
├── README.md
└── LICENSE
```

---

## Quick start (run locally)
1. Clone the repo:
```bash
git clone https://github.com/<yourusername>/Smart-Laundry-System.git
cd Smart-Laundry-System
```

2. Serve locally (Python):
```bash
python -m http.server 5500
# open http://localhost:5500 in your browser
```

---

## Firebase (client-side)
- The project uses Firebase Firestore for real-time orders.
- Keep sensitive credentials out of the repo.
- Use `firebase-init.example.js` to store placeholders and create a real `firebase-init.js` locally (do **not** commit real secrets).

---

## License
MIT © Your Name
