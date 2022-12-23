const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();
const convertMovieObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

const convertDirectorObjectToResponseObject = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

app.get("/movies/", async (request, response) => {
  const MovieNamesQuery = `
      SELECT movie_name FROM movie;
      
      `;
  const movieNamesList = await db.all(MovieNamesQuery);
  const movieArray = [];
  for (let name in movieNamesList) {
    const result = convertMovieObjectToResponseObject(movieNamesList[name]);
    movieArray.push(result);
  }
  response.send(movieArray);
});

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovie = `
  SELECT * FROM movie WHERE movie_id =${movieId};`;
  const dbResponse = await db.all(getMovie);
  const output = convertMovieObjectToResponseObject(dbResponse[0]);
  response.send(output);
  //   console.log(dbResponse);
});

//api to create movie
app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const addMovieQuery = `
  INSERT INTO movie(director_id,movie_name,lead_actor)
  VALUES
  (
      ${directorId},
      '${movieName}',
      '${leadActor}'
  );`;
  const dbResponse = await db.run(addMovieQuery);
  const result = dbResponse.lastID;
  response.send("Movie Successfully Added");
});

//update movie API

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const updateMovie = `
  UPDATE movie 
  SET
  director_id=${directorId},
  movie_name='${movieName}',
  lead_actor='${leadActor}'
  WHERE
  movie_id=${movieId};
  `;
  await db.run(updateMovie);
  response.send("Movie Details Updated");
});

//DELETE API

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteQuery = `
    DELETE FROM movie
    WHERE 
    movie_id=${movieId};`;
  await db.run(deleteQuery);
  response.send("Movie Removed");
});

//GET ALL DIRECTORS API
app.get("/directors/", async (request, response) => {
  const getDirectorQuery = `
    SELECT * FROM director;
    `;
  const dbResponse = await db.all(getDirectorQuery);
  let directorArray = [];
  for (let each of dbResponse) {
    const result = convertDirectorObjectToResponseObject(each);
    directorArray.push(result);
  }
  response.send(directorArray);
});

//GET API7
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;

  const getDirectorMovieQuery = `
    SELECT movie_name FROM movie 
    WHERE director_id = ${directorId};`;
  const dbResponse = await db.all(getDirectorMovieQuery);
  let newArray = [];
  for (let eachItem of dbResponse) {
    const result = convertMovieObjectToResponseObject(eachItem);
    newArray.push(result);
  }
  response.send(newArray);
});
module.imports = app;
