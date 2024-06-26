const pool = require("../dbConn");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const lang = require('../lang/en');

module.exports = (app) => {
  app.use(bodyParser.urlencoded({ extended: true }));

  app.get("/profile", async (req, res) => {
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
      if (!username) {
        console.error("No username found in JWT token");
        return res.redirect("/login");
      }
      const client = await pool.connect();
      let query = "SELECT * FROM users WHERE username = $1";
      try {
        const result = await client.query(query, [username]);
        if (result.rows.length > 0) {
          const email = result.rows[0].email;
          return res.render("profile", {
            username: username,
            email: email,
          });
        } else {
          console.error("No user found with this username in the database");
          return res.redirect("/login");
        }
      } catch (err) {
        console.error("Error fetching user details:", err);
        return res.redirect("/profile");
      }
    } catch (err) {
      console.error(err);
      return res.redirect("/login");
    }
  });

  app.patch("/profile", async (req, res) => {
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

      // Retrieve form data
      const form_username = req.body.username;
      const form_email = req.body.email;

      if (!form_email || !form_username) {
        return res.json({ message: lang.username_email_required });
      }

      // check if user already exists
      const client = await pool.connect();
      try {
        let query = "SELECT * FROM users WHERE username = $1";
        let result = await client.query(query, [username]);
        let isAdmin = false;
        if (result.rows.length === 1) {
          const user_id = result.rows[0].user_id;
          if (result.rows[0].role_id === 2) {
            isAdmin = true;
          }
          //Making sure the new username and email are not used by another user
          let query =
            "SELECT * FROM users WHERE (username = $1 OR email = $2) AND user_id != $3";
          result = await client.query(query, [
            form_username,
            form_email,
            user_id,
          ]);
          if (result.rows.length > 0) {
            return res.json({ message: lang.username_email_in_use });
          } else {
            try {
              let query =
                "UPDATE users SET username = $1, email = $2 WHERE user_id = $3";
              await client.query(query, [form_username, form_email, user_id]);

              //Delete the cookie and create a new one with updated username
              res.clearCookie("jwt");

              const token = jwt.sign(
                { username: form_username, admin: isAdmin },
                process.env.SECRET_KEY,
                { expiresIn: "1h" }
              );
              res.cookie("jwt", token, {
                httpOnly: true,
                secure: true,
                maxAge: 60 * 60 * 1000,
              });
              console.log("Replaced cookie with updated username.");
              res.json({
                message: lang.profile_updated,
                success: true,
              });
            } catch (err) {
              console.error(err);
              return res.json({ message: lang.failed_update_profile });
            }

            let query = `INSERT INTO endpoint (endpoint_id, endpoint_path, request_count)
                                    SELECT 
                                    (SELECT endpoint_id FROM endpoint WHERE endpoint_path = $1) AS endpoint_id,
                                    $1 AS endpoint_path,
                                    1 AS request_count
                                    ON CONFLICT (endpoint_id) DO UPDATE SET request_count = endpoint.request_count + 1;`;

            // Execute the query
            pool.query(query, ["/profile"], (error, results) => {
              if (error) {
                console.error("Error executing query:", error);
                // Handle error
              } else {
                console.log("Query executed successfully");
                // Handle success
              }
            });
          }
        } else if (result.rows.length > 1) {
          return res.json({
            message: lang.duplicated_username,
          });
        } else {
          return res.json({ message: lang.no_user_found });
        }
      } catch (err) {
        console.error(err);
        res.json({ message: lang.general_error_msg_profile });
      } finally {
        client.release();
      }
    } catch (err) {
      console.error(err);
      return res.redirect("/login");
    }
  });
};
