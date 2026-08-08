# Chat with Al — Setup Guide for Absolute Beginners

Follow these steps in order. Every step happens in a web browser — you will
not need to install anything or type any code. This should take about
30-45 minutes total (plus AdSense approval time later, which happens in the
background).

---

## Step 0: Save the files to your computer

Above, in the chat, I gave you a set of files: `index.html`, `style.css`,
`script.js`, `chat.js` (inside a folder called `api`), `package.json`,
`.env.example`, `README.md`, and `CHARACTER.md`.

1. On your computer, create a new folder and name it `chat-with-al`.
2. Inside `chat-with-al`, create another folder named exactly `api` (lowercase).
3. Download each file from the chat above by clicking on it, and save it into
   the right spot:
   - `index.html` → into `chat-with-al`
   - `style.css` → into `chat-with-al`
   - `script.js` → into `chat-with-al`
   - `package.json` → into `chat-with-al`
   - `.env.example` → into `chat-with-al`
   - `README.md` → into `chat-with-al`
   - `CHARACTER.md` → into `chat-with-al`
   - `chat.js` → into `chat-with-al/api` (the subfolder)

When you're done, `chat-with-al` should look like this:

```
chat-with-al/
├── index.html
├── style.css
├── script.js
├── package.json
├── .env.example
├── README.md
├── CHARACTER.md
└── api/
    └── chat.js
```

This exact folder structure matters — the hosting service (Step 3) expects
`chat.js` to be inside a folder called `api`.

---

## Step 1: Create a GitHub account (this is just file storage for your website)

GitHub is where your website's files will live so the hosting service can
find them. It's free.

1. Go to **github.com**.
2. Click **Sign up**, enter an email, password, and username, and follow the
   prompts (it may ask you to verify your email — check your inbox).
3. Once logged in, click the **+** icon in the top right corner → **New
   repository**.
4. Name it `chat-with-al`. Leave everything else as default. Click **Create
   repository**.
5. On the next page, look for a link that says **uploading an existing
   file**. Click it.
6. Drag your entire `chat-with-al` folder's *contents* (not the folder
   itself — the files and the `api` folder inside it) into the upload box.
   Wait for the upload to finish.
7. Scroll down and click the green **Commit changes** button.

Your files are now on GitHub. You won't need to touch this again unless you
want to make changes later.

---

## Step 2: Get your Anthropic API key (this is what makes Al "think")

Think of this as a password that lets your website ask Claude (the AI model)
to generate Al's responses, billed to your account.

1. Go to **console.anthropic.com**.
2. Sign up or log in.
3. You'll likely be asked to add billing information and a small amount of
   prepaid credit — **$5 is plenty to start**. Add a card and put in $5.
4. Once that's done, look in the left sidebar for **API Keys** (it might be
   under a **Settings** menu).
5. Click **Create Key**. Give it any name, like "chat-with-al".
6. A long string starting with `sk-ant-` will appear. **Copy it immediately**
   and paste it into a plain text file or notes app — you will not be able
   to see the full key again once you navigate away.
7. While you're in the console, look for **Usage limits** or **spend
   limits** and set a monthly cap (e.g. $20) so you can never be surprised
   by a big bill, no matter how much traffic the site gets.

Keep this key private — treat it like a password. Never post it publicly or
paste it into the website's actual code.

---

## Step 3: Create a Vercel account and deploy the site

Vercel is the free hosting service that will actually put your site on the
internet and run the "Al brain" function.

1. Go to **vercel.com**.
2. Click **Sign Up**, and choose **Continue with GitHub** (this links it to
   the account from Step 1 — easiest option).
3. Approve the connection when GitHub asks.
4. Once inside Vercel, click **Add New...** → **Project**.
5. You'll see a list of your GitHub repositories — find `chat-with-al` and
   click **Import** next to it.
6. Before clicking deploy, look for a section called **Environment
   Variables**. This is where your secret API key goes so it's never visible
   on the public website. Add:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** paste the `sk-ant-...` key from Step 2
   - Click **Add**.
7. Click **Deploy**.
8. Wait about 30-60 seconds. When it finishes, Vercel shows you a live URL
   that looks like `chat-with-al-yourname.vercel.app`. Click it.

**Your site is now live on the internet.** Type a question to Al and confirm
you get a real, in-character response (not one of the generic fallback lines
like "Tater knocked the router off the porch" — those only appear if
something's misconfigured).

If it's not working: go back to Vercel → your project → **Settings →
Environment Variables** and double check the key was pasted in fully with no
extra spaces, then go to **Deployments** and click **Redeploy**.

---

## Step 4: Set up the tip jar

1. Go to **ko-fi.com** and click **Sign up**. It's free.
2. Pick a page name/handle (e.g. `ko-fi.com/chatwithal`) — this is what
   people click to send you money.
3. Connect a payout method (PayPal or bank, depending on what Ko-fi offers
   in your country) under **Settings → Payments**.
4. Copy your Ko-fi page URL.
5. Go back to your `chat-with-al` folder on your computer, open
   `index.html` in a plain text editor (Notepad on Windows, TextEdit on Mac
   — set TextEdit to "plain text" mode first via Format menu).
6. Use Find (Ctrl+F / Cmd+F) to locate **`YOUR_KOFI_HANDLE`** — it appears
   twice. Replace both with your real Ko-fi URL.
7. Save the file.
8. Go back to your GitHub repo (Step 1), open `index.html` there, click the
   pencil/edit icon, and paste in the updated content (or delete the old
   file and re-upload the new one). Commit the change.
9. Vercel will automatically redeploy your site within a minute or two with
   the update live.

---

## Step 5: Apply for Google AdSense (do this early — approval takes time)

1. Go to **adsense.google.com**.
2. Click **Get Started**, sign in with a Google account, and enter your live
   site URL (the vercel.app one, or your custom domain if you bought one).
3. Follow the verification steps (it may ask you to add a small code snippet
   to your site — if so, come back and I can walk you through adding it to
   `index.html`).
4. Submit for review. This can take anywhere from a day to a couple of
   weeks — there's no way to speed it up, so do this step as early as
   possible, even before you publicly launch.
5. Once approved, come back and tell me — I'll help you drop the real ad
   code into the two ad placeholder spots already sitting in the site.

---

## Step 6 (optional): Buy a real domain name

A URL like `chatwithal.com` is easier to say and share than
`chat-with-al-yourname.vercel.app`.

1. Go to a registrar like **Namecheap** or **Google Domains** (via Squarespace)
   or just buy it directly through Vercel under **Settings → Domains** in
   your project — Vercel will offer to sell/connect one directly, which is
   the simplest path since it auto-connects.
2. Expect to pay roughly $10-20/year.
3. If bought elsewhere, go to your Vercel project → **Settings → Domains**,
   add the domain, and follow the instructions to update your DNS settings
   at the registrar (Vercel shows you exactly what to paste in).

---

## Step 7: Launch

- Ask Al 15-20 questions yourself first and screenshot the funniest answers.
- Post those screenshots + your site link to Reddit, Twitter/X, TikTok,
  wherever your audience hangs out.
- Keep an eye on console.anthropic.com's usage page the first day.

---

## If something breaks

Come back to this chat and tell me exactly what you see (a screenshot
helps a lot) and I'll walk you through fixing it — nothing above is
one-way or hard to undo.
