# 🗣️ Voice-to-Task — Stage 2 Update

## 🎯 Overview

This stage adds a Voice-to-Task feature to the to-do list app. Users can now press a floating microphone button to dictate tasks, which are automatically transcribed and added to their to-do list.

---

## ⚙️ API Choice: AssemblyAI Speech-to-Text

### Why AssemblyAI?

I selected AssemblyAI speech-to-text because:

- ✅ **No backend required** — can call the REST API directly from React Native
- ✅ **Simple, well-documented API**
- ✅ **Good accuracy** for conversational English
- ✅ **Free tier** (100 minutes/month)

---

## 🔄 Integration Flow

1. The app records audio using `expo-audio`
2. The recorded file is uploaded to AssemblyAI's upload endpoint
3. A transcription request is created
4. The app polls AssemblyAI every second until the transcription completes
5. The final text is returned and passed to the natural-language parser

---

## 💻 Core Logic (Simplified)

```javascript
const fileResponse = await fetch(audioUri);
const fileBlob = await fileResponse.blob();

// 1️⃣ Upload to AssemblyAI
const uploadResponse = await fetch("https://api.assemblyai.com/v2/upload", {
  method: "POST",
  headers: { authorization: API_KEY },
  body: fileBlob,
});
const { upload_url } = await uploadResponse.json();

// 2️⃣ Request transcription
const transcriptResponse = await fetch("https://api.assemblyai.com/v2/transcript", {
  method: "POST",
  headers: {
    authorization: API_KEY,
    "content-type": "application/json",
  },
  body: JSON.stringify({ audio_url: upload_url }),
});
const { id } = await transcriptResponse.json();

// 3️⃣ Poll until ready
let transcriptData;
do {
  const poll = await fetch(`https://api.assemblyai.com/v2/transcript/${id}`, {
    headers: { authorization: API_KEY },
  });
  transcriptData = await poll.json();
  await new Promise(res => setTimeout(res, 1000));
} while (transcriptData.status !== "completed");

setTranscript(transcriptData.text);
```

---

## 🔐 Environment Setup

### 1. Store Key in `.env`

```env
ASSEMBLYAI_API_KEY=your_api_key_here
```

### 2. Inject via `app.config.js`

```javascript
import "dotenv/config";

export default {
  expo: {
    extra: { 
      assemblyApiKey: process.env.ASSEMBLYAI_API_KEY 
    },
  },
};
```

### 3. Access in App

```javascript
import Constants from "expo-constants";
const API_KEY = Constants.expoConfig?.extra?.assemblyApiKey;
```

---

## 🧠 Natural Language Parsing Approach

Once the transcript text is received (e.g., `"Buy groceries and call mom then finish report"`), a lightweight parser breaks it into individual actionable tasks.

### Steps

1. **Normalize text**: convert to lowercase, trim punctuation
2. **Split on common connectors**:
   - Keywords: `"and"`, `"then"`, `","`
   - Regex: `/\band\b|\bthen\b|,/gi`
3. **Filter out blanks** and trim whitespace
4. **Create one task** per phrase

### Example

```javascript
const text = "Buy groceries and call mom then finish report";

const tasks = text
  .split(/\band\b|\bthen\b|,/gi)
  .map(t => t.trim())
  .filter(Boolean);
// => ["Buy groceries", "call mom", "finish report"]

tasks.forEach(addTaskToList);
```

### Why This Approach?

- ✅ Simple and transparent
- ✅ Works well for short dictations
- 🧩 Can easily be upgraded later to use NLP libraries (like spaCy or Compromise) for intent detection

---

## 🧪 Testing

1. Press the mic FAB
2. Speak naturally (e.g., "Buy provisions and call mom")
3. Watch the app transcribe and add each task individually
4. Check logs for `AssemblyAI Key Loaded ✅`

---

## 🧱 Future Improvements

- [ ] Add real-time streaming transcription (AssemblyAI Realtime or Google STT)
- [ ] Handle complex sentences ("remind me to…")
- [ ] Add multi-language support
- [ ] Improve UI feedback for long recordings

---

## 💬 Summary

| Area | Implementation |
|------|----------------|
| **API Used** | AssemblyAI |
| **Auth Method** | `.env` → `app.config.js` → `expo-constants` |
| **Backend Required** | ❌ None |
| **Parsing Logic** | Regex-based split on "and", "then", "," |
| **Output** | Each phrase → new task in to-do list |

---

## 📝 License

This project is part of a to-do list application with voice input capabilities.