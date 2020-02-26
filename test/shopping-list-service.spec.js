require('dotenv').config();
const ShoppingListService = require('../src/shopping-list-service');
const knex = require('knex');

// Helper function to make new date objects
makeNewDate = (daysAgo) => {
  let now = new Date();
  let oldDate = now.getDate() - daysAgo;
  now.setDate(oldDate);
  return now;
};

// Testing our ShoppingListService object
describe('ShoppingListService object', () => {

  // Test items
  const testItems = [
    {
      id: 1,
      name: 'NoBull Burger',
      price: '2.00',
      category: 'Snack',
      checked: false,
      date_added: makeNewDate(3)
    },
    {
      id: 2,
      name: 'Turnip the Beet',
      price: '0.20',
      category: 'Lunch',
      checked: true,
      date_added: makeNewDate(4)     
    },
    {
      id: 3,
      name: 'Marscarphony',
      price: '1.80',
      category: 'Lunch',
      checked: true,
      date_added: makeNewDate(5)     
    },
    {
      id: 4,
      name: 'Burgatory',
      price: '1.50',
      category: 'Main',
      checked: true,
      date_added: makeNewDate(6)
    },
    {
      id: 5,
      name: 'Sleight of Ham',
      price: '3.10',
      category: 'Lunch',
      checked: false,
      date_added: makeNewDate(7)
    }
  ];

  // Declare database var
  let db;

  // Create database connection
  before('create db connection', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL
    });
  });

  // Clean up entries before first test
  before('clean up db', () => {
    return (
      db('shopping_list')
        .truncate()
    );
  });

  // Clean up entries after each test
  afterEach('clean up db', () => {
    return (
      db('shopping_list')
        .truncate()
    );
  });  

  // 'shopping_list' has data
  context(`Given 'shopping_list' contains data`, () => {

    // Add data to our 'shopping_list' table before each test
    beforeEach(`Seed database with test data`, () => {
      return (
        db
          .into('shopping_list')
          .insert(testItems)
      );
    });

    describe(`getItems()`, () => {

      // Verify our actual data equals our test data
      it(`getItems() resolves all items from 'shopping_list' table`, () => {
        return (
          ShoppingListService
            .getItems(db)
            .then(actData => {
              expect(actData)
                .to.eql(testItems.map(item => ({
                  ...item
                })));
            })
        );
      });

    });

    
    describe(`getItem()`, () => {

      // Verify our actual item equals the correct test item
      it(`getItem() returns the correct item from 'shopping_list' table`, () => {
        const itemId = 2;
        const testItem = testItems[1];
        return (
          ShoppingListService
            .getItem(
              db,
              itemId
            )
            .then(actData => {
              expect(actData)
                .to.eql({
                  ...testItem,
                  date_added: new Date(testItem.date_added)
                })
            })
        );
      });

    });


    describe(`deleteItem()`, () => {

      // Verify that our item is deleted from 'shopping_list'
      it(`deleteItem() deletes the correct item from 'shopping_list' table`, () => {
        const itemId = 3;
        return (
          ShoppingListService
            .deleteItem(
              db,
              itemId
            )
            .then(() => {
              return (
                ShoppingListService
                  .getItems(db)
              );
            })
            .then(allItems => {
              const expected =
                testItems.filter(item =>
                  item.id !== itemId
                );
              expect(allItems)
                .to.eql(expected)
            })
        );
      });

    });

    describe(`updateItem()`, () => {

      // Verify that correct item is updated from 'shopping_list
      it(`updateItem() correctly updates an item from 'shopping_list' table`, () => {
        const uptItemId = 3;
        const newItemData = {
          name: 'Updated name',
          price: '3.10',
          category: 'Snack',
          checked: false,
          date_added: new Date()
        };
        return (
          ShoppingListService
            .updateItem(
              db,
              uptItemId,
              newItemData
            )
            .then(() => {
              return (
                ShoppingListService
                  .getItem(
                    db,
                    uptItemId
                  )
              );
            })
            .then(actData => {
              expect(actData)
                .to.eql({
                  id: uptItemId,
                  ...newItemData
                });
            })
        );
      });

      // Verify that item cannot have incorrect category updated
      it(`updateItem() throws 'invalid input' error with invalid category`, () => {
        const uptItemId = 3;
        const newItemData = {
          name: 'Updated name',
          price: '3.10',
          category: 'Foo',
          checked: false,
          date_added: new Date()
        };
        return (
          ShoppingListService 
            .updateItem(
              db, 
              uptItemId,
              newItemData
            )
            .then(
              () => {
                return (
                  expect
                    .fail('db should throw error')
                );
              },
              err => {
                return (
                  expect(err.message)
                    .to.include('invalid input value for enum grocery')
                )
              }
            )
        );
      });

      it(`updateItem() throws 'not-null constraint' error with null name`, () => {
        const uptItemId = 3;
        const newItemData = {
          name: null,
          price: '3.10',
          category: 'Lunch',
          checked: false,
          date_added: new Date()
        };
        return (
          ShoppingListService 
            .updateItem(
              db, 
              uptItemId,
              newItemData
            )
            .then(
              () => {
                return (
                  expect
                    .fail('db should throw error')
                );
              },
              err => {
                return (
                  expect(err.message)
                    .to.include('not-null constraint')
                )
              }
            )
        );
      });

      it(`updateItem() throws 'not-null constraint' error with null price`, () => {
        const uptItemId = 3;
        const newItemData = {
          name: 'Test name',
          price: null,
          category: 'Lunch',
          checked: false,
          date_added: new Date()
        };
        return (
          ShoppingListService 
            .updateItem(
              db, 
              uptItemId,
              newItemData
            )
            .then(
              () => {
                return (
                  expect
                    .fail('db should throw error')
                );
              },
              err => {
                return (
                  expect(err.message)
                    .to.include('not-null constraint')
                )
              }
            )
        );
      });

      it(`updateItem() throws 'not-null constraint' error with null category`, () => {
        const uptItemId = 3;
        const newItemData = {
          name: 'Test name',
          price: '3.10',
          category: null,
          checked: false,
          date_added: new Date()
        };
        return (
          ShoppingListService 
            .updateItem(
              db, 
              uptItemId,
              newItemData
            )
            .then(
              () => {
                return (
                  expect
                    .fail('db should throw error')
                );
              },
              err => {
                return (
                  expect(err.message)
                    .to.include('not-null constraint')
                )
              }
            )
        );
      });

    })

  });

  context(`Given 'shopping_list' is empty`, () => {

    describe(`addItem()`, () => {

      
      it(`addItem() inserts the correct item into 'shopping_list' table`, () => {
        const newItem = {
          name: 'Test name',
          price: '4.20',
          category: 'Lunch',
          checked: true,
          date_added: makeNewDate(7)
        };
        return (
          ShoppingListService
            .addItem(
              db,
              newItem
            )
            .then(actData => {
              expect(actData)
                .to.eql({
                  id: 1,
                  name: newItem.name,
                  price: newItem.price,
                  category: newItem.category,
                  checked: newItem.checked,
                  date_added: new Date(newItem.date_added)
                });
            })
        );
      });

      // Verifies only valid categories can be selected
      it(`addItem() throws 'invalid input' error with invalid category`, () => {
        const newItem = {
          name: 'Test name',
          price: '4.20',
          category: 'Foo',
          checked: true,
          date_added: makeNewDate(7)
        };
        return (
          ShoppingListService 
            .addItem(
              db, 
              newItem
            )
            .then(
              () => {
                return (
                  expect
                    .fail('db should throw error')
                );
              },
              err => {
                return (
                  expect(err.message)
                    .to.include('invalid input value for enum grocery')
                )
              }
            )
        );
      });

      it(`addItem() throws 'not-null constraint' error without name`, () => {
        const newItem = {
          price: '4.20',
          category: 'Lunch',
          checked: true,
          date_added: makeNewDate(7)
        };
        return (
          ShoppingListService 
            .addItem(
              db, 
              newItem
            )
            .then(
              () => {
                return (
                  expect
                    .fail('db should throw error')
                );
              },
              err => {
                return (
                  expect(err.message)
                    .to.include('not-null constraint')
                )
              }
            )
        );
      });

      it(`addItem() throws 'not-null constraint error' without price`, () => {
        const newItem = {
          name: 'Test name',
          category: 'Lunch',
          checked: true,
          date_added: makeNewDate(7)
        };
        return (
          ShoppingListService 
            .addItem(
              db, 
              newItem
            )
            .then(
              () => {
                return (
                  expect
                    .fail('db should throw error')
                );
              },
              err => {
                return (
                  expect(err.message)
                    .to.include('not-null constraint')
                )
              }
            )
        );
      });

      it(`addItem() throws 'not-null constraint' error without category`, () => {
        const newItem = {
          name: 'Test name',
          price: '4.20',
          checked: true,
          date_added: makeNewDate(7)
        };
        return (
          ShoppingListService 
            .addItem(
              db, 
              newItem
            )
            .then(
              () => {
                return (
                  expect
                    .fail('db should throw error')
                );
              },
              err => {
                return (
                  expect(err.message)
                    .to.include('not-null constraint')
                )
              }
            )
        );
      });

    });

  });

  // Terminate db connection when done
  after(() => {
    db.destroy();
  });

});