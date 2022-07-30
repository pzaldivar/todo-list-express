const express = require('express') //making it possible to use express in this file
const app = express() //setting a variable and assigning it to the instance of express
const MongoClient = require('mongodb').MongoClient //makes it possible to use methods associated with MongoClient and talk to DB
const PORT = 2121 //setting a constant to determine location where the server will be listening.
require('dotenv').config() //allows looking for variables inside of the .env file


let db, //declare a variable called db but not assign a value
    dbConnectionStr = process.env.DB_STRING, //declaring a variable and assigning database connection string to it
    dbName = 'todo' //declaring a variable and assigning name to the database that will be used

MongoClient.connect(dbConnectionStr, { useUnifiedTopology: true }) //creating a connection to MongoDB and apssing in connection string. Also passing in an additional property
    .then(client => { //waiting for connection, proceeding if successful and passing in all client information.
        console.log(`Connected to ${dbName} Database`) //log to console a template literal "connected to todo Database"
        db = client.db(dbName) //assigning a value to previously declared db variable
    }) //close .then

//middleware    
app.set('view engine', 'ejs') //sets ejs as default render method
app.use(express.static('public')) //sets location for static assets
app.use(express.urlencoded({ extended: true })) //tells express to decode and encode URLs where the header matches the content. Supports arrays and objects
app.use(express.json()) //Parses JSON content from incoming requests


app.get('/', async (request, response) => { //starts GET method when root route is passed in, sets up req and res parameters
    const todoItems = await db.collection('todos').find().toArray() //sets a variable and awaits ALL items from the todos collection
    const itemsLeft = await db.collection('todos').countDocuments({ completed: false }) //sets a variable and awaits a count of uncompleted items to later display in EJS
    response.render('index.ejs', { items: todoItems, left: itemsLeft }) //rendering EJS file and passing through db items and the count remaining inside of an object
    // db.collection('todos').find().toArray()
    // .then(data => {
    //     db.collection('todos').countDocuments({completed: false})
    //     .then(itemsLeft => {
    //         response.render('index.ejs', { items: data, left: itemsLeft })
    //     })
    // })
    // .catch(error => console.error(error))
})

app.post('/addTodo', (request, response) => { //starts a POST method when the add route is passed in
    db.collection('todos').insertOne({ thing: request.body.todoItem, completed: false }) //inserts a new item into todos collection
        .then(result => { //if insert is successful, do something
            console.log('Todo Added') //console log action
            response.redirect('/') //gets rid of /addTodo route and redirects back to homepage
        }) //closing .then
        .catch(error => console.error(error)) //catching errors
}) //ending POST

app.put('/markComplete', (request, response) => { //starts a PUT method when markComplete route is passed in
    db.collection('todos').updateOne({ thing: request.body.itemFromJS }, { //look in db for one item matching name of item passed in from the main.js file that was clicked on
        $set: {
            completed: true //set completed status to true
        }
    }, {
        sort: { _id: -1 }, //moves item to bottom of list
        upsert: false //prevents insertion if item does not already exist
    })
        .then(result => { //starts a then if update was successful
            console.log('Marked Complete') //logging successful completion
            response.json('Marked Complete') //sending a response back to sender
        }) //closing .then
        .catch(error => console.error(error)) //catching errors

}) //ending put

app.put('/markUnComplete', (request, response) => { //starts a PUT method when markUnComplete route is passed in
    db.collection('todos').updateOne({ thing: request.body.itemFromJS }, { //look in db for one item matching name of item passed in from the main.js file that was clicked on
        $set: {
            completed: false //set completed status to false
        }
    }, {
        sort: { _id: -1 }, //moves item to bottom of list
        upsert: false //prevents insertion if item does not already exist
    })
        .then(result => { //starts a then if update was successful
            console.log('Marked Complete') //logging successful completion
            response.json('Marked Complete') //sending a response back to sender
        }) //closing .then
        .catch(error => console.error(error)) //catching errors

}) //ending put

app.delete('/deleteItem', (request, response) => { //starts a delete method when the delete route is passed
    db.collection('todos').deleteOne({ thing: request.body.itemFromJS }) //look inside the todos collection for the ONE item that has a matching name from JS file
        .then(result => { //starts a then if delete was successful
            console.log('Todo Deleted') //logging successful completion
            response.json('Todo Deleted') //sending a response back to the sender
        }) //closing .then
        .catch(error => console.error(error)) //catching errors

}) //ending delete

app.listen(process.env.PORT || PORT, () => { //setting up which PORT will be listened on - either the port from .env file or the port from the previously set variable
    console.log(`Server running on port ${PORT}`) //console log the running port
})// end the listen method