# AI-Powered Grievance Redressal System

## Project Details
- **Project Name:** AI-Powered Grievance Redressal System  
- **Team Name:** Screen Warriors  
- **Problem Statement ID:** PS-12 – AI for Grievance Redressal in Public Governance  

---

## 📌 Problem Statement

Public governance bodies receive thousands of citizen grievances every day, covering issues such as civic infrastructure, sanitation, public safety, utilities, healthcare, education, and administrative delays. These complaints are often unstructured, manually processed, and lack intelligent prioritization, leading to delayed resolutions, fake or duplicate complaints, and poor accountability.

There is a pressing need for an AI-powered grievance redressal system that can intelligently analyze complaints, prioritize them based on urgency, and transparently route them to the appropriate authorities.

---

## 🧠 Project Overview

The **AI-Powered Grievance Redressal System** is a secure and transparent platform designed to modernize public grievance handling using **Artificial Intelligence, Blockchain, and Self-Sovereign Identity (SSI)**. Citizens can submit complaints using text, image, or audio formats, while AI automatically classifies, summarizes, and prioritizes grievances. Blockchain ensures tamper-proof storage of complaint records, and SSI-based verification prevents fake or fraudulent submissions, enabling trust and accountability throughout the grievance lifecycle.

---

## 🎥 Demo & Presentation Links

- **Solution Explanation (Intro Video):**  
  https://drive.google.com/file/d/1x3X97UmzSf8MECu1uYFgloqoxQNRrKDw/view?usp=drive_link

- **2-Minute Demo Video:**  
  https://drive.google.com/file/d/1KkUqGPU54YpHWp7N7p4Y3AZJnCYzlmgw/view?usp=drive_link

- **Project PPT:**  
  https://docs.google.com/presentation/d/13kack67W-2rKOQgcUfuRQT3JOgXMVCO-/edit?usp=drive_link&ouid=113714342203219963250&rtpof=true&sd=true

---

## 🛠️ Technology Stack

- **Frontend:** React.js  
- **Backend:** Python (Flask)  
- **Blockchain:** Ganache (Ethereum Local Network)  
- **Smart Contracts:** Solidity  
- **Wallet Integration:** MetaMask   

---

## 🚀 How to Run the Project

### 1️⃣ Blockchain Setup

#### Prerequisites
- Node.js  
- Ganache  
- MetaMask  
- Truffle  

#### Install Truffle
```bash
npm install -g truffle
```
Start Ganache

Open Ganache GUI
OR
```bash
ganache-cli
```

Compile and Deploy Smart Contracts
```bash
cd blockchain
truffle compile
truffle migrate --reset
```

After deployment:

Copy the smart contract address from the terminal output.

Update the contract address in the frontend contract.js.

2️⃣ Backend Setup (Flask)

Navigate to the backend directory:
```bash
cd backend
```

(Optional) Create and activate a virtual environment:
```bash
python -m venv venv
source venv/bin/activate   # On Windows: venv\Scripts\activate
```

Install backend dependencies:
```bash
pip install -r requirements.txt
```

Run the backend server:
```bash
python app.py
```

Backend will run on:

http://localhost:5000

3️⃣ Frontend Setup (React)

Navigate to the frontend directory:
```bash
cd frontend
```

Install frontend dependencies:
```bash
npm install
```

Start the frontend application:
```bash
npm start
```

Frontend will run on:

http://localhost:3000
