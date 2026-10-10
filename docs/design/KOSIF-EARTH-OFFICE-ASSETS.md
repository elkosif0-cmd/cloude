# KOSIF EARTH — Office Asset Manifest (2026-10-10)

## Approved direction
- Preserve the selected office / nature idea. Office lighting should read as **neutral daylight**, with natural warm wood, white/ivory architecture, plants/trees outside; **do not cast a green veil over the whole image**.
- Accent green is for UI controls and illustrations, not for color grading the photo.
- IBM Plex Sans Arabic locally hosted for Arabic UI; Montserrat for brand wordmark.
- Four independent entry stages: section, sector if accounting, company or independent workspace, then goal → steps → result. Existing authentication boundaries remain untouched.

## Actual files, origin, and resolution
| Output | Native output pixels | Source and edits | Use |
| --- | --- | --- | --- |
| `ui/art/brand/earth-office-sunlit-4k.webp` | **3840 × 2160** | Original office photograph [Pexels photo 26834971](https://www.pexels.com/photo/interior-of-an-office-26834971/) at **6688 × 4459**, by Bhandari Law and Partners. Center crop, downsampling with LANCZOS, neutral white balance, restrained brightness/saturation correction. No green overlay, no upscaling. | Desktop hero + gateway workflow banner |
| `ui/art/brand/earth-office-sunlit-mobile.webp` | **1600 × 1200** | Cropped from the same photo-derived 4K edition. | Mobile hero with responsive art direction |
| `ui/art/brand/kosif-earth-mark.svg` | Resolution-independent vector | Hand-authored leaf/growth brand symbol. | Sidebar logo, not a photorealistic asset |
| `ui/art/brand/earth-office-door.css` | N/A | Original CSS authored for the door | Text contrast, neutral backgrounds, responsive presentation |
| `ui/ds/earth-office.css` | N/A | CSS for shared global identity & task guide | All three product gateways |
| `ui/features/earth-goal-journey.js` | N/A | Accessible DOM control with native screen routing | Goal → steps → result |

**Source licensing:** Pexels photograph is offered under the [Pexels License](https://www.pexels.com/license/). Any credit required by downstream usage should follow its current license terms; preserve this attribution in the project manifest.

**Generation truth:** No new image or video was generated through Higgsfield/Seedance/Kling/Marketing Studio in this visual refactor. This branch uses a true larger-than-4K photograph, existing local fonts, CSS, and SVG. Do not label the image as a native 4K AI model generation. Older existing cinematic videos were not regenerated or billed for this work.

**Relation to previously generated visual reference:** The earlier cinematic KOSIF EARTH image showing a giant world globe, skyline and high-end office is an **art-direction reference**, not the source photo used in this particular responsive layout. Exact photorealistic matching of that image, including the globe, requires a separate approved photo-composite or generated asset of adequate native resolution. No such claim is made by this implementation.

## Validation and performance
- The 4K WebP is intended for wide viewports; a smaller 1600px variant replaces it on narrow screens, and native browser image handling clips only the view.
- Screen text and controls remain HTML/CSS, not rasterized into an image.
- Reduced motion media query disables the ornamental transitions.
- Scope is an isolated Git branch and Cloudflare preview, **not a production data migration**.
- The 2026-10-09 KOSIF-to-EARTH task-guidance routes still rely on existing app permissions and per-company data isolation.
