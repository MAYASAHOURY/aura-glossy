# AURA Image Pack — Folder Structure

Drop your curated images into these folders. The platform reads from these paths automatically.

## Per-aesthetic folders (10 of them)
Each folder: `classic/`, `casual/`, `streetwear/`, `minimalist/`, `elegant/`, `korean/`, `y2k/`, `vintage/`, `softgirl/`, `darkacademia/`

Inside each one, save these exact filenames:

```
hero.jpg              # cinematic vertical portrait — 3:4 (used everywhere)
accent.jpg            # smaller detail/close-up — 3:4
outfit-1.jpg          # 8 labeled outfit photos — 3:4
outfit-2.jpg
outfit-3.jpg
outfit-4.jpg
outfit-5.jpg
outfit-6.jpg
outfit-7.jpg
outfit-8.jpg
complete-look.jpg     # full curated outfit — 3:4
detail-fabric.jpg     # 6 square close-ups — 1:1
detail-accessory.jpg
detail-shoes.jpg
detail-jewelry.jpg
detail-makeup.jpg
detail-bag.jpg
beauty.jpg            # makeup/hair portrait — 3:4
lookbook.jpg          # cinematic wide — 16:9
product-clothing-aff.jpg    # 18 product photos — 1:1
product-clothing-mid.jpg
product-clothing-lux.jpg
product-shoes-aff.jpg
product-shoes-mid.jpg
product-shoes-lux.jpg
product-bags-aff.jpg
product-bags-mid.jpg
product-bags-lux.jpg
product-accessories-aff.jpg
product-accessories-mid.jpg
product-accessories-lux.jpg
product-beauty-aff.jpg
product-beauty-mid.jpg
product-beauty-lux.jpg
product-jewelry-aff.jpg
product-jewelry-mid.jpg
product-jewelry-lux.jpg
```

## Homepage folder: `home/`
```
hero-1.jpg            # 3 hero collage — 3:4
hero-2.jpg
hero-3.jpg
polaroid-1.jpg        # 6 polaroid scatter — 3:4
polaroid-2.jpg
polaroid-3.jpg
polaroid-4.jpg
polaroid-5.jpg
polaroid-6.jpg
spread-tall.jpg       # editorial spread tall hero — 3:4
spread-square-1.jpg   # 2 small squares — 1:1
spread-square-2.jpg
story-1.jpg           # "The Edit" story block — 3:4
story-2.jpg           # AI Stylist story block — 3:4
layered-type.jpg      # layered typography focal — 3:4
lookbook.jpg          # Spring Edit banner — 16:9
campaign.jpg          # full-bleed campaign — 21:9
```

## Stylist folder: `stylist/`
```
welcome.jpg           # initial mood image — 16:10
beige.jpg             # 15 mood images per AI keyword
black.jpg
white.jpg
date.jpg
interview.jpg
winter.jpg
summer.jpg
color.jpg
minimalist.jpg
streetwear.jpg
accessories.jpg
curvy.jpg
budget.jpg
hair.jpg
perfume.jpg
```

## How to switch from Unsplash to your images

In `js/data.js`, line 6, set:
```js
const USE_LOCAL_IMAGES = true;
```

Anywhere a local file is missing, the page will show a broken image — so it's safest to provide a complete folder for a given aesthetic before flipping the switch for that one.

You can also flip per-section. The `USE_LOCAL_IMAGES` flag is a global toggle; if you want a mixed mode (some local, some Unsplash), let me know and I'll add a per-folder override.
