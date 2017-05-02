// List a set of menu options:
//
// View Products for Sale
// View Low Inventory
// Add to Inventory
// Add New Product

var inquirer = require('inquirer');
var table = require('console.table');
var mysql = require("mysql");

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'manwa4me',
    database: 'bamazon'
});



function showOptions() {
    inquirer.prompt(
        [{
            name: "what",
            type: "list",
            message: "Please select the task?",
            choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product"]
        }]
    ).then(function(answer) {
        switch (answer.what) {
            case "View Products for Sale":
                displayItems();
                break;
            case "View Low Inventory":
                viewLowInventory();
                break;
            case "Add to Inventory":
                displayItems();
                addMoreStock();
                break;
            case "Add New Product":
                addProduct();
                break;

        }
    });
}

function openDBConnection() {
    connection.connect(function(err) {
        if (err) {
            throw err;
        } else {
            console.log("Successfully connected to bamazon db");
            showOptions();

        }
    });
}

//If a manager selects View Products for Sale, the app should list every available item: the item IDs, names, prices, and quantities.
function displayItems() {
    connection.query('SELECT item_id, product_name, stock_quantity,price from products ', function(err, results, fields) {
        if (err) {
            console.log(err);
        } else {
            console.table(results);
        }
    });
}

// If a manager selects View Low Inventory, then it should list all items with a inventory count lower than five.
function viewLowInventory() {
    connection.query('SELECT item_id, product_name, stock_quantity,price from products where stock_quantity < 5', function(err, results, fields) {
        if (err) {
            console.log(err);
        } else {
            if (results.length == 0) {
                console.log("Inventory sufficient");
            } else {
                console.table(results);

            }
        }
    });
}

// If a manager selects Add to Inventory, your app should display a prompt that will let the manager "add more" of any item currently in the store.
function addMoreStock() {
    inquirer.prompt([{
                name: 'item_id',
                type: 'prompt',
                message: 'Enter the Product ID'
            },
            {
                name: 'units',
                type: 'prompt',
                message: 'How many units would you like to add?',
                validate: function(value) {
                    if (isNaN(value) === false) {
                        return true;
                    }
                    return false;
                }
            }
        ])
        .then(function(answer) {

            updateStock(answer);
            // return database.addInventory(answer.stock, answer.units)
            // .then(function(answer)
        });

}

function updateStock(answer) {
    connection.query('SELECT  stock_quantity  from products where item_id = ?', [answer.item_id], function(err, results, fields) {
        if (err) {
            console.log(err);
        } else {
            if (results.length == 0) {
                console.log("Invalid product id specified");
            } else {
                var updatedQty = results[0].stock_quantity + parseInt(answer.units);
                connection.query('UPDATE products SET ? WHERE ? ', [{
                    stock_quantity: updatedQty
                }, {
                    item_id: answer.item_id
                }], function(err, results, fields) {
                    if (err) {
                        throw err;
                    } else {
                        console.log("Successfully updated the stock!");
                    }
                });
            }
        }
    });
}

function addProduct() {
    inquirer.prompt([{
                name: 'name',
                type: 'prompt',
                message: 'Enter the Product Name'
            },
            {
                name: 'department_name',
                type: 'prompt',
                message: 'Enter the Department Name'
            }, {
                name: 'price',
                type: 'prompt',
                message: 'Enter the Price'
            }, {
                name: 'units',
                type: 'prompt',
                message: 'How many units would you like to add?',
                validate: function(value) {
                    if (isNaN(value) === false) {
                        return true;
                    }
                    return false;
                }
            }
        ])
        .then(function(answer) {
            var item = {
                product_name: answer.name,
                department_name: answer.department_name,
                price: answer.price,
                stock_quantity: answer.units
            }
            insert(item);
            // return database.addInventory(answer.stock, answer.units)
            // .then(function(answer)
        });
}

function insert(item) {
    connection.query('INSERT INTO products SET ? ', item, function(err, results) {
        if (err) {
            throw err;
        } else {
            console.log("Successfully inserted the item!");
            console.log("Updated table!");
            console.log("===================================");

            displayItems();
        }
    });
}
openDBConnection();
