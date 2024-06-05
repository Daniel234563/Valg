const express = require("express");
const app = express();
const sql = require("mssql");
const path = require("path");

const sqlConfig = {
  user: "skole",
  password: "skole2023",
  server: "glemmen.bergersen.dk",
  database: "Daniel_Eksamen_2",
  port: 4729,
  options: {
    trustServerCertificate: true,
  },
};

async function getParti() {
  try {
    const pool = await sql.connect(sqlConfig);
    const result = await pool.request().query("SELECT * FROM Parti");
    const data = result.recordset;
    console.log(data);
    return data;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

async function setUserUID(userUID) {
  try {
    const pool = await sql.connect(sqlConfig);
    console.log(userUID);
    const checkQuery = `SELECT COUNT(*) AS count FROM bruker WHERE brukerId = '${userUID}'`;
    const checkResult = await pool.request().query(checkQuery);
    const personExists = checkResult.recordset[0].count > 0;

    if (personExists) {
      console.log("Brukeren eksisterer allerede i databasen.");
    } else {
      const request = pool.request();
      request.input("userUID", sql.NVarChar, userUID);
      const result = await request.query(
        "INSERT INTO bruker (brukerId) VALUES (@userUID)"
      );
      console.log("SQL Query Result:", result);
      console.log("Value inserted successfully.");
    }
  } catch (err) {
    console.error("Error inserting userUID:", err);
    throw err;
  }
}

async function getBruker() {
  try {
    const pool = await sql.connect(sqlConfig);
    const result = await pool.request().query("SELECT * FROM bruker");
    console.log(result.recordset);
  } catch (err) {
    console.error(err);
  }
}

async function updateValue(partiId, userUID) {
  try {
    const pool = await sql.connect(sqlConfig);

    // Check if user has already voted
    const checkVoteQuery = `SELECT COUNT(*) AS count FROM Votes WHERE brukerId = '${userUID}' AND partiId = ${partiId}`;
    const checkVoteResult = await pool.request().query(checkVoteQuery);
    const hasVoted = checkVoteResult.recordset[0].count > 0;

    if (hasVoted) {
      console.log("Brukeren har allerede stemt.");
      throw new Error("Brukeren har allerede stemt.");
    }

    // Proceed to update the vote count
    const result = await pool
      .request()
      .input("partiId", sql.Int, partiId)
      .query(
        `UPDATE Stemmer SET AntallStemmer = AntallStemmer + 1 WHERE PartiId = @partiId`
      );
    console.log("SQL Query Result:", result);

    // Register the vote
    await pool
      .request()
      .input("userUID", sql.NVarChar, userUID)
      .input("partiId", sql.Int, partiId)
      .query(
        `INSERT INTO Votes (brukerId, partiId) VALUES (@userUID, @partiId)`
      );

    if (result.rowsAffected[0] > 0) {
      console.log("Value updated successfully.");
    } else {
      console.log("No rows were updated for the provided ID and kommune.");
    }
  } catch (err) {
    console.error("Error updating value:", err);
    throw err;
  }
}

app.get("/setUserUID/:userUID", async (req, res) => {
  try {
    const { userUID } = req.params;
    if (userUID) {
      await setUserUID(userUID);
      res.json({ success: true });
    } else {
      res.status(400).json({ error: "userUID missing." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Feil med henting." });
  }
});

app.post("/updateValue/:id/:userUID", async (req, res) => {
  try {
    const { id, userUID } = req.params;

    await updateValue(id, userUID);
    res.json({ success: true });
  } catch (error) {
    console.error("Error updating value:", error);
    res.status(500).json({ error: "Feil med oppdatering." });
  }
});

app.get("/charts", function (req, res) {
  res.sendFile(__dirname + "/public/html/charts.html");
});

app.get("/auth", function (req, res) {
  res.sendFile(__dirname + "/public/html/autentifiseing.html");
});

app.get("/chartJs", function (req, res) {
  res.sendFile(__dirname + "/src/charts.js");
});

app.get("/getparti", async (req, res) => {
  try {
    const data = await getParti();
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Feil med henting." });
  }
});

app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "src")));

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/public/index.html");
});

const port = 3001;
app.listen(port, async function () {
  console.log(`Serveren startet på port ${port}`);
  try {
    await getParti();
    await getBruker();
  } catch (err) {
    console.error(err);
  }
});
