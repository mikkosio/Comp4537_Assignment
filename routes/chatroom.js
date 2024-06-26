const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const pool = require("../dbConn");
const lang = require("../lang/en");
const fetch = require("node-fetch"); // Import the node-fetch library

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
        console.log("Query executed successfully");
        let totalRequests = rows[0].total_request_count;
        return totalRequests;
      } else {
        console.log("No results found");
        return null;
      }
    } catch (error) {
      console.error("Error executing query:", error);
      throw error;
    }
  }

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
        lang: lang,
      });
    } catch (err) {
      console.error(err);
      return res.redirect("/login");
    }
  });

  app.post("/chat", async (req, res) => {
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
      // Extract the user's message from the request body
      const { userMessage, route } = req.body;

      // Make a request to the chatbot server
      const response = await fetch(`https://chatbot-isa-term4-microservice.vercel.app${route}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userMessage }),
      });

      // console.log('response: ', response);

      // Extract the bot's response from the chatbot server's response
      const data = await response.json();
      const botResponse = data.botResponse;

      // increment api consumption if a succesfull call was made to the api
      if (botResponse) {
        let query = `INSERT INTO user_api_consumption (user_id, api_route_id, request_count)
                SELECT 
                    (SELECT user_id FROM users WHERE username = $1) AS user_id,
                    (SELECT api_route_id FROM api_route INNER JOIN endpoint ON api_route.endpoint_id = endpoint.endpoint_id WHERE endpoint.endpoint_path = $2) AS api_route_id,
                    1 AS request_count
                ON CONFLICT (user_id, api_route_id) DO UPDATE SET request_count = user_api_consumption.request_count + 1;                
                `;

        // Execute the query
        pool.query(query, [username, route], (error, results) => {
          if (error) {
            console.error("Error executing query:", error);
            // Handle error
          } else {
            console.log("Query executed successfully");
            // Handle success
          }
        });

        // query was made with the help of gpt 3.5
        let endpointQuery = `INSERT INTO endpoint (endpoint_id, endpoint_path, request_count)
                                    SELECT 
                                    (SELECT endpoint_id FROM endpoint WHERE endpoint_path = $1) AS endpoint_id,
                                    $1 AS endpoint_path,
                                    1 AS request_count
                                    ON CONFLICT (endpoint_id) DO UPDATE SET request_count = endpoint.request_count + 1;`;

        // Execute the query
        pool.query(endpointQuery, [route], (error, results) => {
          if (error) {
            console.error("Error executing query:", error);
            // Handle error
          } else {
            console.log("Query executed successfully");
            // Handle success
          }
        });
      }

      // Send the bot's response back to the client
      res.json({ botResponse });
    } catch (error) {
      console.error("Error:", error);
      res
        .status(500)
        .json({ error: lang.request_error });
    }
  });

  app.use(bodyParser.urlencoded({ extended: true }));
  app.post("/text-input", (req, res) => {
    const token = req.cookies.jwt;
    const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
    const username = decodedToken.username;
    let query = "SELECT * FROM users WHERE username = $1";
    pool.query(query, [username], (error, results) => {
      if (results.rows.length > 0) {
        console.log(results.rows);
      }
    });
  });

  // made with the help of gpt 3.5
  // Route to proxy GET request to external microservice API
  app.get("/getUserHistory", async (req, res) => {
    try {
      // Make a GET request to the external microservice API
      const response = await fetch("https://chatbot-isa-term4-microservice.vercel.app/getUserHistory");

      // Check if the response was successful
      if (!response.ok) {
        throw new Error("Failed to fetch data from external microservice API");
      }

      // Parse the JSON response
      const data = await response.json();

      // Send the data back to the client
      res.json(data);
    } catch (error) {
      // Handle any errors
      console.error("Error:", error.message);
      res.status(500).json({ error: lang.internal_error });
    }
  });

  // made with the help of gpt 3.5
  // Route to proxy GET request to actual chat server to delete user history
app.get("/deleteUserHistory", async (req, res) => {
    try {
        // Make a GET request to the actual chat server to delete user history
        const response = await fetch("https://chatbot-isa-term4-microservice.vercel.app/deleteUserHistory", {
            method: 'DELETE', // Specify the method to DELETE
          });

        // Check if the response was successful
        if (!response.ok) {
            throw new Error("Failed to delete user history on the actual chat server");
        }

        let query = `INSERT INTO endpoint (endpoint_id, endpoint_path, request_count)
                                    SELECT 
                                    (SELECT endpoint_id FROM endpoint WHERE endpoint_path = $1) AS endpoint_id,
                                    $1 AS endpoint_path,
                                    1 AS request_count
                                    ON CONFLICT (endpoint_id) DO UPDATE SET request_count = endpoint.request_count + 1;`;

        // Execute the query
        pool.query(query, ["/deleteUserHistory"], (error, results) => {
            if (error) {
                console.error("Error executing query:", error);
                // Handle error
            } else {
                console.log("Query executed successfully");
                // Handle success
            }
        });

        // Send success response to the client
        res.json({ message: lang.history_deleted });
    } catch (error) {
        // Handle any errors
        console.error("Error:", error.message);
        res.status(500).json({ error: lang.internal_error });
    }
});

  // made with the help of gpt 3.5
  // Route to proxy GET request to external microservice API
  app.get("/downloadUserHistory", async (req, res) => {
    try {
      // Make a GET request to the external microservice API
      const response = await fetch("https://chatbot-isa-term4-microservice.vercel.app/downloadUserHistory");

      // Check if the response was successful
      if (!response.ok) {
        throw new Error("Failed to fetch data from external microservice API");
      }

        let query = `INSERT INTO endpoint (endpoint_id, endpoint_path, request_count)
                                    SELECT 
                                    (SELECT endpoint_id FROM endpoint WHERE endpoint_path = $1) AS endpoint_id,
                                    $1 AS endpoint_path,
                                    1 AS request_count
                                    ON CONFLICT (endpoint_id) DO UPDATE SET request_count = endpoint.request_count + 1;`;

        // Execute the query
        pool.query(query, ["/downloadUserHistory"], (error, results) => {
            if (error) {
                console.error("Error executing query:", error);
                // Handle error
            } else {
                console.log("Query executed successfully");
                // Handle success
            }
        });

      // Get the text data from the response
      const textData = await response.text();

      // Set response headers for file download
      res.setHeader(
        "Content-disposition",
        "attachment; filename=user_history.txt"
      );
      res.setHeader("Content-type", "text/plain");

      // Send the text data back to the client
      res.send(textData);
    } catch (error) {
      // Handle any errors
      console.error("Error:", error.message);
      res.status(500).json({ error: lang.internal_error });
    }
  });
};
