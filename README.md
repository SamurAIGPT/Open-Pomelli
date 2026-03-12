# Open-Pomelli: The Open Source Alternative to Google's Marketing AI

<p align="center">
  <img src="logo.svg" width="200" alt="Open-Pomelli Logo">
</p>

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.8+](https://img.shields.io/badge/python-3.8+-blue.svg)](https://www.python.org/downloads/)
[![Code style: black](https://img.shields.io/badge/code%20style-black-000000.svg)](https://github.com/psf/black)

**Open-Pomelli** is a production-ready, open-source implementation of the core concepts behind **Google's Pomelli**. It serves as an "AI Marketing Department in a Box" for SMBs, startups, and marketing agencies who want the power of automated "Business DNA" extraction without the experimental restrictions of Google Labs.

## 🚀 Why Open-Pomelli?

While Google's Pomelli is an impressive experimental tool, **Open-Pomelli** offers several advantages:
- **Full Transparency**: Open-source codebase you can inspect, modify, and host.
- **API-First Design**: Easy to integrate into your existing marketing workflows.
- **Advanced Scraping**: Uses Playwright to handle JavaScript-heavy modern websites that simple scrapers miss.
- **Smart Asset Handling**: Automatic conversion of modern image formats (AVIF, WebP, SVG) to ensures compatibility with all generation models.
- **No Waiting List**: Production-ready today for any business website.

## 🎯 Core Functionality

Open-Pomelli automates the entire marketing lifecycle in four key steps:

1. **Extract Business DNA**: Deep analysis using Vision AI and headless browsers to understand your brand identity, visual style, and core messaging.
2. **Goal-Driven Strategy**: Aligns campaign suggestions with specific business objectives (Leads, Sales, Awareness, Engagement).
3. **Multi-Channel Generation**: Creates tailored assets for Instagram, LinkedIn, Facebook, Twitter, Web Banners, and Email.
4. **Reference-Based Consistency**: Automatically uses your detected logo as a reference for all visual generations to ensure perfect brand consistency.

## ✨ Key Features

### 🎨 Advanced Brand DNA Analysis (v2.0)
- **Visual Intelligence**: Captures high-res screenshots and uses Vision AI to extract hex codes, typography patterns, and layout styles.
- **Content Synthesis**: Renders full DOMs to understand your value proposition, tone of voice, and target audience.
- **Logo Auto-Discovery**: Finds logos in OpenGraph tags, favicons, or via visual analysis of the landing page.

### 🖼️ Brand-Consistent Asset Creation
- **Automatic Logo Injection**: Intelligently places your brand logo on generated social posts and banners.
- **Nano Banana Edit Integration**: High-quality image generation using reference images for style and brand matching.
- **Smart Format Engine**: Seamlessly handles and converts AVIF, WebP, and SVG formats to PNG for maximum compatibility.

### 📊 Professional Campaign Engine
- **Tailored Strategies**: Generates full campaign briefs for Product Launches, Thought Leadership, Lead Gen, and more.
- **Platform Optimization**: Automatically adjusts copy length, hashtag counts, and tone for different social platforms.
- **A/B Variation Support**: Generate multiple design and copy variants for performance testing.

## 📈 Feature Comparison

| Feature | Google Pomelli | Open-Pomelli |
|---------|---------------|------------|
| Business DNA Extraction | ✅ | ✅ (Enhanced with Vision) |
| Logo Auto-Detection | ✅ | ✅ |
| Reference-Based Gen | ✅ | ✅ |
| Social Media Posts | ✅ | ✅ |
| Web Banners | ✅ | ✅ |
| Video Ads | ✅ | ✅ (SeeDance Lite) |
| JS-Heavy Site Scraping | ⚠️ | ✅ (Playwright) |
| Format Conversion | ❌ | ✅ (AVIF/WebP → PNG) |
| API Access | ❌ | ✅ |
| Open Source | ❌ | ✅ |

## 🛠️ Tech Stack
- **Orchestration**: Python 3.8+
- **Browser Automation**: Playwright
- **Vision & Analysis**: GPT-4o / GPT-5-Nano (via MuAPI)
- **Generative Media**: Nano Banana (Images), SeeDance Lite (Video)
- **Image Processing**: Pillow

## 🚀 Quick Start

### Installation

1. **Clone and Navigate**:
```bash
git clone https://github.com/your-repo/open-pomelli.git
cd open-pomelli
```

2. **Install Dependencies**:
```bash
pip install -r requirements.txt
playwright install
```

3. **Configure API Keys**:
Rename `api_secrets.example.py` to `api_secrets.py` and add your keys:
- `MUAPIAPP_API_KEY`: For LLM and Vision tasks.
- `FAL_KEY`: For file hosting and media generation.

### Run the Agent
```bash
python cli_marketing.py
```

## 📖 Usage Example

**Step 1**: Provide your website URL.  
**Step 2**: Open-Pomelli extracts your Brand DNA (colors, logo, tone).  
**Step 3**: Select a campaign type (e.g., "Lead Generation").  
**Step 4**: Receive a full suite of on-brand social posts, banners, and copy variants.

## 🤝 Contributing

We welcome contributions! Whether it's adding new adapters, improving DNA extraction, or refining campaign templates. See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

---

**Built with ❤️ for SMB Success • The Open Alternative to Google Pomelli**
