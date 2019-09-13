  
-- drop db if exists, create db --
DROP DATABASE IF EXISTS bamazon_db;
CREATE DATABASE bamazon_db;

-- use bamazon db --
USE bamazon_db;

-- create products table --
CREATE TABLE products (
	item_id INT AUTO_INCREMENT NOT NULL,
  product_name VARCHAR(100) NULL,
  department_name VARCHAR(100) NULL,
  price DECIMAL(10,2) NULL,
  stock_quantity INT NULL,
  product_sales DECIMAL(10,2) DEFAULT 0,
	PRIMARY KEY (item_id)
);

INSERT INTO products (product_name, department_name, price, stock_quantity, product_sales)
VALUES ("samsung phone","electronics",900.99,60,111), ("jeans","clothes",50,80,235), 
			 ("Lenovo Yoga 720 Laptop", "electronics", 949.99, 4, 50), 
		 ("Jacket", "clothes", 89.99, 5, 380), 
       ("loose-top","clothes",19,100, 200), ("iphone","electronics",800.99,50,2300);
   
-- create departments table --
CREATE TABLE departments (
	department_id INT AUTO_INCREMENT NOT NULL,
  department_name VARCHAR(100) NULL,
  over_head_costs DECIMAL(10,2) NULL,
  PRIMARY KEY (department_id)
);

-- default table vals --
INSERT INTO departments (department_name, over_head_costs)
VALUES ("electronics", 10000),  ("clothes", 1000);

-- view tables --
SELECT * FROM products;
SELECT * FROM departments;

SELECT department_id, departments.department_name, over_head_costs, SUM(product_sales) AS product_sales,
	SUM(product_sales) - over_head_costs AS total_profit
FROM departments
INNER JOIN products
ON departments.department_name = products.department_name
GROUP BY department_id;

delete from products where item_id=7;

INSERT INTO products (department_name)
select department_name
from departments
where department_name= "food";
