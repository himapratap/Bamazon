//
// Populate this database with around 10 different products. (i.e. Insert "mock" data rows into this database and table).
//
// Then create a Node application called bamazonCustomer.js. Running this application will first display all of the items available for sale. Include the ids, names, and prices of products for sale.
//
// The app should then prompt users with two messages.
//

// Once the customer has placed the order, your application should check if your store has enough of the product to meet the customer's request.
//
// If not, the app should log a phrase like Insufficient quantity!, and then prevent the order from going through.
// However, if your store does have enough of the product, you should fulfill the customer's order.
//
// This means updating the SQL database to reflect the remaining quantity.
// Once the update goes through, show the customer the total cost of their purchase.



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
                updateStock(answer.item_id, remainingQty);
                var total = answer.quantity * results[0].price;
                console.log("Your Total is:" + total + "$");

            } else {
                console.log("Sorry, Insufficient quantity");
                // do you wish to continue

            }
            connection.end();

        });
    });


}

function updateStock(item_id, remainingQty) {
    connection.query('UPDATE products SET ? WHERE ? ', [{
        stock_quantity: remainingQty
    }, {
        item_id: item_id
    }], function(err, results, fields) {
        if (err) {
            throw err;
        }
    });
}

showItems();
//connection.end();
