# Deployment Guide to Google Cloud Run

Follow these steps to deploy **AI Lingua** to Google Cloud Run for the #JuaraVibeCoding competition.

## 1. Prerequisites
*   Google Cloud Platform (GCP) account.
*   `gcloud` CLI installed and authenticated.
*   A project created on GCP.
*   Enabled APIs: Cloud Run, Cloud Build, and Artifact Registry.

## 2. Setup Project
Run these commands in your terminal:
```bash
# Login to GCP
gcloud auth login

# Set your project ID
gcloud config set project [YOUR_PROJECT_ID]

# Enable required services
gcloud services enable run.googleapis.com \
                       cloudbuild.googleapis.com \
                       artifactregistry.googleapis.com
```

## 3. Method A: Deploy via Terminal (Fastest)
The fastest way is using `gcloud run deploy`. This will build your image using Cloud Build and deploy it in one go.

```bash
gcloud run deploy ai-lingua \
  --source . \
  --region asia-southeast2 \
  --allow-unauthenticated \
  --set-env-vars="GEMINI_API_KEY=[YOUR_GEMINI_API_KEY]"
```

## 4. Method B: Deploy via GitHub (Continuous Deployment)
You can connect your GitHub repository to Cloud Run so it redeploys automatically every time you push code.

1.  Push your code to a **GitHub Repository**.
2.  Go to the [Cloud Run Console](https://console.cloud.google.com/run).
3.  Click **Create Service**.
4.  Select **Continuously deploy from a repository**.
5.  Click **Set up with Cloud Build**.
6.  Select your repository and branch (e.g., `main`).
7.  For **Build Type**, select **Dockerfile**. (The `Dockerfile` I created will be used automatically).
8.  In the **Service Settings**, set the **Region** to `asia-southeast2`.
9.  Click **Variables & Secrets** and add `GEMINI_API_KEY`.
10. Click **Create**.

*Note: The Dockerfile I created is essential even for this method because it tells Google Cloud exactly how to build your Next.js app efficiently.*

## 5. Environment Variables (Security First! 🔒)
**PENTING:** Jangan pernah memasukkan `GEMINI_API_KEY` ke dalam `Dockerfile` atau mengunggahnya ke GitHub. Ini adalah data sensitif.

Ada dua cara aman untuk mengatur ENV di Cloud Run:

### Cara A: Manual Variable (Mudah)
1.  Buka [Cloud Run Console](https://console.cloud.google.com/run).
2.  Klik nama service Anda (`ai-lingua`).
3.  Klik **Edit & Deploy New Revision**.
4.  Scroll ke bawah ke tab **Variables & Secrets**.
5.  Klik **Add Variable**:
    *   Name: `GEMINI_API_KEY`
    *   Value: `[Masukkan Kunci API Anda di sini]`
6.  Klik **Deploy**.

### Cara B: Secret Manager (Paling Aman - Direkomendasikan)
Jika Anda ingin keamanan tingkat tinggi agar kunci tidak terlihat dalam bentuk teks biasa di dashboard:
1.  Buka **Secret Manager** di GCP Console.
2.  Klik **Create Secret**, beri nama `gemini-api-key` dan masukkan kuncinya.
3.  Kembali ke **Cloud Run** > **Edit & Deploy New Revision** > **Variables & Secrets**.
4.  Klik **Refer a Secret**:
    *   Name: `GEMINI_API_KEY`
    *   Secret: Pilih `gemini-api-key`.
5.  Klik **Deploy**.

---
## 6. Verification
Sekarang aplikasi Anda akan mengambil kunci tersebut secara aman dari sistem Google Cloud saat dijalankan, tanpa perlu menyimpannya di dalam kode!

---
**Good luck with #JuaraVibeCoding!**
