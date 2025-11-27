/* eslint-disable */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const SOURCE_ICON = path.join(__dirname, '../public/favicon.svg');
const DEST_DIR = path.join(__dirname, '../public/icons');

if (!fs.existsSync(DEST_DIR)) {
  fs.mkdirSync(DEST_DIR, { recursive: true });
}

const SIZES = [192, 256, 384, 512];
const APPLE_ICON_SIZE = 180;

async function generateIcons() {
  console.log(`Generating icons from ${SOURCE_ICON}...`);

  // Standard PWA icons
  for (const size of SIZES) {
    await sharp(SOURCE_ICON)
      .resize(size, size)
      .toFile(path.join(DEST_DIR, `icon-${size}x${size}.png`));
    console.log(`Generated ${size}x${size} icon`);
  }

  // Maskable icon (using a safe area padding, usually simpler to just use the same icon if it's suitable, 
  // but strictly speaking maskable icons should have some padding. 
  // For now, we'll generate a version with the same content but ensure it exists.
  // A proper maskable icon often needs a background. We'll assume the SVG handles its own background or add a white one.)
  
  // Generating a maskable icon (adding 10% padding/margin to ensure content is safe)
  // Or just generating a standard one and letting the user know. 
  // Let's add a background color to maskable icon to make it opaque.
  await sharp(SOURCE_ICON)
    .resize(512, 512, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } }) // Ensure background
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .toFile(path.join(DEST_DIR, 'icon-maskable-512x512.png'));
  console.log('Generated maskable icon');

  // Apple touch icon
  // Apple icons usually don't have transparency, so we flatten with white background
  await sharp(SOURCE_ICON)
    .resize(APPLE_ICON_SIZE, APPLE_ICON_SIZE)
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .toFile(path.join(DEST_DIR, 'apple-touch-icon.png'));
  console.log('Generated apple-touch-icon');
  
  // Optional 1024x1024
  await sharp(SOURCE_ICON)
      .resize(1024, 1024)
      .toFile(path.join(DEST_DIR, `icon-1024x1024.png`));
    console.log(`Generated 1024x1024 icon`);

  console.log('Done!');
}

generateIcons().catch(console.error);
