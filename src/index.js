// src/index.js

const parseQuery = require('./queryParser');
const readCSV = require('./csvReader');
const fs = require('fs').promises; // Import the 'promises' API of the 'fs' module

async function executeSELECTQuery(query) {
    try {
        const { fields, table, whereClause } = parseQuery(query);

        // Check if the CSV file exists
        try {
            await fs.access(`${table}.csv`);
        } catch (error) {
            throw new Error(`Table not found: ${table}`);
        }

        // Check if the WHERE clause is incomplete
        if (whereClause && whereClause.trim().toLowerCase() === 'where') {
            throw new Error('Invalid WHERE clause: missing condition');
        }

        const data = await readCSV(`${table}.csv`);

        // Filtering based on WHERE clause
        const filteredData = whereClause
            ? data.filter(row => {
                const [field, value] = whereClause.split('=').map(s => s.trim().toLowerCase());
                return row[field.toLowerCase()] === value;
            })
            : data;

        // Selecting the specified fields
        return filteredData.map(row => {
            const selectedRow = {};
            fields.forEach(field => {
                selectedRow[field] = row[field];
            });
            return selectedRow;
        });
    } catch (error) {
        // Handle any errors that occur during query execution
        console.error('Error executing SELECT query:', error);
        throw error; // Re-throw the error to propagate it to the caller
    }
}

module.exports = executeSELECTQuery;
