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
            choices: ["View Product Sales by Department", "Create New Department"]
        }]
    ).then(function(answer) {
        switch (answer.what) {
            case "View Product Sales by Department":
                viewSalesByDept();
                break;
            case "Create New Department":
                addDept();
                break;


        }
    });
}

function viewSalesByDept() {
    connection.query('SELECT department_id,department_name, over_head_costs, total_sales as products_sales, (total_sales - over_head_costs) as total_profit FROM departments ',
        function(err, results, fields) {
            if (err) {
                console.log(err);
            } else {
                console.table(results);
            }
        });

}

//create table departments(
//  department_id int(10) auto_increment not null,
//  department_name varchar(50),
//  over_head_costs int(100),
//  total_sales integer(100),
//  primary key(department_id)
// )
function addDept() {
    inquirer.prompt([{
                name: 'department_name',
                type: 'prompt',
                message: 'Enter the name of the department'
            },
            {
                name: 'over_head_costs',
                type: 'prompt',
                message: 'Enter the over_head_costs?',
                validate: function(value) {
                    if (isNaN(value) === false) {
                        return true;
                    }
                    return false;
                }
            }
        ])
        .then(function(answer) {
            connection.query('INSERT INTO departments SET ? ', {
                department_name: answer.department_name,
                over_head_costs: answer.over_head_costs
            }, function(err, results, fields) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("updated the dept table");
                }
            });

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

openDBConnection();
