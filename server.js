const express = require("express");
const app = express();
const sql = require("mssql");

const sqlConfig = {
  user: "skole",
  password: "skole2023",
  server: "glemmen.bergersen.dk",
  database: "Daniel_Skyrud",
  port: 4729,
  options: {
    trustServerCertificate: true,
  },
};

async function getParti() {
  try {
    const pool = await sql.connect(sqlConfig);
    const result = await pool.request().query("select * from parti");
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
    const checkQuery = `SELECT COUNT(*) AS count FROM bruker WHERE userUID = '${userUID}'`;
    const checkResult = await pool.request().query(checkQuery);
    const personExists = checkResult.recordset[0].count > 0;

    if (personExists) {
      console.log("Brukeren eksisterer allerede i databasen.");
    } else {
      const request = pool.request();
      request.input("userUID", sql.NVarChar, userUID);
      const result = await request.query(
        "INSERT INTO bruker (userUID) VALUES (@userUID)"
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
    const result = await pool.request().query("select * from bruker");
    console.log(result.recordset);
  } catch (err) {
    console.error(err);
  }
}

async function clearDB() {
  try {
    const pool = await sql.connect(sqlConfig);
    const result = await pool.request().query("delete from bruker");
    console.log(result.recordset);
  } catch (err) {
    console.error(err);
  }
}

async function updateValue(id, userUID) {
  try {
    const pool = await sql.connect(sqlConfig);
    const result = await pool
      .request()
      .input("id", sql.NVarChar, id)
      .query(`UPDATE parti SET stemmer = stemmer + 1 WHERE id = @id`);

    console.log("SQL Query Result:", result);

    if (result.rowsAffected[0] > 0) {
      console.log("Value updated successfully.");
    } else {
      console.log("No rows were updated for the provided ID.");
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
    const pool = await sql.connect(sqlConfig);

    const checkQuery = `SELECT COUNT(*) AS count FROM bruker WHERE userUID = '${userUID}'`;
    const checkResult = await pool.request().query(checkQuery);
    const personExists = checkResult.recordset[0].count > 0;

    if (personExists) {
      return res.status(400).json({
        success: false,
        message: "Brukeren eksisterer i databasen.",
      });
    }
    console.log("Inserting value for partiId:", id);

    const result = await pool
      .request()
      .input("id", sql.NVarChar, id)
      .query(`UPDATE parti SET stemmer = stemmer + 1 WHERE id = @id`);

    console.log("SQL Query Result:", result);

    if (result.rowsAffected[0] > 0) {
      console.log("Value updated successfully for partiId:", id);
      res.json({ success: true });
    } else {
      console.log("No rows were updated for the provided ID:", id);
      res.json({ success: false });
    }
  } catch (error) {
    console.error("Error updating value:", error);
    res.status(500).json({ error: "Feil med henting." });
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
    res.status(500).json({ error: "feil med henting." });
  }
});

app.use(express.static(__dirname + "/public"));
app.use(express.static(__dirname + "/src"));

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/public/index.html");
});
port = 3001;
app.listen(port, async function () {
  console.log(`serveren startet på ${port}`);
  try {
    await getParti();
    await getBruker();
    //clearDB();
  } catch (err) {
    console.error(err);
  }
});
