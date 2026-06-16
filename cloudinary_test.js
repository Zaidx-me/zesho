const cloudinary = require('cloudinary').v2;

// Configure Cloudinary with real credentials
cloudinary.config({
  cloud_name: 'dcs8nycyc',
  api_key: '685822247911943',
  api_secret: 'BZQU1BJv2nwH5quEmH4ZpdZq9CE',
});

async function main() {
  console.log('--- Step 1: Uploading sample image ---\n');
  const uploadResult = await cloudinary.uploader.upload(
    'https://res.cloudinary.com/demo/image/upload/sample.jpg',
    { folder: 'zesho_test' }
  );
  console.log('Upload successful!');
  console.log('Secure URL:', uploadResult.secure_url);
  console.log('Public ID:', uploadResult.public_id);
  console.log('');

  console.log('--- Step 2: Image Metadata ---\n');
  console.log('Width:     ', uploadResult.width, 'px');
  console.log('Height:    ', uploadResult.height, 'px');
  console.log('Format:    ', uploadResult.format);
  console.log('File size: ', uploadResult.bytes, 'bytes');
  console.log('');

  console.log('--- Step 3: Transformed URL (f_auto + q_auto) ---\n');
  // f_auto = automatically serves best format (WebP, AVIF, etc.) based on browser
  // q_auto = automatically adjusts quality to balance visual quality and file size
  const transformedUrl = cloudinary.url(uploadResult.public_id, {
    f_auto: true,
    q_auto: true,
  });
  console.log('Transformed URL:', transformedUrl);
  console.log('');
  console.log('Done! Click link below to see optimized version of the image.');
  console.log('Check the size and the format.');
}
main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
