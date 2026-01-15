exports.up = function(knex) {
  return knex.schema.table('firmas', function(table) {
    table.string('estado', 30).defaultTo('PENDIENTE');
    table.text('firma_base64', 'longtext');
    table.string('hash_documento', 64);
    table.json('metadatos');
    table.text('comentario', 'longtext');
    table.string('referencia_externa', 100);
  });
};

exports.down = function(knex) {
  return knex.schema.table('firmas', function(table) {
    table.dropColumn('referencia_externa');
    table.dropColumn('comentario');
    table.dropColumn('metadatos');
    table.dropColumn('hash_documento');
    table.dropColumn('firma_base64');
    table.dropColumn('estado');
  });
};

