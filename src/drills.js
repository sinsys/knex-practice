require('dotenv').config();
const knex = require('knex');

const knexInstance = knex({
  client: 'pg',
  connection: process.env.DB_URL
});

// 1. Get all items that contain text
searchList = (searchTerm) => {
  knexInstance
    .from('shopping_list')
    .select(
      'name',
      'price',
      'checked',
      'date_added',
      'category'
    )
    .where(
      'name',
      'ILIKE',
      `%${searchTerm}%`
    )
    .then(res => {
      console.log(res);
    });
};
// searchList('acon');

// 2. Get all items paginated
paginateAllItems = (page) => {
  const productsPerPage = 6;
  const offset = productsPerPage * (page - 1 );

  knexInstance
    .select('*')
    .from('shopping_list')
    .limit(productsPerPage)
    .offset(offset)
    .then(res => {
      console.log(res);
    });
};
// paginateAllItems(2);

// 3. Get all items added after date
getItemsAfterDate = (daysAgo) => {
  knexInstance
    .select('*')
    .from('shopping_list')
    .where(
      'date_added',
      '>',
      knexInstance
        .raw(
          `now() - '?? days':: INTERVAL`,
          daysAgo
        )
    )
    .then(res => {
      console.log(res);
    });
};
// getItemsAfterDate(5);

// 4. Get the total cost for each category
// Also added in the total count of the items and the cost average
categoryCosts = () => {
  knexInstance
    .select('category')
    .from('shopping_list')
    .count('name as item')
    .sum('price as total')
    .select(
      knexInstance
        .raw(
          `ROUND(
            AVG(price),
            2
          ) as average`
        )
      )
    .groupBy('category')
    .orderBy([
      {
        column: 'total',
        order: 'DESC'
      }
    ])
    .then(res => {
      console.log(res);
    });  
};
categoryCosts();