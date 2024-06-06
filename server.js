const express = require("express");
const app = express();
const sql = require("mssql");
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");

app.use(bodyParser.json());
app.use(express.urlencoded());

async function createHash() {
  try {
    const pw = "";
    const hashedPw = await bcrypt.hash(pw, 13);
    const pool = await sql.connect(sqlConfig);
    const request = pool.request();
    request.input("hashedPw", sql.NVarChar, hashedPw);
    const result = await request.query(
      "INSERT INTO Passord (hash) VALUES (@hashedPw)"
    );
    console.log(result);
    console.log(hashedPw);
  } catch (err) {
    console.log(err);
  }
}

async function getKommuneStemmer() {
  try {
    const pool = await sql.connect(sqlConfig);
    const result = await pool
      .request()
      .query(
        "SELECT Parti.PartiNavn, StemmerPerKommune.AntallStemmer, StemmerPerKommune.KommuneID, Parti.PartiId, Kommuner.KommuneNavn FROM StemmerPerKommune INNER JOIN Kommuner ON Kommuner.KommuneID = StemmerPerKommune.KommuneID INNER JOIN Parti ON Parti.PartiId = StemmerPerKommune.PartiId;"
      );
    console.log(result.recordset);
  } catch (err) {
    console.error(err);
  }
}

app.post("/ValgtKommune", async (req, res) => {
  try {
    const { KommuneID } = req.body.KommuneID;
    const pool = await sql.connect(sqlConfig);
    const result = await pool
      .request()
      .input("KommuneID", sql.Int, KommuneID)
      .query(
        "SELECT StemmerPerKommune.AntallStemmer from StemmerPerKommune where KommuneID = @KommuneID"
      );
    console.log(result.recordset);
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
  }
});

app.post("/signIn", async (req, res) => {
  try {
    const { passord } = req.body;
    const pool = await sql.connect(sqlConfig);
    const result = await pool.request().query("SELECT hash FROM Passord");

    const storedHash = result.recordset[0].hash;

    // Sammenlign det hasjede passordet med lagret hash
    const isCorrectPassword = await bcrypt.compare(passord, storedHash);

    if (!isCorrectPassword) {
      return res.status(401).json({ message: "Feil passord" });
    } else {
      return res.status(200).json({ message: "Korrekt passord" });
    }
  } catch (err) {
    console.error("Error checking password:", err);
    res.status(500).json({ error: "Error checking password" });
  }
});

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

// HTML/JS-ruter
app.get("/charts", function (req, res) {
  res.sendFile(__dirname + "/public/html/charts.html");
});

app.get("/auth", function (req, res) {
  res.sendFile(__dirname + "/public/html/autentifiseing.html");
});

app.get("/webform", function (req, res) {
  res.sendFile(__dirname + "/public/html/webform.html");
});

app.get("/chartJs", function (req, res) {
  res.sendFile(__dirname + "/src/charts.js");
});

async function getData() {
  try {
    const pool = await sql.connect(sqlConfig);
    const result = await pool
      .request()
      .query(
        "SELECT Parti.PartiNavn, StemmerPerKommune.AntallStemmer, StemmerPerKommune.KommuneID, Parti.PartiId, Kommuner.KommuneNavn FROM StemmerPerKommune INNER JOIN Kommuner ON Kommuner.KommuneID = StemmerPerKommune.KommuneID INNER JOIN Parti ON Parti.PartiId = StemmerPerKommune.PartiId"
      );
    const data = result.recordset;
    console.log(data);
    return data;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

async function changeInfo(updatedData) {
  try {
    const pool = await sql.connect(sqlConfig);
    for (const data of updatedData) {
      await pool
        .request()
        .input("KontaktAdresse", sql.VarChar, data.KontaktAdresse)
        .input("PostNummer", sql.VarChar, data.PostNummer)
        .input("Epost", sql.VarChar, data.Epost)
        .input("PartiId", sql.Int, data.PartiId)
        .query(
          "UPDATE Parti SET KontaktAdresse = @KontaktAdresse, PostNummer = @PostNummer, Epost = @Epost WHERE PartiId = @PartiId;"
        );
    }
    console.log("Update successful");
  } catch (err) {
    console.error("Error updating info:", err);
    throw err;
  }
}

app.post("/changeInfo", async (req, res) => {
  const updatedData = req.body;
  try {
    await changeInfo(updatedData);
    res.status(200).send("Info updated successfully");
  } catch (err) {
    res.status(500).send("Error updating info");
  }
});
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
    const result = await pool.request().query("select * from bruker");
    console.log(result.recordset);
  } catch (err) {
    console.error(err);
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

    const checkQuery = `SELECT COUNT(*) AS count FROM bruker WHERE brukerId = '${userUID}'`;
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
      .query(
        `UPDATE Stemmer SET AntallStemmer = AntallStemmer + 1 WHERE PartiId = @id`
      );

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

app.get("/getParti", async (req, res) => {
  try {
    const data = await getData();
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "feil med henting." });
  }
});

app.use(express.static(__dirname + "/public"));
app.use(express.static(__dirname + "/src"));

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/public/html/index.html");
});
port = 3000;
app.listen(port, async function () {
  console.log(`serveren startet på ${port}`);
  try {
    await getData();
    await getBruker();
  } catch (err) {
    console.error(err);
  }
});
