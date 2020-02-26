const ShoppingListService = {

  getItems(knex) {
    return (
      knex
        .select('*')
        .from('shopping_list')
    );
  },

  getItem(knex, id) {
    return (
      knex
        .select('*')
        .from('shopping_list')
        .where(
          'id',
          id
        )
        .first()
    );
  },

  deleteItem(knex, id) {
    return (
      knex('shopping_list')
        .where( { id } )
        .delete()
    );
  },

  addItem(knex, newItem) {
    return (
      knex
        .insert(newItem)
        .into('shopping_list')
        .returning('*')
        .then(rows => {
          return (
            rows[0]
          )
        })
    );
  },

  updateItem(knex, id, newData) {
    return (
      knex('shopping_list')
        .where( { id } )
        .update(newData)
    );
  }

};

module.exports = ShoppingListService;