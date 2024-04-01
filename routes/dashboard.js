const jwt = require("jsonwebtoken");
const pool = require("../dbConn");

module.exports = (app) => {
  async function getTotalAPIrequests(username) {
    let query = `SELECT 
            u.user_id,
            SUM(uac.request_count) AS total_request_count
        FROM 
            users u
        JOIN 
            user_api_consumption uac ON u.user_id = uac.user_id
        WHERE 
            u.username = $1
        GROUP BY 
            u.user_id;       
                `;

    try {
      const { rows } = await pool.query(query, [username]);
      if (rows.length > 0) {
          console.log('Query executed successfully');
          let totalRequests = rows[0].total_request_count;
          return totalRequests;
      } else {
          console.log('No results found');
          return null;
      }
    } catch (error) {
        console.error('Error executing query:', error);
        throw error;
    }
  }

  app.get("/dashboard", async (req, res) => {
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

      // try to get the total requests made by the user
      let totalRequestsMade = await getTotalAPIrequests(username);

      console.log(totalRequestsMade);

      res.render("dashboard", {
        username: username,
        totalRequests: totalRequestsMade,
      });
    } catch (err) {
      console.error(err);
      return res.redirect("/login");
    }
  });
};
