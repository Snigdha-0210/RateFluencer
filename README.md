# 🎬 Creator OS (AI Viral Reel Creator Agent)

🎥 **[Watch the Hackathon Demo Video Here!](https://drive.google.com/file/d/1uOjqjqgKyHGg-crPnx7UqVCqUM1OnG70/view?usp=sharing)**

Creator OS is an autonomous AI agent built for the **AI Viral Reel Creator** hackathon track. It completely automates the content creation workflow for influencers and marketers—from discovering global trends to writing highly-engaging reel scripts, generating voiceovers, and predicting virality.

## 🚀 Key Features

* **Global Trend Discovery Engine:** Scrapes real-time trending topics and YouTube data to identify high-velocity viral content opportunities.
* **Autonomous Reel Generation:** Input any vague topic (e.g., "Finance") and the AI will autonomously research, expand ideas, and write a complete 4-part video script (Hook, Story, Data, CTA).
* **AI Voiceover Synthesis:** Instantly converts the generated script into a playable, broadcast-quality voiceover using Google's Text-to-Speech engine.
* **Multi-Platform Output:** Automatically generates tailored LinkedIn text posts and Instagram captions, complete with AI-optimized hashtags.
* **Virality Prediction:** Uses advanced LLM analysis to score the generated hook and script on a scale of 0-100 for its potential to go viral.
* **Smart Content Studio:** Provides a simulated TikTok/Shorts environment to preview your generated video, voiceover, and captions in real-time.
* **One-Click "AI Improve":** Instantly rewrite and optimize any part of your script (hook, story, etc.) to be punchier and more engaging using Llama-3.1.

## 🛠️ Technology Stack

* **Frontend:** Next.js 14 (App Router), React, Tailwind CSS, Framer Motion
* **AI / LLMs:** Groq SDK (Llama-3.1-8b-instant) for blazing-fast script generation and text optimization
* **Audio:** Google TTS API for instant text-to-speech rendering
* **Database:** Firebase / Firestore for caching trends and saving drafts
* **Deployment:** Vercel

## ⚙️ Getting Started

First, clone the repository and install the dependencies:

```bash
npm install
```

Configure your environment variables in `.env.local`:
```bash
GROQ_API_KEY="your_groq_api_key"
YOUTUBE_API_KEY="your_youtube_api_key"
# Add your Firebase service account credentials as well
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to launch the Creator OS dashboard.

## 🏆 Hackathon Track
This project was built to solve the core problem of creator burnout by automating the heavy lifting of trend research, scriptwriting, and production.
