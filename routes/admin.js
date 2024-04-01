const jwt = require('jsonwebtoken');
const pool = require('../dbConn');

module.exports = (app) => {
    async function getTotalAPIrequests() {
        let query = `
            SELECT 
                u.user_id,
                SUM(uac.request_count) AS total_request_count
            FROM 
                users u
            JOIN 
                user_api_consumption uac ON u.user_id = uac.user_id
            GROUP BY 
                u.user_id;       
        `;

        try {
            const { rows } = await pool.query(query);
            if (rows.length > 0) {
                return rows;
            } else {
                console.log('No results found');
                return null;
            }
        } catch (error) {
            console.error('Error executing query:', error);
            throw error;
        }
    }

    app.get("/admin", async(req, res) => {
        // Retrieve JWT token from cookie
        const token = req.cookies.jwt;
        let totalRequestsMade = await getTotalAPIrequests();

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

            let query = 'SELECT * FROM users';
            pool.query(query, (error, results) => {
                if (results.rows.length > 0) {
                    res.render("admin", {
                        username: username,
                        users: results.rows,
                        totalRequests: totalRequestsMade
                    });
                }
            });

        } catch (err) {
            console.error(err);
            return res.redirect("/login");
        }
    });
};
