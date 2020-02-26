BEGIN;

INSERT INTO shopping_list
  (name, price, category, checked, date_added)
VALUES
  ('NoBull Burger', 2.00, 'Snack', false, now() - '9 days'::INTERVAL);

COMMIT;