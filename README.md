## 🛠️ Temporary Fake Login Mechanism

This branch implements a temporary **"fake login" mechanism** to work around **Azure SQL database connectivity issues** during development. The implementation adds an **offline mode** that bypasses database authentication and allows the application to function with mock user data.

---

### Key changes:

* Added **offline mode middleware** that restricts API access to **whitelisted endpoints** when `OFFLINE_MODE=true`
* Implemented **fake authentication** in both backend (`AuthController`) and frontend (`AuthContext`) with **token prefix detection**
* Changed **API communication** from **HTTPS to HTTP** and updated the base URL port
