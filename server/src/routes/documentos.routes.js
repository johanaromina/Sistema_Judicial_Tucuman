const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { asyncHandler } = require('../middlewares/errorHandler');
const { authGuard, requireSecretario, requireOperador } = require('../middlewares/auth.middleware');
const { auditTrail } = require('../middlewares/auth.middleware');
const documentosController = require('../controllers/documentos.controller');

// Configuración de multer para upload de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB máximo
  },
  fileFilter: (req, file, cb) => {
    // Permitir solo ciertos tipos de archivo
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'text/plain'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido'), false);
    }
  }
});

// Aplicar middleware de autenticación a todas las rutas
router.use(authGuard);

// GET /documentos - Listar documentos con filtros
router.get('/', 
  requireOperador,
  auditTrail('LISTAR', 'documentos'),
  asyncHandler(documentosController.listarDocumentos)
);

// GET /documentos/:id - Obtener información del documento
router.get('/:id', 
  requireOperador,
  auditTrail('CONSULTAR', 'documentos'),
  asyncHandler(documentosController.obtenerDocumento.bind(documentosController))
);

// GET /documentos/:id/download - Descargar documento
router.get('/:id/download', 
  requireOperador,
  auditTrail('DESCARGAR', 'documentos'),
  asyncHandler(documentosController.descargarDocumento)
);

// POST /documentos - Subir documento
router.post('/', 
  requireSecretario,
  upload.single('documento'),
  auditTrail('SUBIR', 'documentos'),
  asyncHandler(documentosController.subirDocumento)
);

// PATCH /documentos/:id - Actualizar metadatos del documento
router.patch('/:id', 
  requireSecretario,
  auditTrail('ACTUALIZAR', 'documentos'),
  asyncHandler(documentosController.actualizarDocumento)
);

// DELETE /documentos/:id - Eliminar documento
router.delete('/:id', 
  requireSecretario,
  auditTrail('ELIMINAR', 'documentos'),
  asyncHandler(documentosController.eliminarDocumento)
);

// POST /documentos/:id/firma - Iniciar proceso de firma
router.post('/:id/firma', 
  requireSecretario,
  auditTrail('INICIAR_FIRMA', 'documentos'),
  asyncHandler(documentosController.iniciarFirma.bind(documentosController))
);

// POST /documentos/:id/firma/demo - Firmar en modo demo
router.post('/:id/firma/demo',
  requireOperador,
  auditTrail('FIRMAR_DEMO', 'documentos'),
  asyncHandler(documentosController.firmarDemo.bind(documentosController))
);

// POST /documentos/:id/firma/token/preparar - Preparar firma con token
router.post('/:id/firma/token/preparar',
  requireOperador,
  auditTrail('PREPARAR_FIRMA_TOKEN', 'documentos'),
  asyncHandler(documentosController.prepararFirmaToken.bind(documentosController))
);

// POST /documentos/:id/firma/token/completar - Completar firma con token
router.post('/:id/firma/token/completar',
  requireOperador,
  auditTrail('COMPLETAR_FIRMA_TOKEN', 'documentos'),
  asyncHandler(documentosController.completarFirmaToken.bind(documentosController))
);

// POST /documentos/:id/firma/hsm - Firmar documento mediante HSM
router.post('/:id/firma/hsm',
  requireSecretario,
  auditTrail('FIRMAR_HSM', 'documentos'),
  asyncHandler(documentosController.firmarHSM.bind(documentosController))
);

// GET /documentos/:id/firma/status - Estado de la firma
router.get('/:id/firma/status', 
  requireOperador,
  auditTrail('CONSULTAR_FIRMA', 'documentos'),
  asyncHandler(documentosController.estadoFirma.bind(documentosController))
);

// POST /documentos/:id/firma/verificar - Verificar firma
router.post('/:id/firma/verificar', 
  requireOperador,
  auditTrail('VERIFICAR_FIRMA', 'documentos'),
  asyncHandler(documentosController.verificarFirma.bind(documentosController))
);

module.exports = router; 
