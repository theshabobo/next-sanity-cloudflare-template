# ⚙️ Project Scaffold Setup Tool

This tool helps you generate fully functional web projects using:

- ✅ Next.js with CSS Modules (Cloudflare Workers-compatible)
- ✅ Sanity.io CMS
- ✅ GitHub repository creation
- ✅ Automatic config generation (`.env`, `wrangler.jsonc`)
- ✅ Optional Cloudflare deployment
- ✅ One-command setup using `setup.mjs`

---

## 🔧 1. Global One-Time Setup (Required Once Per System)

### 🐙 A. Create a GitHub Account (If You Don't Have One)

1. Go to https://github.com
2. Click **“Sign up”**
3. Fill in the following:
   - Email address
   - Password
   - Username (your GitHub handle)
   - Complete email/code verification
4. Choose the **Free Plan**
5. Verify your email via the link sent by GitHub
6. (Optional but recommended) Enable Two-Factor Authentication in your profile settings under **"Password and Authentication"**

---

### 📁 B. Set up `dev-tools` folder with required packages

```bash
cd "[path to your project]\your-project.com\dev-tools"
npm init -y
npm install inquirer fs-extra execa
```

---

### 🧠 C. Create a Sanity.io Account and Project

> This provides the backend CMS that your frontend will connect to.

1. Go to https://www.sanity.io  
2. Click **“Sign in”** (top right)  
3. Choose to log in with **GitHub**, **Google**, or **email**  
4. Complete the login verification  
5. Once inside the dashboard:
   - Click **“New project”**
   - **Project Name**: Use the same name you’ll use in the setup script (e.g. `your-project.com`)
   - Choose **“Start from scratch”**
   - **Dataset**: Leave as `production`
   - Click **Create project**
6. Once created:
   - Copy the **Project ID** (you’ll need this for the script)
   - You can find it under **Settings → API → Project ID**
7. No need to deploy Studio yet – the setup script will scaffold the folders for you.

---

### 🐙 D. Install GitHub CLI

1. Download the GitHub CLI here:  
   👉 https://cli.github.com

2. Run the installer.

3. **Restart VS Code** so the CLI is available in your terminal path.

4. Run this to authenticate:

```bash
gh auth login
```

5. Copy the one-time code shown in the terminal.

6. Paste it into the browser window and authorize access.

---

## 🚀 2. Create a New Project

Use the `setup.mjs` script to scaffold a new project.

### ▶️ Run:

```bash
node setup.mjs
```

### 💬 Respond to prompts:

| Prompt                     | Example Value                 |
|----------------------------|-------------------------------|
| `Project name`             | `my-project.com`              |
| `GitHub username`          | `Your GitHub Username`        |
| `Create GitHub repo?`      | Yes                           |
| `Sanity Project ID`        | e.g., `abc123def456`          |
| `Sanity Dataset`           | `production`                  |
| `Cloudflare API Token`     | Leave blank unless needed     |

---

## 📂 3. What Gets Generated

A new folder named after your project (e.g. `templatetest.com`) is created with:

```
templatetest.com/
├── site/                    # Next.js + CSS modules
│   ├── .env.local           # With Sanity vars
│   └── wrangler.jsonc       # Ready for Cloudflare
├── sanity/                  # Sanity Studio setup
├── README_MANUAL_STEPS.md   # Next steps checklist
└── .git/                    # Initialized repo
```

---

## 📘 4. What to Do Next

1. Open your new folder in VS Code.

2. Install dependencies and run:

```bash
# Terminal tab 1
cd site
npm install
npm run dev

# Terminal tab 2
cd ../sanity
npm install
npm run dev
```

3. Follow the instructions in `README_MANUAL_STEPS.md` for:
   - Setting Cloudflare secrets
   - Deploying
   - Configuring Sanity Studio

4. Push manually if needed:

```bash
git push -u origin main
```

---

## 🛠 Optional: Fix Git "dubious ownership" Warnings

If Git throws an error like:
> `fatal: detected dubious ownership...`

Run this **once globally** to trust the project folder on your network share:

```bash
git config --global --add safe.directory "%(prefix)///twh-server/Pool/Share/Coding Projects/Projects/In-Progress/next-sanity-cloudflare-template"
```

---

## ✅ You’re Now Set Up

From now on, just run:

```bash
node setup.mjs
```

Each time you want to start a new full-stack site with Sanity + Next.js + GitHub + Cloudflare.

---
