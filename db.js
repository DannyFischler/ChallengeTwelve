const mysql = require('mysql2/promise');

const connectionConfig = {
    host: 'localhost',
    user: 'root',
    password: 'Ladybug45891',
    database: 'employee_db'
};

let connection;

async function initDB() {
    connection = await mysql.createConnection(connectionConfig);
}

async function queryDB(sql, params) {
    if (!connection) {
        await initDB();
    }
    return await connection.query(sql, params);
}

async function closeDB() {
    if (connection) {
        await connection.end();
    }
}

module.exports = {
    queryDB,
    closeDB
};
