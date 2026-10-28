# FinTrack — Deployment Guide (Free Tier)

This guide walks you through deploying FinTrack (Backend, Frontend, and Cloud Database) completely free.

---

## 1. Cloud Database (MongoDB Atlas)

Since local databases cannot be accessed by cloud servers, set up a free MongoDB Atlas cluster:

1. Sign up at **[mongodb.com/atlas](https://www.mongodb.com/atlas)**.
2. Create a **Free Shared M0 Cluster**.
3. Under **Database Access**, create a database user (e.g., `fintrack_user`) with a secure password.
4. Under **Network Access**, click **Add IP Address** and choose **Allow Access From Anywhere (`0.0.0.0/0`)**.
5. Click **Connect** &rarr; **Drivers (Node.js)** and copy your connection string:
   ```text
   mongodb+srv://fintrack_user:<password>@cluster0.xxxxx.mongodb.net/fintrack?retryWrites=true&w=majority
   ```

---

## 2. Deploy Backend (Render.com)

1. Sign up / Log in to **[render.com](https://render.com)** using your GitHub account (`Jagan96404`).
2. Click **New +** &rarr; **Web Service**.
3. Connect your repository: `https://github.com/Jagan96404/FinTrack`.
4. Configure the service settings:
   - **Name**: `fintrack-api`
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
5. Under **Environment Variables**, add:
   - `NODE_ENV` = `production`
   - `PORT` = `5000`
   - `MONGODB_URI` = *(Your MongoDB Atlas connection string from Step 1)*
   - `JWT_SECRET` = `fintrack_super_secure_jwt_secret_key_2026_xyz`
   - `JWT_EXPIRE` = `7d`
   - `CLIENT_URL` = `https://<your-frontend-domain>.vercel.app` *(update once frontend is deployed)*
6. Click **Deploy Web Service**.
7. Once deployed, copy your backend URL (e.g., `https://fintrack-api.onrender.com`).

---

## 3. Deploy Frontend (Vercel)

1. Sign up / Log in to **[vercel.com](https://vercel.com)** using your GitHub account.
2. Click **Add New...** &rarr; **Project**.
3. Import `Jagan96404/FinTrack`.
4. Configure project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click edit and select `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Under **Environment Variables**, add:
   - `VITE_API_URL` = `https://fintrack-api.onrender.com/api` *(Your Render backend URL from Step 2)*
6. Click **Deploy**.
7. Your application will be live with an SSL HTTPS certificate!

---

## 4. Alternative: Deploy Frontend on Render

If you prefer keeping everything inside Render:
1. Click **New +** &rarr; **Static Site**.
2. Connect `Jagan96404/FinTrack`.
3. Set **Root Directory** to `client`.
4. Set **Build Command** to `npm run build`.
5. Set **Publish Directory** to `dist`.
6. Add Environment Variable: `VITE_API_URL` = `https://fintrack-api.onrender.com/api`.
7. Click **Create Static Site**.
