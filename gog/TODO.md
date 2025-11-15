# Project TODO

## Completed Recently
- [x] Skip database migrations and role seeding when `OFFLINE_MODE` is enabled.
- [x] Return HTTP 503 for non-whitelisted routes while offline, keeping login and health checks accessible.
- [x] Centralize the offline mock user definition inside `frontend/src/contexts/AuthContext.tsx`.

## Pending
- [ ] Add automated coverage for the offline-mode middleware and seeding guard.
- [ ] Perform an end-to-end verification of the offline login flow against the updated backend.
