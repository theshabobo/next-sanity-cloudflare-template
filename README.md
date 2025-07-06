# ⚡ Next.js + Sanity + Cloudflare Boilerplate

A streamlined full-stack setup to quickly scaffold and deploy a **Next.js site running on Cloudflare Workers**, powered by **Sanity.io** as the backend CMS, and managed via **GitHub** for version control.

This project automates an otherwise fragmented process and gets your stack up and running in under 5 minutes with smart defaults and full control.

---

## 🚀 What This Project Does

- Creates a **Next.js** site configured for **Cloudflare Workers**
- Initializes a **Sanity.io** Studio as a headless CMS backend
- Connects both projects into a new GitHub repository
- Automates the setup of CLI tools, file structure, and configuration
- Prepares for **Cloudflare Pages** deployment with environment integration

There are no currently well-documented or well-supported ways to spin up this exact stack in a reproducible way — this project solves that.

---

## 👥 Who It's For

- Web developers building JAMstack apps
- Teams who want a reproducible modern stack
- Anyone wanting to deploy scalable CMS-backed sites via Cloudflare

Designed for both **public** and **internal** use.

---

## 🧰 Tech Stack

| Tool         | Purpose                        |
|--------------|--------------------------------|
| [Next.js](https://nextjs.org/)     | Front-end framework for the site     |
| [Sanity.io](https://www.sanity.io/) | Headless CMS backend (Studio)        |
| [Cloudflare Workers](https://developers.cloudflare.com/workers/) | Serverless deployment layer           |
| [GitHub](https://github.com)       | Version control and repo host        |
| [Wrangler](https://developers.cloudflare.com/workers/wrangler/)   | Cloudflare CLI tool for deployment   |
| [gh CLI](https://cli.github.com/)  | GitHub CLI (required pre-installed)  |

---

## 🗂 Folder Structure

```
your-domain.com/
│
├── site/                # Next.js app (ready for Cloudflare deployment)
│   └── ...              # Pages, components, public assets, etc.
│
├── sanity/              # Sanity Studio project (CMS backend)
│   └── schemaTypes/     # Modular schemas for content types
│
├── scripts/             # Project setup automation scripts
│   ├── setup.mjs            # Main entry point
│   ├── next-setup.mjs       # Handles Next.js folder setup
│   └── sanity-setup.mjs     # Handles Sanity configuration and injection
│
└── README.md            # This file
```

---

## ⚙️ Getting Started

### 🔧 Requirements

Before running the script, make sure the following are installed globally:

- **Node.js** (Latest LTS recommended)
- **npm** (comes with Node)
- **Git**
- **GitHub CLI** (`gh`) — must be installed and authenticated

> **Note:** `wrangler`, `sanity`, and other CLI dependencies will be automatically installed by the script.

---

### 🛠 Setup Instructions

Run this in your terminal:

```bash
node setup.mjs
```

You’ll be prompted for:

- Domain name (e.g. `clanhavok.com`)
- GitHub username
- Whether to create a GitHub repo
- Sanity project ID
- Sanity dataset (defaults to `production`)
- Sanity API token

After setup is complete, the script will:

- Scaffold the file structure
- Configure and install Sanity/Next.js
- Generate `.env.local` for API token
- Optionally create a GitHub repo and push your code

---

## 🌐 Deployment (Cloudflare Pages)

After setup, you’ll need to manually configure Cloudflare Pages using the following:

1. **Set Environment Variable**:
   - `SANITY_API_TOKEN=<your-token>` (as secret)

2. **GitHub Integration**:
   - Repo: `your-username/projectNameRoot`
   - Branch: `main`

3. **Build Settings**:
   - **Build command**:  
     ```
     npx opennextjs-cloudflare build
     ```
   - **Deploy command** (Production & Preview):  
     ```
     npx wrangler deploy .open-next/worker.js --experimental-json-config
     ```
   - **Root directory**:  
     ```
     /projectName
     ```

---

## ✨ Customization

- All Sanity schemas are modular and easy to extend via `schemaTypes/`.
- Next.js site is a standard app structure — customize layout, routing, styles freely.
- Add features like Tailwind, Resend, Turnstile manually as needed.

---

## 📄 License

MIT — free for commercial and personal use.

---

## 🧠 Credits

Created by [TC](https://github.com/theshabobo)  
Contributions welcome. PRs and issues encouraged!
