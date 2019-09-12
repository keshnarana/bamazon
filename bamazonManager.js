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
		+ "\nWelcome Bamazon Manager!\n" 
		+ "-----------------------------------------------------------------\n");

	welcome();
});


function welcome() {
	inquirer.prompt([
    {
      name: "action",
      type: "list",
      choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", 
        "Add New Product", "Exit"],
      message: "Please select what you would like to do."
    }
 ]).then(function(answer) {
   if (answer.action === "View Products for Sale") {
     viewProducts();
   } else if (answer.action === "View Low Inventory") {
     viewLowInventory();
   } else if (answer.action === "Add to Inventory") {
     addToInventory();
   } else if (answer.action === "Add New Product") {
     addNewProduct();
   } else if (answer.action === "Exit") {
     exit();
   }
 })
}
function viewProducts() {
	var query = "SELECT * FROM products";
	connection.query(query, function(error, results) {
		if (error) throw error;
		var listTable = new Table({
      head: ["item_id", "product_name","price","stock_quantity"],
      colWidths: [10, 45, 12,15]
  });

	for (var i = 0; i < results.length; i++) {
	
		listTable.push([results[i].item_id,results[i].product_name, results[i].price,results[i].stock_quantity ]) 
	
  }
console.log("\n\n"+listTable.toString()+"\n\n");
		welcome();
	});
}

function viewLowInventory() {
	var query = "SELECT * FROM products WHERE stock_quantity <= 5";
	connection.query(query, function(error, results) {
		if (error) throw error;
		var listTable = new Table({ 
			head: ["item _id","product_name","stock_quantity"],
		colWidths: [10, 45,18]})
	for (var i = 0; i < results.length; i++) {
		
		listTable.push([results[i].item_id, results[i].product_name,results[i].stock_quantity]);
		
  }
console.log("\n\n"+listTable.toString()+"\n\n");
		welcome();
	});
}



function addToInventory() {
	connection.query("SELECT * FROM products", function (error, results) {
		if (error) throw error;
		var listTable = new Table({
			head: ["item _id", "product_name", "price","stock_quantity"],
			colWidths: [10, 45, 12,18]
		});
	  
		for (var i = 0; i < results.length; i++) {
			listTable.push([results[i].item_id, results[i].product_name, results[i].price,results[i].stock_quantity]);
	  }
		
		console.log("\n\n"+listTable.toString()+"\n\n");
		inquirer.prompt([
			{
				name: "id",
				message: "Input the item ID to increase inventory on.",
				validate: function(value) {
					if (isNaN(value) === false && value > 0 && value <= results.length) {
						return true;
					}
					return false;
				}
			},
			{
				name: "amount",
				message: "Input the amount to increase inventory by.",
				validate: function(value) {
					if (isNaN(value) === false && value > 0) {
						return true;
					}
					return false;
				}
			}
		]).then(function(answer) {
			var itemQty;
			for (var i = 0; i < results.length; i++) {
				if (parseInt(answer.id) === results[i].item_id) {
					itemQty = results[i].stock_quantity;
				}
			}
			increaseQty(answer.id, itemQty, answer.amount);
		});
	});
}

function increaseQty(item, stockQty, addQty) {
	connection.query(
		"UPDATE products SET ? WHERE ?", 
		[
			{
				stock_quantity: stockQty + parseInt(addQty)
			}, 
			{
				item_id: parseInt(item)
			}
		], 
		function(error, results) {
			if (error) throw error;
			console.log("\nInventory successfully increased.\n");
			welcome();
	});
}

function addNewProduct() {
	connection.query("SELECT * FROM departments", function (error, results) {
    if (error) throw error;
		inquirer.prompt([
			{
				name: "item",
				message: "Input new item to add."
			},
			{
				name: "department",
				type: "list",
				choices: function() {
					var deptArray = [];
					for (var i = 0; i < results.length; i++) {
						deptArray.push(results[i].department_name);
					}
					return deptArray;
				},
				message: "Which department does this item belong in?"
			},
			{
				name: "price",
				message: "How much does this item cost?",
				validate: function(value) {
					if (value >= 0 && isNaN(value) === false) {
						return true;
					}
					return false;
				}
			},
			{
				name: "inventory",
				message: "How much inventory do we have?",
				validate: function(value) {
					if (value > 0 && isNaN(value) === false) {
						return true;
					}
					return false;
				}			
			}
		]).then(function(newItem) {
			addItemToDb(newItem.item, newItem.department, 
				parseFloat(newItem.price).toFixed(2), parseInt(newItem.inventory));
		});
	});
}


function addItemToDb(item, department, price, quantity) {
	connection.query(
		"INSERT INTO products SET ?", 
		{
			product_name: item,
			department_name: department,
			price: price,
			stock_quantity: quantity
		},
		function(error, results) {
			if (error) throw error;
			console.log("\nNew product successfully added.\n");
			welcome();
	});
}



function exit() {
	console.log("\nbye-bye.");
	connection.end();
}