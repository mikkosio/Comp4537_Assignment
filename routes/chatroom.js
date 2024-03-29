const jwt = require('jsonwebtoken');

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
};