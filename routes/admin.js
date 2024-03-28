const jwt = require('jsonwebtoken');

module.exports = (app) => {
    app.get("/admin", (req, res) => {
        // Retrieve JWT token from cookie
        const token = req.cookies.jwt;

        // If token is not present, redirect to login
        if (!token) {
            console.error("No token found for admin access");
            return res.redirect("/login");
        }
        try {
            // Verify and decode JWT token
            const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
            // Access the username from the decoded token
            const username = decodedToken.username;
            const admin = decodedToken.admin;

            // Check if the username is "test"
            if (!admin) {
                console.error("Unauthorized access - username is not 'test'");
                return res.redirect("/dashboard");
            }

            res.render("admin", {
                username: username,
            });
        } catch (err) {
            console.error(err);
            return res.redirect("/login");
        }
    });
};
