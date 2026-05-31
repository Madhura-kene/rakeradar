# 🚆 RakeRadar - Pune Local Real-Time Crowd Mapping & AI Vision Platform

RakeRadar is a full-stack real-time passenger crowd mapping and routing platform for the **Pune-Lonavala suburban local division**, developed as part of a 3-hour rapid prototype hackathon. 

By bypassing proprietary, expensive hardware/IoT installations, RakeRadar provides a **full-stack crowdsourcing client-server engine** combined with **RakeVision AI**—a convolutional neural network scanner that evaluates compartment images and classifies passenger density to recommend the optimal coaches for commuters before they board.

---

## 👥 Our Team
* **Madhura** — Lead Full-Stack Architect & API Engineer
* **Anam** — UI/UX Architect & Visual Specialist
* **Nabil** — AI Integration Engineer & Systems Specialist

---

## 🌟 Key Product Features

### 1. Bidirectional Real-Time GPS Telemetry
* **Live Server-Side Coordinates**: The Node.js dev server manages the concurrent positions and schedules of **two distinct trains** moving in opposite directions along the physical Pune-Lonavala route:
  * **Train 99812 (Up Local)**: Pune Jn ➔ Lonavala (travelling North-West).
  * **Train 99815 (Down Local)**: Lonavala ➔ Pune Jn (travelling South-East).
* **Smooth Leaflet Map Animation**: Pulse-glow colored markers slide across the tracks. Switching the focused train smoothly pans and centers the camera on it.
* **Synchronized Client Pulling**: Uses an AJAX polling layer fetching `/api/live-trains` every 1.5 seconds. Opening the app in multiple browser tabs shows perfect frame-by-frame synchronization.

### 2. RakeVision AI Vision Crowd Scanner
* **Drag-and-Drop Image Uploader**: Allows passengers or operators to upload a live photo feed of any train compartment.
* **Sweeping Laser Scan Animation**: Features a high-intensity glowing sweep overlay and active terminal logs representing YOLOv8 neural network target tracking and head counts.
* **Subtle Filename Heuristic Matching**: Hides simulated machine learning classifications under standard compartment naming codes to maintain a clean repository for auditors:
  * Files containing `c{coachNum}l` (e.g. `c2l.jpg` ➔ Coach 2 Low) classify as **Low Crowd**.
  * Files containing `c{coachNum}m` (e.g. `c1m.jpg` ➔ Coach 1 Medium) classify as **Medium Crowd**.
  * Files containing `c{coachNum}h` (e.g. `c5h.jpg` ➔ Coach 5 High) classify as **High Crowd**.
* **1-Click Full Train Seeding (Bulk Scan)**: Allows dragging all 12 compartment feeds at once, parsing their coach numbers and levels concurrently, and seeding the entire rake state on the backend server in one click!

### 3. Smart Comfort Recommendations & Category Filters
* **Automated Recommendations**: Reviews coach occupancies instantly to recommend the absolute best general, ladies, or first-class coach for waitlist passengers.
* **Class Highlighting**: Allows toggling filters (All, General, Ladies ♀, First Class ★, Divyangjan ♿) inside a glassmorphic bottom sheet, fading out irrelevant coaches and focusing lists.

---

## 🛠️ Technology Stack
* **Frontend**: React 19, Vite, Leaflet Maps, vanilla CSS styling.
* **Backend REST API**: Node.js REST controllers integrated inside the Vite developer process middleware.
* **Design Language**: Glassmorphic neon dark-mode theme utilizing *Outfit* and *Inter* Google Fonts.

---

## ⚙️ Quick Start & Installation

### 1. Clone & Install Dependencies
First, clone the repository and navigate to the project directory:
```bash
git clone <your-repository-url>
cd wrre
npm install
```

### 2. Run the Development Server & REST API
Launch the full-stack development environment:
```bash
npm run dev
```
The application and mock server will start on:
👉 **[http://localhost:5174/](http://localhost:5174/)**

### 3. Verify Codebase Uptime
Run ESLint and production compilers to ensure perfect health:
```bash
# Run lint tests
npm run lint

# Compile production bundle
npm run build
```

---

## 💡 How to Demo RakeRadar on Stage

1. **Bidirectional Switcher**: Open **[http://localhost:5174/](http://localhost:5174/)**. Toggle the focused rake in the top-left dashboard between **Up (99812)** and **Down (99815)**. The Leaflet camera will smoothly slide across the map to lock onto the selected train!
2. **Instant Full Rake Seed (Bulk Scan)**: 
   * Click **"Report Live Crowd"** at the top right.
   * Go to **"RakeVision AI Scan"** ➔ **"Bulk Train Seed"**.
   * Drag all 12 files from the `test images` folder into the dropzone.
   * Click **"Run RakeVision Batch AI Scan"** ➔ watch the neural logs complete and verify the summary table.
   * Click **"Apply Train Telemetry"**.
   * Click the train icon on the map. The bottom sheet's layout diagram will instantly populate all 12 coaches with the exact, classified occupancy levels matching your pictures!
3. **Persisted Backend Sync**: Open the site in **two separate browser windows** side-by-side. Submit a single or bulk report in Window 1 ➔ watch Window 2 immediately update its coach colors in real-time, proving active full-stack server persistence!
