require('dotenv').config();
const knex = require('knex');

const knexInstance = knex({
  client: 'pg',
  connection: process.env.DB_URL
});

// console.log('Knex and driver installed correctly');

// const q1 = knexInstance('amazong_products')
//   .select('*')
//   .toQuery();

// const q2 = knexInstance.from('amazong_products')
//   .select('*')
//   .toQuery();

// console.log('q1:', q1);

// console.log('q2:', q2);

const qry = knexInstance
  .from('amazong_products')
  .select('product_id', 'name', 'price', 'category')
  .from('amazong_products')
  .where({
    name: 'Point of view gun'
  })
  .first()
  .toQuery();
  .then(res => {
    console.log(res);
  });

//console.log(qry);

searchByProductName = (searchTerm) => {
  knexInstance
  .from('amazong_products')
  .select('product_id', 'name', 'price', 'category')
  .where('name', 'ILIKE', `%${searchTerm}%`)
  .then(res => {
    console.log(res);
  });
}

// searchByProductName('holo');

paginateProducts = (page) => {
  const productsPerPage = 10;
  const offset = productsPerPage * (page - 1);
  knexInstance
    .select(
      'product_id',
      'name',
      'price',
      'category'
    )
    .from('amazong_products')
    .limit(productsPerPage)
    .offset(offset)
    .then(res => {
      console.log(res);
    });
};

// paginateProducts(2);

getProductsWithImages = () => {
  knexInstance
    .select(
      'product_id',
      'name',
      'price',
      'category',
      'image'
    )
    .from('amazong_products')
    .whereNotNull('image')
    .then(res => {
      console.log(res);
    });
};

// getProductsWithImages();

/* 
To achieve the SQL count(date_viewed) AS views we needed to use the .count method instead of listing the column in the select method.

The orderBy method allows us to "order by" multiple columns by specifying an array, we can also use objects in the array to specify different directions (ascending or descending) to "order by".

Knex doesn't have methods for the now() - '30 days'::INTERVAL. Instead, knex provides a fallback method called .raw(). We can use the raw method to pass in "raw" SQL as a string.

An extra security measure is to tell the raw method that the raw SQL contains user input. We used ?? to tell knex that this is the position in the raw SQL that will contain user input. We then specify the value for the user input as the second argument to .raw(). This is called a prepared statement 

Prepared statements are a security measure to prevent a risk called "SQL injection". Knex will take this security measure for us when we use the standard methods like where, select, update, insert etc... However, when we use the raw method we need to specify the user input ourselves using the double question mark and then passing the value as a separate argument to raw.

*/

mostPopularVideosForDays = (days) => {
  knexInstance
    .select(
      'video_name',
      'region'
    )
    .count('date_viewed AS views')
    .where(
      'date_viewed',
      '>',
      knexInstance
        .raw(
          `now() - '?? days'::INTERVAL`,
          days
        )
    )
    .from('whopipe_video_views')
    .groupBy(
      'video_name',
      'region'
    )
    .orderBy([
      {
        column: 'region',
        order: 'ASC'
      },
      {
        column: 'views',
        order: 'DESC'
      }
    ])
    .then(res => {
      console.log(res);
    });
};

mostPopularVideosForDays(30);