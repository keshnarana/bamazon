var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require("cli-table3");
require("dotenv").config();

var connection = mysql.createConnection({
  host: "localhost",

  port: 3306,


  user: "root",

  password: process.env.password,
  database: "bamazon_db"
});

connection.connect(function(error){
	if (error) throw error;

	console.log("\n-----------------------------------------------------------------" 
		+ "\nWelcome to Bamazon!\n" 
		+ "-----------------------------------------------------------------\n");

	welcome();
});


function welcome() {

	inquirer.prompt([
		{
			name: "action",
			type: "list",
			choices: ["View items for sale", "Leave the store"],
			message: "Please select what you would like to do."
		}
	]).then(function(action) {
		if (action.action === "View items for sale") {
			viewItems();
		
		} else if (action.action === "Leave the store") {
			exit();
		}
	});
}


function viewItems() {

	var query = "SELECT * FROM products";

	connection.query(query, function(error, results) {
		// if error, tell us
		if (error) throw error;
	
    var listTable = new Table({
      head: ["item _id", "product_name", "price"],
      colWidths: [10, 45, 12]
  });

  for (var i = 0; i < results.length; i++) {
      listTable.push([results[i].item_id, results[i].product_name, results[i].price]);
}
  
  console.log("\n\n"+listTable.toString()+"\n\n");
		
		inquirer.prompt([
			{
				name: "id",
				message: "Please enter the ID of the item that you would like to purchase.",
				// validates that the id is a number greater than 0 and less than/equal to 
				// the number of items
				validate: function(value) {
					if (value > 0 && isNaN(value) === false && value <= results.length) {
						return true;
					}
					return false;
				}
			},
			{
				name: "qty",
				message: "What quantity would you like to purchase?",
				// validate the quantity is a number larger than 0
				validate: function(value) {
					if (value > 0 && isNaN(value) === false) {
						return true;
					}
					return false;
				}
			}
		]).then(function(transaction) {
		
			var itemQty;
			var itemPrice;
			var itemName;
			var productSales;
		
			for (var j = 0; j < results.length; j++) {
				if (parseInt(transaction.id) === results[j].item_id) {
					itemQty = results[j].stock_quantity;
					itemPrice = results[j].price;
					itemName = results[j].product_name;
					productSales = results[j].product_sales;
				}
			}
			
			if (parseInt(transaction.qty) > itemQty) {
				console.log("\nInsufficient inventory. We have " 
					+ itemQty + " in stock. Try again.\n");
				welcome();
			} 
		
			else if (parseInt(transaction.qty) <= itemQty) {
				console.log("\nCongrats! You successfully purchased " + transaction.qty 
					+ " of " + itemName + ".");
				lowerQty(transaction.id, transaction.qty, itemQty, itemPrice);
				salesRevenue(transaction.id, transaction.qty, productSales, itemPrice);
			}
		});
	});
}




function lowerQty(item, purchaseQty, stockQty, price) {

	connection.query(
		"UPDATE products SET ? WHERE ?", 
		[
			{
				stock_quantity: stockQty - parseInt(purchaseQty)
			},
			{
				item_id: parseInt(item)
			}
		],
		
		function(error, response) {
			if (error) throw error;
	});
}


function salesRevenue(item, purchaseQty, productSales, price) {
	var customerCost = parseInt(purchaseQty) * price;
	
	connection.query(
		"UPDATE products SET ? WHERE ?", 
		[
			{
				product_sales: productSales + customerCost
			}, 
			{
				item_id: parseInt(item)
			}
		], 
		function(error, response) {
			if (error) throw error;
	
			console.log("The total price is $" + customerCost.toFixed(2) 
				+ ". Thanks for you purchase!\n");
		
			welcome();
	});
}


function exit() {
	console.log("\nbye-bye ");
	connection.end();
}