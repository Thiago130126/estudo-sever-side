const multer = require('multer');
const path = require('path');

const armazenamento = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/books');
    },
    filename: (req, file, cb) => {
        const extensao = path.extname(file.originalname);
        const nomeUnico = Date.now() + extensao;

        cb(null, nomeUnico);
    }
});

const filtro = (req, file, cb) => {
    const extensoesPermitidas = /jpeg|jpg|png|webp/;
    const extensaoValida = extensoesPermitidas.test(path.extname(file.originalname).toLowerCase());
    const mimetypeValido = extensoesPermitidas.test(file.mimetype);

    if (extensaoValida && mimetypeValido){
        cb(null, true);
    }else{
        cb(new Error('Apenas arquivos de imagem (jpeg, jpg, png, webp) são permitidos.'));
    }
};

const upload = multer({
    storage: armazenamento,
    fileFilter: filtro
});

module.exports = upload;