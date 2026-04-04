const multer = require('multer');
const path = require('path');
const isVercel = Boolean(process.env.VERCEL)

const diskStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const memoryStorage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Apenas arquivos de imagem são permitidos!'), false);
  }
};

const upload = multer({
  storage: isVercel ? memoryStorage : diskStorage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024
  }
});

module.exports = upload;