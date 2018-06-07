var mysql = require("mysql");
var inquirer = require("inquirer");

// create the connection information for the sql database
var connection = mysql.createConnection({
  host: "localhost",
  port: 8889,

  // Your username
  user: "root",

  // Your password
  password: "root",
  database: "bamazon_DB"
});

// connect to the mysql server and sql database
connection.connect(function(err) {
  if (err) throw err;
  // run the start function after the connection is made to prompt the user
  start();
});

// function which prompts the user for what action they should take
function start() {
    // display items 
    displayProducts();
    // begin order function 
    orderItems();
}

function orderItems() { 
  // query the database for all items
  connection.query("SELECT * FROM products", function(err, results) {
    if (err) throw err;
    //once you have the items, prompt the user for which they'd like to order
    inquirer
      .prompt([
        {
          name: "choice",
          type: "input",
          message: "Which item # would you like to purchase?"
        },
        {
          name: "qty",
          type: "input",
          message: "How many would you like?"
        }
      ])
      .then(function(answer) {
        // get the information of the chosen item
        var chosenItem;
        console.log(answer.choice);
        for (var i = 0; i < results.length; i++) {
            console.log(results[i].item_id);
            if (results[i].item_id == answer.choice) {
              chosenItem = results[i];
              console.log("got here");
            }
        }
        console.log(chosenItem+" yo!");
        //console.log(results);
        // determine if 
        if (chosenItem.stock_quantity > parseInt(answer.qty)) {
          // we have qty on hand to place order
          connection.query(
            "UPDATE products SET ? WHERE ?",
            [
              {
                stock_quantity: answer.qty
              },
              {
                item_id: chosenItem.item_id
              }
            ],
            function(error) {
              if (error) throw err;
              console.log("Your purchase has been made. Thank you!");
              start();
            }
          );
        }
        else {
          // bid wasn't high enough, so apologize and start over
          console.log("Your bid was too low. Try again...");
          start();
        }
      });
  });
}

function displayProducts() {
    console.log("Selecting all products...\n");
    connection.query("SELECT * FROM products WHERE stock_quantity >= 0", function(err, res) {
      if (err) throw err;
      // Log all results of the SELECT statement
      console.log("Item#      "+"Qty     "+"Product Name");
      for (var i = 0; i < res.length; i++) {
        console.log("-----------"+"--------"+"---------------------------------------------");
        console.log(res[i].item_id+"       ",res[i].stock_quantity+"     ",res[i].product_name);
        console.log("");
      }
      // end connection
      connection.end();
    });
  }
  