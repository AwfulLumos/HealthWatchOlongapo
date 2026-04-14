# Patient Registration (Frontend)

This document explains how the Patients module registers a new patient from the React UI, what fields are required, and how API errors are surfaced.

## Entry Point

- Page: [src/app/pages/PatientsPage.tsx](../pages/PatientsPage.tsx)
- Services:
  - [src/app/services/patientService.ts](../services/patientService.ts)
  - [src/app/services/barangayService.ts](../services/barangayService.ts)

## Flow

1. User clicks **Register Patient**.
2. `PatientModal` opens in `add` mode.
3. The modal fetches a list of valid barangays from `GET /api/v1/barangays`.
4. User fills the form and clicks **Register Patient**.
5. A blocking overlay (`Saving patient…`) appears while the request is in progress.
6. On success, the modal closes and the new patient is inserted into the local list.
7. On failure, the modal shows a human-readable error message (including backend 422 validation details when available).

## Required Fields

The UI blocks submission if any of these are missing:

- First Name
- Last Name
- Date of Birth
- Gender
- Contact Number
- Address
- Emergency Contact No.

Notes:
- `Emergency Contact` (name) is not shown in the UI, but the modal sends `"N/A"` because the backend/DB requires it.
- `Blood Type` and `Civil Status` are optional.

## Barangay

- The modal renders **Barangay** as a dropdown populated from the backend.
- This prevents sending invalid barangay names (which would otherwise fail with HTTP 422).

If the barangay list cannot be loaded (e.g., backend offline), the field falls back to a free-text input.

## Error Handling

- Backend validation failures typically return HTTP `422` with a JSON body like:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "body.gender": ["Invalid enum value"],
    "barangay": ["Barangay not found"]
  }
}
```

- The modal formats these into a single message (e.g., `Validation failed (barangay: Barangay not found)`).

## Dev Notes

- If you add new required backend fields, update the modal’s client-side validation to match.
- If the backend changes the patients payload shape, update `normalizePatientApi()` in [src/app/pages/PatientsPage.tsx](../pages/PatientsPage.tsx).
