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
		+ "\nWelcome Bamazon Supervisor!\n" 
		+ "-----------------------------------------------------------------\n");

	welcome();
});

function welcome() {
	inquirer.prompt([
		{
			name: "action",
			type: "list",
			choices: ["View Product Sales By Department", "Create New Department", "Exit"],
			message: "Please select what you would like to do."
		},
	]).then(function(response) {
		if (response.action === "View Product Sales By Department") {
			viewSales();
		} else if (response.action === "Create New Department") {
			createDepartment();
		} else if (response.action === "Exit") {
			exit();
		}
	});
}

function viewSales() {
	var joinQuery = "SELECT department_id, departments.department_name, over_head_costs,"
		+ " SUM(product_sales) AS product_sales," 
		+ " SUM(product_sales) - over_head_costs AS total_profit ";
	joinQuery += "FROM departments INNER JOIN products ";
	joinQuery += "ON departments.department_name = products.department_name ";
	joinQuery += "GROUP BY department_id ";

	connection.query(joinQuery, function(error, results) {
		if (error) throw error;
		var listTable = new Table({
			head:["department_id","department_name","over_head_costs","product_sales","total_profit"],
			colWidths:[10,40,10,10,10]
		});
	for (var i = 0; i < results.length; i++) {
		listTable.push([results[i].department_id,results[i].department_name,results[i].over_head_costs.toFixed(2),results[i].product_sales.toFixed(2), results[i].total_profit.toFixed(2)])
		}
		
	console.log("\n\n"+listTable.toString()+"\n\n");
		welcome();
	});
}

function createDepartment() {
	connection.query("SELECT * FROM departments", function (error, results) {
		if (error) throw error;
		var listTable = new Table({
			head: ["department_id","department_name","over_head_costs"],
			colWidths:[10,30,10]
		});

		for (var i = 0; i < results.length; i++) {
		listTable.push([results[i].department_id,results[i].department_name,results[i].over_head_costs]);
		
		}
		console.log("\n\n"+listTable.toString()+"\n\n");
		inquirer.prompt([
			{
				name: "name",
				message: "Please input new department name.",
				validate: function(value) {
					var deptArray = [];
					for (var i = 0; i < results.length; i++) {
						deptArray.push(results[i].department_name.toLowerCase());
					}
					if (deptArray.indexOf(value.toLowerCase()) === -1) {
						return true;
					}
					return false;
				}
			},
			{
				name: "overhead",
				message: "Input new department overhead costs.",
				validate: function(value) {
					if (isNaN(value) === false && value > 0) {
						return true;
					}
					return false;
				}
			}
		]).then(function(newDept) {
			connection.query(
				"INSERT INTO departments SET ?",
				{
					department_name: newDept.name,
					over_head_costs: parseFloat(newDept.overhead).toFixed(2)
				}, 
				function(error, results) {
					if (error) throw error;
					console.log("\nNew department added successfully.\n");
					welcome();
			});

		});
	});
}


function exit() {
	console.log("\nbye-bye");
	connection.end();
}




