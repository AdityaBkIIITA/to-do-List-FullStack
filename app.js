//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect('mongodb+srv://admin-AdityaBwk:Aditya1304@cluster0.rslblht.mongodb.net/todoListDB', {
  useNewUrlParser: true
});

const itemSchema = {
  name: String
};

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "Welcome to-do-List"
});

const item2 = new Item({
  name: "Hit the + button to add new Item"
});

const item3 = new Item({
  name: "<--Hit this to delete this Item"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err) {
        if (!err) {
          console.log("Successfully Inserted Items!");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {
        listTitle: "Today",
        newListItems: foundItems
      });
    }

  });
});

app.get("/:customListName", function(req, res) {

  var listName = _.capitalize(req.params.customListName);

  List.findOne({
    name: listName
  }, function(err, foundList) {
    if (!err) {
      if (!foundList) {
        const list = new List({
          name: listName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + listName);
      } else {
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items
        });

      }
    }

  });
});

app.post("/", function(req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({
      name: listName
    }, function(err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);

    });
  }
});

app.get("/about", function(req, res) {
  res.render("about");
});

app.post("/delete", function(req, res) {

  var itemId = req.body.checkbox;
  var listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(itemId, function(err) {
      if (!err) {
        console.log("Successfully Deleted");

        res.redirect("/");
      }

    });
  } else{
    List.findOneAndUpdate({name: listName},{$pull : {items: {_id: itemId}}},function(err,foundList){
      res.redirect("/" + listName);

    });
  }
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port);

app.listen(port || 3000, function() {
  console.log("Server has started successfully");
});
