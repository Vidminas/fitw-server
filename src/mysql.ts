/**
 * This file is used if the backend database is a MySQL DB
 * Not in use when MongoDB (default) is used instead
 */
const debug = require("debug")("fitw-server:mysql");
import mysql from "mysql";

export const queryDB = (query: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    const connection = mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
    });

    connection.connect((error) => {
      if (error) {
        reject(error);
      }
      debug(`Connected to MySQL database at ${process.env.DB_HOST}`);

      debug(`Querying database with: ${query}`);
      connection.query(query, (error, result, fields) => {
        if (error) {
          reject(error);
        }

        debug(`Received response: ${result}`);
        connection.end((error) => {
          if (error) {
            reject(error);
          }
          debug("Disconnected from database");
        });

        resolve(result);
      });
    });
  });
};

export const initializeDB = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    debug(`Initialising database`);
    const connection = mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });

    connection.connect((error) => {
      if (error) {
        reject(error);
      }

      const qCreateDB = `CREATE DATABASE IF NOT EXISTS ${process.env.DB_DATABASE}`;
      connection.query(qCreateDB, (error, _result, _fields) => {
        if (error) {
          reject(error);
        }
        debug(`Ensured database ${process.env.DB_DATABASE} exists`);
      });

      connection.end((error) => {
        if (error) {
          reject(error);
        }
        debug("Ensuring table USERS exists");
        queryDB(`CREATE TABLE IF NOT EXISTS USERS(
          id INT PRIMARY KEY AUTO_INCREMENT,
          name VARCHAR(255) NOT NULL
        )`)
          .then(() => {
            debug("Database initialised");
            resolve();
          })
          .catch((error) => {
            reject(error);
          });
      });
    });
  });
};
