const express = require('express');
const app = express();
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Serve static files
app.use(express.static('public'));
app.use(express.json()); // for parsing application/json

// 1. Return home.html page to client
router.get('/home', (req, res) => {
  res.sendFile(path.join(__dirname, 'home.html'));
});

// 2. Return all details from user.json file to client as JSON format
router.get('/profile', (req, res) => {
  fs.readFile('user.json', 'utf8', (err, data) => {
      if (err) {
          res.status(500).send({ error: 'Failed to read user.json' });
          return;
      }
      res.json(JSON.parse(data));
  });
});

// 3. Modify /login router
router.get('/login', (req, res) => {
    const { username, password } = req.query;

    fs.readFile('user.json', 'utf8', (err, data) => {
        if (err) {
            res.status(500).send({ error: 'Failed to read user.json' });
            return;
        }

        const users = JSON.parse(data);
        const user = users.find(u => u.username === username);

        if (!user) {
            res.json({
                status: false,
                message: "User Name is invalid"
            });
            return;
        }

        if (user.password !== password) {
            res.json({
                status: false,
                message: "Password is invalid"
            });
            return;
        }

        res.json({
            status: true,
            message: "User Is valid"
        });
    });
});

// 4. Modify /logout route
router.get('/logout', (req, res) => {
  const { username } = req.query;
  res.send(`<b>${username} successfully logged out.</b>`);
});
// Add a new user 
router.post('/addUser', (req, res) => {
    const newUser = req.body;

    fs.readFile('user.json', 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ status: 'error', message: 'Failed to read user.json' });
        }

        let users = JSON.parse(data);

        // Check if users is an array. If not, make it an array.
        if (!Array.isArray(users)) {
            users = [users];
        }

        users.push(newUser);

        fs.writeFile('user.json', JSON.stringify(users, null, 2), (err) => {
            if (err) {
                return res.status(500).json({ status: 'error', message: 'Failed to write to user.json' });
            }

            res.json({ status: 'success', data: newUser });
        });
    });
});

app.use('/', router);

// Middleware for handling 404 errors
app.use((req, res, next) => {
    res.status(404).send('Sorry, page not found!');
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack); // Log the error stack trace to the console
    res.status(500).send('Something went wrong!');
});

const PORT = process.env.port || 8082;
app.listen(PORT, () => {
    console.log('Web Server is listening at port ' + PORT);
});
