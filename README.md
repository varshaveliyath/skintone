# SkinTone Analysis & Clothing Recommendation App

A smart fashion–tech application that analyzes a user’s skin tone and undertone from an uploaded image and provides **personalized clothing, color, fabric, jewelry, and outfit pairing recommendations**.  
The goal of this app is to remove confusion in styling decisions and help users dress with confidence based on their natural complexion.

---

## Features

### Skin Tone & Undertone Detection

- Detects **skin depth** (Light / Dusky / Dark)
- Identifies **undertone** (Warm / Cool / Neutral)
- Combines both to produce an accurate **skin subtype** (e.g., Light Warm, Dusky Cool)

### Personalized Styling Recommendations

- Colors that **suit** the skin tone and _why_
- Colors that should be **avoided** and _why_
- Best **jewelry metals** (Gold, Silver, Rose Gold)
- **Fabric & finish** guidance (matte, luminous, textured, structured)

### Quick Outfit Pairing Guide

- Intelligent **top–bottom color combinations**
- Mixes light and deep shades from recommended colors
- Includes jewelry suggestions per pairing
- Explains the **styling logic** behind each combination

---

## Tech Stack

### Frontend

- **React.js** – Component-based UI and app routing
- **Tailwind CSS** – Utility-first styling for clean, responsive design
- **Lucide React** – Icon library (LinkedIn, GitHub, Mail icons)
- **JavaScript (ES6+)** – Frontend logic and state handling

### Backend

- **Python** – Core backend language
- **Flask / FastAPI** – REST API for image processing and analysis
- **MediaPipe Facemesh** – Face detection and skin region extraction
- **NumPy** – Image and pixel-level computations

### Machine Learning & Image Processing

- **Computer Vision Techniques** – Skin pixel sampling and averaging
- **RGB Color Space Analysis** – Skin tone depth detection
- **Rule-Based Classification** – Undertone and subtype mapping logic

### Data Handling

- **JSON** – Structured data exchange between frontend and backend
- **Base64 Encoding** – Image transfer and preview handling

### Development & Tooling

- **Git & GitHub** – Version control and code hosting
- **VS Code** – Development environment
- **Node.js & npm** – Frontend dependency management
- **Python Virtual Environment** – Backend dependency isolation

### Deployment (Optional / Local)

- **Vercel** – Frontend deployment
- **Render** – Backend hosting

---

## Styling Logic Used

- **Warm undertones** → gold metals, earthy & warm hues
- **Cool undertones** → silver metals, jewel & cool shades
- **Neutral undertones** → balanced palettes, mixed metals
- Light + Dark contrast used for outfit pairing
- Avoids overpowering or washing out the complexion

---

## Future Improvements

- Save user profiles
- Wardrobe upload & matching
- Occasion-based outfit suggestions
- AR try ons 
- Seasonal color palette switching

---

## Author

**Varsha Veliyath**  
Fashion-Tech Developer & UI Engineer   
🔗 LinkedIn: https://www.linkedin.com/in/varshaveliyath

---

© 2026 — SkinTone Analysis App. All Rights Reserved.


