# Azure App Service startup command
# Paste this in Azure Portal → App Service → Configuration → General Settings → Startup Command:
#
#   node dist/server.js
#
# OR set it via Azure CLI:
#   az webapp config set \
#     --name <your-app-name> \
#     --resource-group <your-resource-group> \
#     --startup-file "node dist/server.js"
#
# ─────────────────────────────────────────────────
# Required App Settings (Environment Variables)
# Set these in Azure Portal → Configuration → Application Settings
# OR via GitHub Actions secrets used in the workflow.
# ─────────────────────────────────────────────────
#
# MONGODB_URI              = mongodb+srv://...
# REDIS_URL                = redis://...
# GROQ_API_KEY             = gsk_...
# UPLOADTHING_TOKEN        = ...
# CLERK_PUBLISHABLE_KEY    = pk_live_...
# CLERK_SECRET_KEY         = sk_live_...
# PORT                     = 8080        # Azure uses 8080 by default
# NODE_ENV                 = production
# WEBSITE_NODE_DEFAULT_VERSION = ~20
