import multer from 'multer';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
        cb(null, './public/temp'); // Specify the destination directory for uploaded files
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`); // Specify the filename for uploaded files
    },
});

const upload = multer({ storage });

export default upload;

