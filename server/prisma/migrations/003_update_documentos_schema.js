exports.up = function(knex) {
  return knex.schema.table('documentos', function(table) {
    table.text('descripcion').nullable();
    table.string('estado', 30).defaultTo('pendiente_firma');
    table.integer('creado_por').unsigned().nullable();

    table.foreign('creado_por').references('id').inTable('users');
  });
};

exports.down = function(knex) {
  return knex.schema.table('documentos', function(table) {
    table.dropForeign(['creado_por']);
    table.dropColumn('creado_por');
    table.dropColumn('estado');
    table.dropColumn('descripcion');
  });
};

