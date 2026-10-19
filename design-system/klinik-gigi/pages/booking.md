# Booking Page Overrides

> **PROJECT:** Klinik Gigi
> **Generated:** 2026-10-19
> **Page Type:** Appointment Booking Flow (`/booking`, `/en/booking`, `/booking/kelola`, `/booking/sukses/:code`)

> ⚠️ **IMPORTANT:** Rules in this file **override** the Master file (`design-system/klinik-gigi/MASTER.md`).
> Only deviations from the Master are documented here. For all other rules, refer to the Master.

---

## Page-Specific Rules

### Layout & Form Overrides

- **Container:** Two-column or stepped layout inside `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8` with contact/clinic info card alongside the `.trust-card` form container (`rounded-[16px] p-6 sm:p-8 bg-white border border-[#E2E8F0]`).
- **Field Set Preservation:** Keep the exact existing field set and booking logic (Step 1: Service/Doctor selection, Step 2: DateStrip + SlotPicker, Step 3: Patient Name, WhatsApp Phone, Complaint/Notes, DP/Consent if applicable — **NO email field, NO medical history fields**).
- **Form Controls:**
  - `.form-label`: `font-semibold text-[0.9375rem] text-[#1A202C] mb-2`
  - `.form-input`: `border-2 border-[#E2E8F0] rounded-[12px] min-h-[48px] px-[18px] py-3 bg-white focus:border-[#0066CC] focus:ring-4 focus:ring-[#0066CC]/15`
- **Indonesian Context:** Payment/insurance info uses Indonesian placeholders (QRIS, Transfer Bank, Debit/Kredit) and WhatsApp contact format (`08xx` / `+62`).
