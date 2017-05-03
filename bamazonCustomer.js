var mysql = require("mysql");
var inquirer = require("inquirer");
var table = require('console.table');


var mysql = require("mysql");
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'manwa4me',
    database: 'bamazon'
});

connection.connect(function(err) {
    if (err) {
        throw err;
    } else {
        console.log("Successfully connected to bamazon db");
    }
});

/**
CREATE TABLE products (
    item_id INT AUTO_INCREMENT NOT NULL,
    product_name VARCHAR(30) NOT NULL,
    department_name VARCHAR(30) NOT NULL,
    price DECIMAL(6 , 2 ) NOT NULL,
    stock_quantity INT,
    PRIMARY KEY (item_id)
);
**/
function showItems() {
    connection.query('SELECT item_id, product_name, price from products ', function(err, results, fields) {
        if (err) {
            console.log(err);
        } else {
            console.table(results);
            sell();
        }
    });
}

// The first should ask them the ID of the product they would like to buy.
// The second message should ask how many units of the product they would like to buy.

function sell() {
    inquirer.prompt(
        [{
            name: "item_id",
            type: "input",
            message: "Please enter the id of the item you want to purchase?",
            validate: function(value) {
                if (isNaN(value) === false) {
                    return true;
                }
                return false;
            }
        }, {
            name: "quantity",
            type: "input",
            message: "Enter quantity you would like to buy?",
            validate: function(value) {
                if (isNaN(value) === false) {
                    return true;
                }
                return false;
            }
        }]).then(function(answer) {
        connection.query("SELECT * FROM products where item_id = ? and stock_quantity >= ?", [answer.item_id, answer.quantity], function(err, results) {
            var availableQty = 0;
            if (err) throw err;
            if (results.length != 0) {
                availableQty = results[0].stock_quantity;
            }
            if (availableQty > 0) {
                console.log("Item available");
                //update store
                var remainingQty = availableQty - answer.quantity;
                var total = answer.quantity * results[0].price;
                updateStockAndSale(answer.item_id, remainingQty, total);
                updateDepartmentSale(results[0].department_name, total);
                console.log("Your Total is:" + total + "$");

            } else {
                console.log("Sorry, Insufficient quantity");
                // do you wish to continue

            }
            connection.end();

        });
    });


}

//
// create table departments(
//  department_id int(10) auto_increment not null,
//  department_name varchar(50),
//  over_head_costs int(100),
//  total_sales integer(100),
//  primary key(department_id)
// )
function updateDepartmentSale(department_name, total) {
    console.log(department_name);
    connection.query('UPDATE departments SET  total_sales = total_sales + ? WHERE department_name = ? ', [
         total, department_name
    ], function(err, results, fields) {
        if (err) {
            throw err;
        } else {
            console.log("Updated department sale");
        }
    });

}

function updateStockAndSale(item_id, remainingQty, total) {
    connection.query('UPDATE products SET stock_quantity = ? , products_sale = products_sale + ? WHERE item_id = ? ', [
        remainingQty, total, item_id
    ], function(err, results, fields) {
        if (err) {
            throw err;
        } else {
            console.log("Updated stock and sale");
        }
    });
}

showItems();
