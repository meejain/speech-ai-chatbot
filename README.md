# AI-Powered & Voice-Enabled Content Chatbot

Speak or type to update website content. AI generates images, transforms content, and publishes automatically—no manual workflow needed.

**Live Demo:** https://main--speech-ai-chatbot--meejain.aem.live/

## 🎥 Demo Video

> **[📹 Watch Demo](YOUR_VIDEO_LINK_HERE)** - Voice → AI → Live in 60 seconds

## ✨ Key Features

- 🎤 **Voice Commands** - Speak naturally to update content
- 🤖 **AI-Powered** - GPT-4 understands intent and transforms content
- 🎨 **Auto Image Gen** - DALL-E 3 creates custom images
- ⚡ **Auto Publish** - Live on CDN in seconds, no manual steps
- 🔄 **Two Approaches** - Direct HTML editing or Power Automate workflows

## 🔄 Architecture: Two Approaches

### Approach 1: Direct DA HTML Editing (Default)

**Best for:** Simple to moderate sites, fast updates, direct control

```
┌─────────────────────────────────────────────────────────────────┐
│                   DIRECT DA HTML EDITING                        │
└─────────────────────────────────────────────────────────────────┘

   👤 User Input
   (Voice/Text)
        │
        ▼
   🎤 Speech API
   (Browser)
        │
        ▼
   📡 Fetch Current HTML ────────┐
   from DA API                   │
        │                        │
        ▼                        │
   🤖 GPT-4 Analysis             │ Direct
   • Parse structure             │ HTML
   • Generate plan               │ Access
        │                        │
        ▼                        │
   🎨 DALL-E 3                   │
   Generate Images               │
        │                        │
        ▼                        │
   📤 Upload to                  │
   /assets/assets-cu/            │
        │                        │
        ▼                        │
   🔧 Transform HTML ◄───────────┘
   (String Replace)
        │
        ▼
   📝 POST Updated HTML
   to DA API
        │
        ▼
   🔄 Auto Preview
   (EDS API)
        │
        ▼
   🚀 Auto Publish
   (EDS API)
        │
        ▼
   ✅ LIVE ON CDN
   (< 10 seconds)
```

**Characteristics:**
- ✅ Direct HTML manipulation
- ✅ Immediate updates (< 10 seconds)
- ✅ Simple token setup
- ✅ Works with standard blocks

---

### Approach 2: Power Automate + DA Sheet (Optional)

**Best for:** Enterprise workflows, approvals, Microsoft integration

```
┌─────────────────────────────────────────────────────────────────┐
│              POWER AUTOMATE + DA SHEET                          │
└─────────────────────────────────────────────────────────────────┘

   👤 User Input
   (Voice/Text)
        │
        ▼
   🎤 Speech API
   (Browser)
        │
        ▼
   📡 HTTP Trigger ──────────────┐
   Power Automate Webhook        │
        │                        │
        ▼                        │
   ┌──────────────────────────┐ │ Power
   │  POWER AUTOMATE FLOW     │ │ Automate
   │                          │ │ Cloud
   │  🤖 GPT-4 Connector      │ │ (Secure)
   │  • Analyze request       │ │
   │                          │ │
   │  🎨 DALL-E Connector     │ │
   │  • Generate images       │ │
   │                          │ │
   │  📤 HTTP Action          │ │
   │  • Upload to DA          │ │
   │                          │ │
   │  📊 Update DA Sheet      │ │
   │  • Push JSON data        │ │
   │                          │ │
   │  🔄 Trigger Preview      │ │
   │  🚀 Trigger Publish      │ │
   └──────────────────────────┘ │
        │                        │
        ▼                        │
   📄 EDS Blocks ◄──────────────┘
   Fetch JSON
        │
        ▼
   🎨 Client-Side
   Rendering
        │
        ▼
   ✅ LIVE CONTENT
   (Dynamic Updates)
```

**Characteristics:**
- 🔒 Secure API keys (server-side)
- 📊 Full audit trail
- ✔️ Approval workflows
- 🔗 Microsoft ecosystem integration

