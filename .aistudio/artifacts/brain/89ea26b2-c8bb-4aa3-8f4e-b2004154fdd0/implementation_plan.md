# Migration Plan: Thiruvannamalai District (Thandarampet, Thanipadi & Surroundings)

This plan details the full transition of the AUTOGO fleet management and booking platform from Chennai/OMR to **Thiruvannamalai District**, focusing on the **Thandarampet, Thanipadi, and surrounding regional network**.

---

## 1. Regional Hubs & Service Areas Configuration

We will replace the Chennai/OMR locations with authentic Thiruvannamalai regional hubs across Thandarampet taluk and surrounding towns:

### Primary Service Areas & Coordinates
1. **Thanipadi Bus Stand** (Central Auto Stand & Primary Fleet Depot) - `12.0620° N, 78.8950° E`
2. **Thandarampet Market & Taluk Office** (Administrative & Commercial Hub) - `12.1150° N, 78.9610° E`
3. **Thiruvannamalai Town / Bus Terminus / Temple** (Major District Hub) - `12.2253° N, 79.0747° E`
4. **Chengam Town Bus Stand** (Western Highway Hub) - `12.3080° N, 78.8020° E`
5. **Sathanur Dam Scenic Spot & Park** (Key Tourism & Rural Corridor) - `12.1830° N, 78.8470° E`
6. **Radhapuram Junction** - `12.0830° N, 78.9280° E`
7. **Vanapuram Market Road** - `12.0230° N, 78.9750° E`
8. **Veraiyur Cross Road** - `12.1550° N, 79.0120° E`
9. **Kallakurichi Road Junction (Thanipadi)** - `12.0510° N, 78.8890° E`

---

## 2. Fleet & Vehicle Updates (TN 25 Thiruvannamalai RTO)

All four auto-rickshaws will be registered under the official **TN 25 (Thiruvannamalai)** district RTO:
- **Auto 1**: `TN 25 AB 1001` (Driver: Kumar · Assigned to Thanipadi Central Stand)
- **Auto 2**: `TN 25 BC 2042` (Driver: Ravi · Assigned to Thandarampet Taluk Hub)
- **Auto 3**: `TN 25 CD 3388` (Driver: Mani · Sathanur Dam & Chengam Route)
- **Auto 4**: `TN 25 DE 4919` (Driver: Suresh · Thiruvannamalai Town Connection)

---

## 3. Realistic Distance & Fare Calculation

Update the distance matrix and fare calculator in `src/data/initialData.ts` to reflect real road distances in Thiruvannamalai district:
- **Thanipadi to Thandarampet**: ~11.5 km (~₹220)
- **Thanipadi to Sathanur Dam**: ~16.2 km (~₹295)
- **Thandarampet to Thiruvannamalai Town**: ~18.5 km (~₹335)
- **Thanipadi to Thiruvannamalai Town**: ~28.0 km (~₹490)
- **Thandarampet to Chengam**: ~24.0 km (~₹425)
- **Thanipadi to Radhapuram**: ~5.2 km (~₹115)
- **Thanipadi to Vanapuram**: ~12.8 km (~₹240)
- **Thandarampet to Veraiyur**: ~7.4 km (~₹150)

---

## 4. UI & Map Visualizer Overhaul

1. **`InteractiveMap.tsx`**:
   - Re-render the SVG road network schematic representing the **SH-9A / Thiruvannamalai-Thandarampet-Thanipadi-Chengam-Sathanur** triangle.
   - Plot pins, active auto positions, and animated route lines between Thanipadi, Thandarampet, Sathanur Dam, Chengam, and Thiruvannamalai.
2. **`PublicWebsite.tsx`**:
   - Update Hero copy, service area badges, testimonials, and booking dropdowns to showcase Thandarampet, Thanipadi, Sathanur Dam, and Thiruvannamalai district express connectivity.
3. **`CustomerPortal.tsx`**:
   - Quick-booking presets: "Thanipadi to Thandarampet Market", "Thanipadi to Thiruvannamalai", "Thandarampet to Sathanur Dam".
4. **`DriverPortal.tsx` & `OwnerDashboard.tsx`**:
   - Regional fleet statistics, manual dispatch locations, and depot addresses ("Thanipadi Central Auto Stand, Thiruvannamalai Dt").
5. **CSV Import template**:
   - Update demo CSV template with Thanipadi / Thandarampet routes.

---

## 5. Verification & Testing

- Validate build with `compile_applet` and `lint_applet`.
- Verify fare calculation and distance accuracy between all Thiruvannamalai regional hubs.
- Verify OTP login, driver login, booking workflow, and owner manual dispatch with the new locations.
