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

## 3. Deploy to Cloud Run (The Easy Way)
The fastest way is using `gcloud run deploy`. This will build your image using Cloud Build and deploy it in one go.

```bash
gcloud run deploy ai-lingua \
  --source . \
  --region asia-southeast2 \
  --allow-unauthenticated \
  --set-env-vars="GEMINI_API_KEY=[YOUR_GEMINI_API_KEY]"
```

*Note: Replace `[YOUR_PROJECT_ID]` and `[YOUR_GEMINI_API_KEY]` with your actual values.*

## 4. Environment Variables
Cloud Run requires the `GEMINI_API_KEY` to function. You can set this during deployment (as shown above) or via the GCP Console:
1. Go to **Cloud Run** in GCP Console.
2. Select your service (`ai-lingua`).
3. Click **Edit & Deploy New Revision**.
4. Go to **Variables & Secrets** tab.
5. Add `GEMINI_API_KEY`.

## 5. Verification
Once deployed, you will receive a **Service URL** (e.g., `https://ai-lingua-xyz.a.run.app`). 
*   Open the URL to verify your app is live.
*   Test a question generation to ensure the AI integration is working.

---
**Good luck with #JuaraVibeCoding!**
