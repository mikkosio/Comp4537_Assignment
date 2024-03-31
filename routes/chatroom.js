const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const pool = require('../dbConn');

module.exports = (app) => {
    app.get("/chatroom", (req, res) => {
        // Retrieve JWT token from cookie
        const token = req.cookies.jwt;

        // If token is not present, redirect to login
        if (!token) {
            console.error("No token found for this user");
            return res.redirect("/login");
        }
        try {
            // Verify and decode JWT token
            const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
            // Access the username from the decoded token
            const username = decodedToken.username;
            res.render("chatroom", {
                username: username,
            });
        } catch (err) {
            console.error(err);
            return res.redirect("/login");
        }
    });

    app.post("/chat", async (req, res) => {
        try {
            console.log('triggered');
            // Extract the user's message from the request body
            const { userMessage, route } = req.body;

            console.log(userMessage, route);
    
            // Make a request to the chatbot server
            const response = await fetch(`https://chatbot-isa-term4-microservice.vercel.app${route}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userMessage })
            });

            console.log(response);
    
            // Extract the bot's response from the chatbot server's response
            const data = await response.json();
            const botResponse = data.botResponse;
    
            // Send the bot's response back to the client
            res.json({ botResponse });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'An error occurred while processing the request.' });
        }
    });

    app.use(bodyParser.urlencoded({ extended: true }));
    app.post('/text-input', (req, res) => {
        const token = req.cookies.jwt;
        const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
        const username = decodedToken.username;
        let query = 'SELECT * FROM users WHERE username = $1';
        pool.query(query, [username], (error, results) => {
            if (results.rows.length > 0) {
                console.log(results.rows);
            }
        });
    });
};