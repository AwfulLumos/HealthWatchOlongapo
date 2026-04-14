# Patients & Barangays (Backend)

This document describes the backend API behavior for patient creation/update and how barangays are validated/resolved.

## Base URL

- `http://localhost:3000/api/v1`

All routes below require a Bearer token:

- `Authorization: Bearer <accessToken>`

## Patients

### Create patient

- `POST /patients`

Validation is handled by Zod in [server/src/validators/patient.validator.ts](../validators/patient.validator.ts).

Required fields:
- `firstName` (string)
- `lastName` (string)
- `dob` (ISO datetime or `YYYY-MM-DD`)
- `gender` (`Male` | `Female`)
- `contact` (string)
- `address` (string)
- `emergencyContact` (string)
- `emergencyContactNumber` (string)

Optional fields:
- `bloodType` (enum)
- `civilStatus` (enum)
- `philhealth` (string)
- `status` (`Active` | `Inactive`)
- `barangayId` (string)
- `barangay` (string name)

### Update patient

- `PATCH /patients/:id`

Same fields as create, but optional.

### Validation failures (422)

If the request body fails Zod validation, the server returns:

- HTTP `422`
- `message: "Validation failed"`
- `errors: Record<string, string[]>`

Error formatting is produced by [server/src/middlewares/error.middleware.ts](../middlewares/error.middleware.ts).

## Barangay resolution

Patients store `barangayId` (optional foreign key). For convenience, the API also accepts a `barangay` name.

Resolution behavior (in [server/src/services/patient.service.ts](../services/patient.service.ts)):

1. If `barangayId` is provided, it is used directly.
2. Else if `barangay` is provided:
   - The service attempts an exact name match.
   - If not found, it performs a normalized match (trim + collapse whitespace + lowercased + punctuation removed).
3. If no match is found:
   - HTTP `422` with `errors.barangay = ["Barangay not found"]`
4. If multiple matches are found (rare):
   - HTTP `422` with `errors.barangay = ["Barangay name is ambiguous. Please select a barangay from the list."]`

## Barangays

### List barangays

- `GET /barangays`

Returns a list of barangays ordered by name, with:
- `id`
- `name`
- `zipCode`

Used by the frontend patient registration modal to prevent invalid barangay names.
