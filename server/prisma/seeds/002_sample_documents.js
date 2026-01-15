const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

const SAMPLE_DOCUMENTS = [
  {
    title: 'Resolución judicial #2024-001',
    filename: 'resolucion-2024-001.pdf',
    expediente: 'EXP-2024-001',
    descripcion: 'Resolución emitida por el Juzgado Civil y Comercial N° 1.',
    contenido: [
      '%PDF-1.4',
      '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj',
      '2 0 obj << /Type /Pages /Count 1 /Kids [3 0 R] >> endobj',
      '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >> endobj',
      '4 0 obj << /Length 132 >> stream',
      'BT /F1 24 Tf 50 700 Td (Resolución judicial #2024-001) Tj ET',
      'BT /F1 12 Tf 50 660 Td (Documento de prueba generado automáticamente.) Tj ET',
      'BT /F1 12 Tf 50 640 Td (Utilice este PDF para validar el flujo de firmas.) Tj ET',
      'endstream endobj',
      '5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj',
      'xref 0 6',
      '0000000000 65535 f ',
      '0000000010 00000 n ',
      '0000000060 00000 n ',
      '0000000117 00000 n ',
      '0000000202 00000 n ',
      '0000000374 00000 n ',
      'trailer << /Root 1 0 R /Size 6 >>',
      'startxref',
      '447',
      '%%EOF',
    ].join('\n'),
  },
  {
    title: 'Oficio de notificación #2024-015',
    filename: 'oficio-notificacion-2024-015.pdf',
    expediente: 'EXP-2024-002',
    descripcion: 'Oficio remitido al Ministerio Público Fiscal.',
    contenido: [
      '%PDF-1.4',
      '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj',
      '2 0 obj << /Type /Pages /Count 1 /Kids [3 0 R] >> endobj',
      '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >> endobj',
      '4 0 obj << /Length 148 >> stream',
      'BT /F1 24 Tf 50 700 Td (Oficio de notificación #2024-015) Tj ET',
      'BT /F1 12 Tf 50 660 Td (Documento generado para el prototipo SPJT.) Tj ET',
      'BT /F1 12 Tf 50 640 Td (Requiere firma digital para continuar con la tramitación.) Tj ET',
      'endstream endobj',
      '5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj',
      'xref 0 6',
      '0000000000 65535 f ',
      '0000000010 00000 n ',
      '0000000060 00000 n ',
      '0000000117 00000 n ',
      '0000000202 00000 n ',
      '0000000388 00000 n ',
      'trailer << /Root 1 0 R /Size 6 >>',
      'startxref',
      '461',
      '%%EOF',
    ].join('\n'),
  },
  {
    title: 'Informe pericial preliminar',
    filename: 'informe-pericial-preliminar.pdf',
    expediente: 'EXP-2024-001',
    descripcion: 'Informe técnico inicial asociado al expediente EXP-2024-001.',
    contenido: [
      '%PDF-1.4',
      '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj',
      '2 0 obj << /Type /Pages /Count 1 /Kids [3 0 R] >> endobj',
      '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >> endobj',
      '4 0 obj << /Length 166 >> stream',
      'BT /F1 24 Tf 50 700 Td (Informe pericial preliminar) Tj ET',
      'BT /F1 12 Tf 50 660 Td (Contenido ficticio utilizado para pruebas internas.) Tj ET',
      'BT /F1 12 Tf 50 640 Td (Incluye datos suficientes para validar el flujo de auditoría.) Tj ET',
      'endstream endobj',
      '5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj',
      'xref 0 6',
      '0000000000 65535 f ',
      '0000000010 00000 n ',
      '0000000060 00000 n ',
      '0000000117 00000 n ',
      '0000000202 00000 n ',
      '0000000408 00000 n ',
      'trailer << /Root 1 0 R /Size 6 >>',
      'startxref',
      '481',
      '%%EOF',
    ].join('\n'),
  },
];

async function ensureUploadsDir() {
  const uploadsDir = path.join(process.cwd(), 'uploads');
  await fs.mkdir(uploadsDir, { recursive: true });
  return uploadsDir;
}

async function writeSampleFile(uploadsDir, filename, contents) {
  const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${filename}`;
  const filePath = path.join(uploadsDir, uniqueName);
  await fs.writeFile(filePath, contents);
  return uniqueName;
}

exports.seed = async function seed(knex) {
  const uploadsDir = await ensureUploadsDir();

  const expedientes = await knex('expedientes').select('id', 'nro');
  const usuarios = await knex('users').select('id').orderBy('id');

  if (!expedientes.length || !usuarios.length) {
    console.warn('No hay expedientes o usuarios cargados; omitiendo creación de documentos de muestra.');
    return;
  }

  const documentosExistentes = await knex('documentos').count('* as total');
  if (documentosExistentes[0].total > 0) {
    console.log('Ya existen documentos registrados, se agregan muestras adicionales.');
  }

  for (const sample of SAMPLE_DOCUMENTS) {
    const existente = await knex('documentos').where('nombre', sample.title).first();
    if (existente) {
      console.log(`➖ El documento "${sample.title}" ya existe. Se omite su creación.`);
      continue;
    }

    const expediente = expedientes.find((exp) => exp.nro === sample.expediente) || expedientes[0];
    const autor = usuarios[Math.floor(Math.random() * usuarios.length)];

    const buffer = Buffer.from(sample.contenido, 'utf8');
    const hash = crypto.createHash('sha256').update(buffer).digest('hex');
    const storedFilename = await writeSampleFile(uploadsDir, sample.filename, buffer);

    await knex('documentos').insert({
      expediente_id: expediente.id,
      nombre: sample.title,
      tipo_mime: 'application/pdf',
      size: buffer.length,
      url: storedFilename,
      hash_sha256: hash,
      descripcion: sample.descripcion,
      creado_por: autor.id,
      estado: 'pendiente_firma',
    });

    await knex('actuaciones').insert({
      expediente_id: expediente.id,
      tipo: 'Carga de documento',
      descripcion: `Se incorporó el documento "${sample.title}" para firma.`,
      fecha: new Date(),
      creado_por: autor.id,
    });
  }

  console.log(`📄 Se generaron ${SAMPLE_DOCUMENTS.length} documentos de prueba.`);
};

