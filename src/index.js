// src/index.js

const parseQuery = require('./queryParser');
const readCSV = require('./csvReader');

async function executeSELECTQuery(query) {
    try {
        const { fields, table } = parseQuery(query);
        const data = await readCSV(`${table}.csv`);
        
        // Filter the fields based on the query
        return data.map(row => {
            const filteredRow = {};
            fields.forEach(field => {
                filteredRow[field] = row[field];
            });
            return filteredRow;
        });
    } catch (error) {
        // Handle any errors that occur during query parsing or CSV reading
        console.error('Error executing SELECT query:', error);
        throw error; // Re-throw the error to propagate it to the caller
    }
}

module.exports = executeSELECTQuery;
