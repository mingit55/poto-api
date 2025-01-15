const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = {
  uploader: cloudinary.uploader,
  getPublicId: (imagePath) =>
    'poto/' + imagePath.split('/').pop().split('.')[0],
  upload: (file) => {
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: 'poto',
            allowed_formats: ['jpeg', 'png', 'jpg'],
          },
          async (error, result) => {
            if (error) {
              reject(error);
              console.error('Error uploading image:', error);
              return;
            }
            resolve({
              original_name: Buffer.from(file.originalname, 'latin1').toString(
                'utf-8',
              ),
              ...result,
            });
          },
        )
        .end(file.buffer);
    });
  },
};
