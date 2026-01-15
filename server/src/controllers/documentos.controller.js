const { db } = require('../config/database');
const { logger, auditLog } = require('../config/logger');
const { createError } = require('../middlewares/errorHandler');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

const generateReference = () => {
  if (typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return crypto.randomBytes(16).toString('hex');
};

const parseJsonField = (value) => {
  if (!value) return null;
  try {
    return typeof value === 'string' ? JSON.parse(value) : value;
  } catch (error) {
    logger.warn('No se pudo parsear campo JSON de firma:', error);
    return value;
  }
};

class DocumentosController {
  async _obtenerDocumento(id) {
    const documento = await db('documentos').where('id', id).first();

    if (!documento) {
      throw createError('Documento no encontrado', 404);
    }

    return documento;
  }

  async _obtenerFirmaPorId(id) {
    const firma = await db('firmas as f')
      .select('f.*', 'u.nombre as firmante_nombre', 'u.email as firmante_email')
      .join('users as u', 'f.firmante_id', 'u.id')
      .where('f.id', id)
      .first();

    if (!firma) {
      throw createError('Registro de firma no encontrado', 404);
    }

    return {
      ...firma,
      metadatos: parseJsonField(firma.metadatos),
    };
  }

  async _validarFirmaExistente(documentoId, userId) {
    const existente = await db('firmas')
      .where('documento_id', documentoId)
      .where('firmante_id', userId)
      .whereNot('estado', 'RECHAZADA')
      .orderBy('created_at', 'desc')
      .first();

    return existente;
  }

  // GET /documentos - Listar documentos con filtros
  async listarDocumentos(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        expediente_id,
        tipo_mime,
        estado,
        fechaDesde,
        fechaHasta,
        query = ''
      } = req.query;

      const offset = (page - 1) * limit;
      
      // Construir query base
      let queryBuilder = db('documentos as d')
        .select(
          'd.*',
          'e.nro as expediente_nro',
          'e.caratula as expediente_caratula',
          'u.nombre as subido_por_nombre'
        )
        .join('expedientes as e', 'd.expediente_id', 'e.id')
        .join('users as u', 'd.creado_por', 'u.id');

      // Aplicar filtros
      if (expediente_id) {
        queryBuilder = queryBuilder.where('d.expediente_id', expediente_id);
      }

      if (tipo_mime) {
        queryBuilder = queryBuilder.where('d.tipo_mime', tipo_mime);
      }

      if (estado) {
        queryBuilder = queryBuilder.where('d.estado', estado);
      }

      if (query) {
        queryBuilder = queryBuilder.where(function() {
          this.where('d.nombre', 'like', `%${query}%`)
            .orWhere('d.descripcion', 'like', `%${query}%`)
            .orWhere('e.nro', 'like', `%${query}%`)
            .orWhere('e.caratula', 'like', `%${query}%`);
        });
      }

      if (fechaDesde) {
        queryBuilder = queryBuilder.where('d.created_at', '>=', fechaDesde);
      }

      if (fechaHasta) {
        queryBuilder = queryBuilder.where('d.created_at', '<=', fechaHasta);
      }

      // Obtener total de registros (forma segura para ONLY_FULL_GROUP_BY)
      const totalQuery = queryBuilder.clone().clearSelect().clearOrder();
      const [{ total }] = await totalQuery.count({ total: '*' });

      // Aplicar paginación y ordenamiento
      const documentos = await queryBuilder
        .orderBy('d.created_at', 'desc')
        .limit(limit)
        .offset(offset);

      // Obtener estadísticas
      const estadisticas = await db('documentos')
        .select('tipo_mime')
        .count('* as cantidad')
        .groupBy('tipo_mime');

      res.json({
        success: true,
        data: {
          documentos,
          paginacion: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages: Math.ceil(total / limit)
          },
          estadisticas
        }
      });

    } catch (error) {
      logger.error('Error al listar documentos:', error);
      throw error;
    }
  }

  // GET /documentos/:id - Obtener información del documento
  async obtenerDocumento(req, res) {
    try {
      const { id } = req.params;

      const documento = await db('documentos as d')
        .select(
          'd.*',
          'e.nro as expediente_nro',
          'e.caratula as expediente_caratula',
          'u.nombre as subido_por_nombre'
        )
        .join('expedientes as e', 'd.expediente_id', 'e.id')
        .join('users as u', 'd.creado_por', 'u.id')
        .where('d.id', id)
        .first();

      if (!documento) {
        throw createError('Documento no encontrado', 404);
      }

      // Obtener información de firma si existe
      const firmas = await db('firmas as f')
        .select('f.*', 'u.nombre as firmante_nombre')
        .join('users as u', 'f.firmante_id', 'u.id')
        .where('f.documento_id', id);

      res.json({
        success: true,
        data: {
          documento,
          firmas
        }
      });

    } catch (error) {
      logger.error('Error al obtener documento:', error);
      throw error;
    }
  }

  // GET /documentos/:id/download - Descargar documento
  async descargarDocumento(req, res) {
    try {
      const { id } = req.params;

      const documento = await db('documentos')
        .where('id', id)
        .first();

      if (!documento) {
        throw createError('Documento no encontrado', 404);
      }

      // Verificar que el archivo existe
      const filePath = path.join(process.cwd(), 'uploads', documento.url);
      
      try {
        await fs.access(filePath);
      } catch (error) {
        throw createError('Archivo no encontrado en el servidor', 404);
      }

      // Configurar headers para descarga
      res.setHeader('Content-Type', documento.tipo_mime);
      res.setHeader('Content-Disposition', `attachment; filename="${documento.nombre}"`);
      res.setHeader('Content-Length', documento.size);

      // Enviar archivo
      res.sendFile(filePath);

    } catch (error) {
      logger.error('Error al descargar documento:', error);
      throw error;
    }
  }

  // POST /documentos - Subir documento
  async subirDocumento(req, res) {
    try {
      if (!req.file) {
        throw createError('No se ha subido ningún archivo', 400);
      }

      const {
        expediente_id,
        actuacion_id,
        nombre,
        descripcion
      } = req.body;

      const userId = req.user.id;

      // Verificar que el expediente existe
      const expediente = await db('expedientes')
        .where('id', expediente_id)
        .first();

      if (!expediente) {
        throw createError('Expediente no encontrado', 404);
      }

      // Calcular hash SHA256 del archivo
      const fileBuffer = await fs.readFile(req.file.path);
      const hash_sha256 = crypto.createHash('sha256').update(fileBuffer).digest('hex');

      // Crear documento en la base de datos
      const [documentoId] = await db('documentos').insert({
        expediente_id,
        actuacion_id,
        nombre: nombre || req.file.originalname,
        tipo_mime: req.file.mimetype,
        size: req.file.size,
        url: req.file.filename,
        hash_sha256,
        descripcion: descripcion || null,
        creado_por: userId,
        estado: 'pendiente_firma'
      });

      // Obtener documento creado
      const documento = await db('documentos as d')
        .select(
          'd.*',
          'e.nro as expediente_nro',
          'e.caratula as expediente_caratula',
          'u.nombre as subido_por_nombre'
        )
        .join('expedientes as e', 'd.expediente_id', 'e.id')
        .join('users as u', 'd.creado_por', 'u.id')
        .where('d.id', documentoId)
        .first();

      // Crear actuación de subida de documento
      await db('actuaciones').insert({
        expediente_id,
        tipo: 'Subida de documento',
        descripcion: `Se subió documento: ${documento.nombre}`,
        fecha: new Date(),
        creado_por: userId
      });

      res.status(201).json({
        success: true,
        message: 'Documento subido exitosamente',
        data: { documento }
      });

    } catch (error) {
      logger.error('Error al subir documento:', error);
      
      // Eliminar archivo si se subió pero falló la base de datos
      if (req.file) {
        try {
          await fs.unlink(req.file.path);
        } catch (unlinkError) {
          logger.error('Error al eliminar archivo fallido:', unlinkError);
        }
      }
      
      throw error;
    }
  }

  // PATCH /documentos/:id - Actualizar metadatos del documento
  async actualizarDocumento(req, res) {
    try {
      const { id } = req.params;
      const { nombre, descripcion } = req.body;
      const userId = req.user.id;

      // Verificar que el documento existe
      const documento = await db('documentos')
        .where('id', id)
        .first();

      if (!documento) {
        throw createError('Documento no encontrado', 404);
      }

      // Actualizar documento
      await db('documentos')
        .where('id', id)
        .update({
          nombre: nombre || documento.nombre,
          updated_at: new Date()
        });

      // Obtener documento actualizado
      const documentoActualizado = await db('documentos as d')
        .select(
          'd.*',
          'e.nro as expediente_nro',
          'e.caratula as expediente_caratula',
          'u.nombre as subido_por_nombre'
        )
        .join('expedientes as e', 'd.expediente_id', 'e.id')
        .join('users as u', 'd.creado_por', 'u.id')
        .where('d.id', id)
        .first();

      res.json({
        success: true,
        message: 'Documento actualizado exitosamente',
        data: { documento: documentoActualizado }
      });

    } catch (error) {
      logger.error('Error al actualizar documento:', error);
      throw error;
    }
  }

  // DELETE /documentos/:id - Eliminar documento
  async eliminarDocumento(req, res) {
    try {
      const { id } = req.params;

      // Verificar que el documento existe
      const documento = await db('documentos')
        .where('id', id)
        .first();

      if (!documento) {
        throw createError('Documento no encontrado', 404);
      }

      // Verificar que no tenga firmas
      const tieneFirmas = await db('firmas')
        .where('documento_id', id)
        .first();

      if (tieneFirmas) {
        throw createError('No se puede eliminar un documento que tenga firmas', 400);
      }

      // Eliminar archivo físico
      try {
        const filePath = path.join(process.cwd(), 'uploads', documento.url);
        await fs.unlink(filePath);
      } catch (error) {
        logger.warn('No se pudo eliminar el archivo físico:', error);
      }

      // Eliminar documento de la base de datos
      await db('documentos')
        .where('id', id)
        .del();

      res.json({
        success: true,
        message: 'Documento eliminado exitosamente'
      });

    } catch (error) {
      logger.error('Error al eliminar documento:', error);
      throw error;
    }
  }

  // POST /documentos/:id/firma - Iniciar proceso de firma
  async iniciarFirma(req, res) {
    try {
      const { id } = req.params;
      const { tipo_firma = 'demo' } = req.body;
      const userId = req.user.id;

      const documento = await this._obtenerDocumento(id);

      // Verificar que el usuario no haya firmado ya este documento
      const firmaExistente = await this._validarFirmaExistente(id, userId);

      if (firmaExistente) {
        throw createError('Ya existe un proceso de firma para este documento', 400);
      }

      // Crear registro de firma
      const [firmaId] = await db('firmas').insert({
        documento_id: id,
        firmante_id: userId,
        tipo_firma,
        sello_tiempo: new Date(),
        valido: true,
        hash_documento: documento.hash_sha256,
        estado: tipo_firma === 'demo' ? 'FIRMADO' : 'PENDIENTE'
      });

      // Obtener firma creada
      const firma = await db('firmas as f')
        .select('f.*', 'u.nombre as firmante_nombre')
        .join('users as u', 'f.firmante_id', 'u.id')
        .where('f.id', firmaId)
        .first();

      res.status(201).json({
        success: true,
        message: 'Proceso de firma iniciado exitosamente',
        data: { firma: { ...firma, metadatos: parseJsonField(firma.metadatos) } }
      });

    } catch (error) {
      logger.error('Error al iniciar firma:', error);
      throw error;
    }
  }

  // POST /documentos/:id/firma/demo - Firmar documento en modo demo
  async firmarDemo(req, res) {
    try {
      const { id } = req.params;
      const { comentario } = req.body;
      const userId = req.user.id;

      const documento = await this._obtenerDocumento(id);
      const firmaExistente = await this._validarFirmaExistente(id, userId);

      if (firmaExistente && firmaExistente.estado === 'FIRMADO') {
        throw createError('El documento ya se encuentra firmado por el usuario', 400);
      }

      if (firmaExistente && firmaExistente.estado === 'PENDIENTE') {
        await db('firmas')
          .where('id', firmaExistente.id)
          .del();
      }

      const selloTiempo = new Date();
      const firmaDemo = Buffer.from(
        `SPJT-DEMO|${documento.hash_sha256}|${userId}|${selloTiempo.toISOString()}`
      ).toString('base64');

      const [firmaId] = await db('firmas').insert({
        documento_id: id,
        firmante_id: userId,
        tipo_firma: 'demo',
        sello_tiempo: selloTiempo,
        valido: true,
        estado: 'FIRMADO',
        firma_base64: firmaDemo,
        hash_documento: documento.hash_sha256,
        comentario: comentario || null,
        metadatos: JSON.stringify({
          origen: 'demo',
          mensaje: 'Firma generada para desarrollo',
          ip: req.ip
        })
      });

      const firma = await this._obtenerFirmaPorId(firmaId);

      await db('documentos')
        .where('id', id)
        .update({
          estado: 'firmado',
          updated_at: new Date(),
        });

      res.status(201).json({
        success: true,
        message: 'Documento firmado en modo demo',
        data: {
          firma,
          documento: {
            id: documento.id,
            nombre: documento.nombre,
            hash_sha256: documento.hash_sha256
          }
        }
      });
    } catch (error) {
      logger.error('Error al firmar documento en modo demo:', error);
      throw error;
    }
  }

  // POST /documentos/:id/firma/token/preparar - Preparar firma con token
  async prepararFirmaToken(req, res) {
    try {
      const { id } = req.params;
      const { comentario } = req.body;
      const userId = req.user.id;

      const documento = await this._obtenerDocumento(id);
      const firmaExistente = await this._validarFirmaExistente(id, userId);

      if (firmaExistente && firmaExistente.estado === 'FIRMADO') {
        throw createError('El documento ya se encuentra firmado por el usuario', 400);
      }

      const nonce = crypto.randomBytes(16).toString('hex');
      let firmaId;

      if (firmaExistente && firmaExistente.tipo_firma === 'token') {
        const metadatosPrevios = parseJsonField(firmaExistente.metadatos) || {};
        await db('firmas')
          .where('id', firmaExistente.id)
          .update({
            sello_tiempo: new Date(),
            estado: 'PENDIENTE',
            comentario: comentario || firmaExistente.comentario,
            metadatos: JSON.stringify({
              ...metadatosPrevios,
              fase: 'preparacion',
              nonce,
              ip: req.ip,
            })
          });
        firmaId = firmaExistente.id;
      } else {
        [firmaId] = await db('firmas').insert({
          documento_id: id,
          firmante_id: userId,
          tipo_firma: 'token',
          sello_tiempo: new Date(),
          valido: false,
          estado: 'PENDIENTE',
          hash_documento: documento.hash_sha256,
          comentario: comentario || null,
          metadatos: JSON.stringify({
            fase: 'preparacion',
            nonce,
            ip: req.ip,
          })
        });
      }

      await db('documentos')
        .where('id', id)
        .update({
          estado: 'en_firma',
          updated_at: new Date(),
        });

      res.status(201).json({
        success: true,
        message: 'Preparación de firma con token generada',
        data: {
          solicitudId: firmaId,
          hash: documento.hash_sha256,
          algoritmo: 'SHA-256',
          documento: {
            id: documento.id,
            nombre: documento.nombre,
            tipo_mime: documento.tipo_mime,
            size: documento.size
          },
          parametros: {
            nonce,
            timestamp: new Date().toISOString()
          }
        }
      });
    } catch (error) {
      logger.error('Error al preparar firma con token:', error);
      throw error;
    }
  }

  // POST /documentos/:id/firma/token/completar - Completar firma con token
  async completarFirmaToken(req, res) {
    try {
      const { id } = req.params;
      const {
        solicitudId,
        firmaBase64,
        certificadoSn,
        referenciaExterna,
        comentario,
        metadatosAdicionales = {}
      } = req.body;
      const userId = req.user.id;

      if (!solicitudId || !firmaBase64) {
        throw createError('Datos de firma incompletos', 400);
      }

      const documento = await this._obtenerDocumento(id);
      const firmaRegistro = await db('firmas')
        .where('id', solicitudId)
        .where('documento_id', id)
        .where('firmante_id', userId)
        .where('tipo_firma', 'token')
        .first();

      if (!firmaRegistro) {
        throw createError('Solicitud de firma no encontrada', 404);
      }

      if (firmaRegistro.estado === 'FIRMADO') {
        throw createError('La firma ya fue completada previamente', 400);
      }

      await db('firmas')
        .where('id', solicitudId)
        .update({
          firma_base64: firmaBase64,
          certificado_sn: certificadoSn || firmaRegistro.certificado_sn,
          sello_tiempo: new Date(),
          valido: true,
          estado: 'FIRMADO',
          comentario: comentario || firmaRegistro.comentario,
          referencia_externa: referenciaExterna || firmaRegistro.referencia_externa || generateReference(),
          metadatos: JSON.stringify({
            ...(parseJsonField(firmaRegistro.metadatos) || {}),
            fase: 'completado',
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            ...metadatosAdicionales
          })
        });

      const firma = await this._obtenerFirmaPorId(solicitudId);

      await db('documentos')
        .where('id', id)
        .update({
          estado: 'firmado',
          updated_at: new Date(),
        });

      res.json({
        success: true,
        message: 'Firma con token registrada exitosamente',
        data: {
          firma,
          documento: {
            id: documento.id,
            nombre: documento.nombre,
            hash_sha256: documento.hash_sha256
          }
        }
      });
    } catch (error) {
      logger.error('Error al completar firma con token:', error);
      throw error;
    }
  }

  // POST /documentos/:id/firma/hsm - Firmar documento utilizando HSM
  async firmarHSM(req, res) {
    try {
      const { id } = req.params;
      const { comentario } = req.body;
      const userId = req.user.id;

      const documento = await this._obtenerDocumento(id);
      const firmaExistente = await this._validarFirmaExistente(id, userId);

      if (firmaExistente && firmaExistente.estado === 'FIRMADO') {
        throw createError('El documento ya se encuentra firmado por el usuario', 400);
      }

      const selloTiempo = new Date();

      const firmaSimulada = Buffer.from(
        crypto
          .createHash('sha256')
          .update(`${documento.hash_sha256}|HSM|${selloTiempo.toISOString()}`)
          .digest('hex')
      ).toString('base64');

      let firmaId;
      if (firmaExistente && firmaExistente.tipo_firma === 'hsm') {
        const metadatosPrevios = parseJsonField(firmaExistente.metadatos) || {};
        await db('firmas')
          .where('id', firmaExistente.id)
          .update({
            firma_base64: firmaSimulada,
            certificado_sn: process.env.HSM_CERT_SN || 'HSM-DEMO-CERT',
            sello_tiempo: selloTiempo,
            valido: true,
            estado: 'FIRMADO',
            comentario: comentario || firmaExistente.comentario,
            metadatos: JSON.stringify({
              ...metadatosPrevios,
              origen: 'hsm-demo',
              ip: req.ip,
              userAgent: req.get('User-Agent'),
              certificado: process.env.HSM_CERT_SN || 'HSM-DEMO-CERT'
            })
          });
        firmaId = firmaExistente.id;
      } else {
        [firmaId] = await db('firmas').insert({
          documento_id: id,
          firmante_id: userId,
          tipo_firma: 'hsm',
          sello_tiempo: selloTiempo,
          valido: true,
          estado: 'FIRMADO',
          hash_documento: documento.hash_sha256,
          comentario: comentario || null,
          firma_base64: firmaSimulada,
          certificado_sn: process.env.HSM_CERT_SN || 'HSM-DEMO-CERT',
          metadatos: JSON.stringify({
            origen: 'hsm-demo',
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            certificado: process.env.HSM_CERT_SN || 'HSM-DEMO-CERT'
          })
        });
      }

      const firma = await this._obtenerFirmaPorId(firmaId);

      await db('documentos')
        .where('id', id)
        .update({
          estado: 'firmado',
          updated_at: new Date(),
        });

      res.status(201).json({
        success: true,
        message: 'Documento firmado con HSM (modo demo)',
        data: {
          firma,
          documento: {
            id: documento.id,
            nombre: documento.nombre,
            hash_sha256: documento.hash_sha256
          }
        }
      });
    } catch (error) {
      logger.error('Error al firmar documento con HSM:', error);
      throw error;
    }
  }

  // GET /documentos/:id/firma/status - Estado de la firma
  async estadoFirma(req, res) {
    try {
      const { id } = req.params;

      // Verificar que el documento existe
      const documento = await db('documentos')
        .where('id', id)
        .first();

      if (!documento) {
        throw createError('Documento no encontrado', 404);
      }

      // Obtener todas las firmas del documento
      const firmasRegistros = await db('firmas as f')
        .select('f.*', 'u.nombre as firmante_nombre', 'u.email as firmante_email')
        .join('users as u', 'f.firmante_id', 'u.id')
        .where('f.documento_id', id)
        .orderBy('f.created_at', 'desc');

      const firmas = firmasRegistros.map(firma => ({
        ...firma,
        metadatos: parseJsonField(firma.metadatos)
      }));

      res.json({
        success: true,
        data: {
          documento: {
            id: documento.id,
            nombre: documento.nombre,
            hash_sha256: documento.hash_sha256
          },
          firmas,
          totalFirmas: firmas.length,
          firmado: firmas.length > 0
        }
      });

    } catch (error) {
      logger.error('Error al obtener estado de firma:', error);
      throw error;
    }
  }

  // POST /documentos/:id/firma/verificar - Verificar firma
  async verificarFirma(req, res) {
    try {
      const { id } = req.params;

      // Verificar que el documento existe
      const documento = await db('documentos')
        .where('id', id)
        .first();

      if (!documento) {
        throw createError('Documento no encontrado', 404);
      }

      // Obtener firmas del documento
      const firmasRegistros = await db('firmas as f')
        .select('f.*', 'u.nombre as firmante_nombre')
        .join('users as u', 'f.firmante_id', 'u.id')
        .where('f.documento_id', id)
        .where('f.valido', true);

      const firmas = firmasRegistros.map(firma => ({
        ...firma,
        metadatos: parseJsonField(firma.metadatos)
      }));

      // Verificar integridad del documento
      const filePath = path.join(process.cwd(), 'uploads', documento.url);
      let integridadVerificada = false;

      try {
        const fileBuffer = await fs.readFile(filePath);
        const hashActual = crypto.createHash('sha256').update(fileBuffer).digest('hex');
        integridadVerificada = hashActual === documento.hash_sha256;
      } catch (error) {
        logger.warn('No se pudo verificar la integridad del archivo:', error);
      }

      res.json({
        success: true,
        data: {
          documento: {
            id: documento.id,
            nombre: documento.nombre,
            hash_sha256: documento.hash_sha256,
            integridadVerificada
          },
          firmas,
          verificacion: {
            totalFirmas: firmas.length,
            firmasValidas: firmas.filter(f => f.valido).length,
            documentoIntegro: integridadVerificada,
            estado: firmas.length > 0 ? 'FIRMADO' : 'SIN_FIRMAR'
          }
        }
      });

    } catch (error) {
      logger.error('Error al verificar firma:', error);
      throw error;
    }
  }
}

module.exports = new DocumentosController(); 
