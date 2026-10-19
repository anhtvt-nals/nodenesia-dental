# Harga Page Overrides

> **PROJECT:** Klinik Gigi
> **Generated:** 2026-10-19
> **Page Type:** Transparent Pricing & 3D Tooth Explorer (`/harga`, `/en/harga`, `/en/prices`)

> ⚠️ **IMPORTANT:** Rules in this file **override** the Master file (`design-system/klinik-gigi/MASTER.md`).
> Only deviations from the Master are documented here. For all other rules, refer to the Master.

---

## Page-Specific Rules

### Layout & Component Overrides

- **Header:** Eyebrow `.badge.badge-primary` + H1 with `.gradient-text` + subtitle.
- **Category Filter Pills:** Rounded-full tabs (`min-h-[44px] px-5 py-2.5 font-semibold text-sm transition-all cursor-pointer`), active state `bg-[#0066CC] text-white shadow-sm`, inactive state `bg-white text-[#4A5568] border border-[#E2E8F0] hover:border-[#0066CC] hover:text-[#0066CC]`.
- **Price Table / Cards:** `.trust-card` containers with clean dividers (`border-[#E2E8F0]`), clear IDR range formatting (`font-heading font-bold text-[#0066CC]`), duration badges, and direct Booking CTA.
- **Payment Methods Block:** Replace US insurance logos with Indonesian payment method badges (QRIS, Debit/Kredit, Transfer Bank, Tunai) inside a `.trust-card`.