## 🚀 Quick Start

### 1. Install Chatbot

Add to your page:
```
---
chatbot
---
```

### 2. Configure Tokens

Create `da-config.txt`:
```txt
DA_IMS_TOKEN="your-token"
ADMIN_AUTH_TOKEN="your-token"
```

Create `ai-config.txt`:
```txt
OPENAI_TOKEN="sk-your-key"
OPENAI_CHAT_URI="https://api.openai.com/v1/chat/completions"
OPENAI_IMAGE_URI="https://api.openai.com/v1/images/generations"
```

**Get Tokens:**
- **DA Token:** Login to [da.live](https://da.live) → Console → `copy(adobeIMS.getAccessToken().token)`
- **OpenAI Key:** [platform.openai.com](https://platform.openai.com) → API Keys
- **Admin Token:** [admin.hlx.page](https://admin.hlx.page) → DevTools → Network → Copy `x-auth-token`

### 3. Use It

**Voice:**
1. Click mic button
2. Say: *"Update hero block with Paris skyline"*
3. Wait 3s or click again to send

**Text:**
1. Type: *"Change cards to show Cricket and Football"*
2. Press Enter

## 💬 Example Commands

```
✅ "Update hero block with New York skyline"
✅ "Update columns block about Paris and Zurich"
✅ "Change cards block to show sports - Cricket / Football"
✅ "Update second card with San Francisco"
```

## ⚙️ Configuration

### Switch to Power Automate

Edit `blocks/chatbot/chatbot.js`:
```javascript
const INTEGRATION_MODE = 'POWER_AUTOMATE';
const POWER_AUTOMATE_URL = 'your-webhook-url';
```

See code comments for full setup.

### Customize for Complex Sites

Edit system prompt in `blocks/chatbot/chatbot.js`:
```javascript
const systemPrompt = `Your site-specific rules...
- Document custom blocks
- Add heading patterns
- Define transformation rules
`;
```

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| "AI configuration not found" | Check `ai-config.txt` exists with valid `OPENAI_TOKEN` |
| "DA_IMS_TOKEN not found" | Check `da-config.txt` exists, token may be expired |
| "Speech not supported" | Use Chrome/Edge, ensure HTTPS/localhost |
| "Could not find heading" | Be more specific, check page structure in console |
| Images not appearing | Wait 30s for CDN, hard refresh browser |

## 🔒 Security

- ✅ `da-config.txt` and `ai-config.txt` are in `.gitignore`
- ✅ Never commit tokens to git
- ✅ Use `.example` files for sharing structure
- ✅ For production: Use Power Automate for secure key management

## 📊 Monitoring

Open browser console to see:
```
📄 Detected page: index
🤖 Asking AI to analyze...
🎨 Generating image...
✅ Image generated successfully
📤 Uploading to DA...
✅ Asset available at: [URL]
```

## 🛠️ Development

```sh
# Install
npm install

# Local dev
npm install -g @adobe/aem-cli
aem up  # Opens http://localhost:3000

# Lint
npm run lint
```

## ⚠️ Important Notes

**Works Best With:**
- ✅ Simple to moderate site structures
- ✅ Standard blocks (hero, cards, columns, carousel)
- ✅ Clear heading hierarchies

**May Need Customization For:**
- ⚠️ Complex nested blocks
- ⚠️ Custom block implementations
- ⚠️ Non-standard HTML structures
- ⚠️ Multi-language sites

## 📚 Documentation

- [AEM Developer Tutorial](https://www.aem.live/developer/tutorial)
- [Project Anatomy](https://www.aem.live/developer/anatomy-of-a-project)
- [Blocks Documentation](https://www.aem.live/developer/markup-sections-blocks)

## 📝 License

Apache License 2.0

## 🙏 Built With

- [AEM Edge Delivery Services](https://www.aem.live/)
- [OpenAI GPT-4 & DALL-E 3](https://openai.com/)
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)

---

**Made with ❤️ for Content Authors**
