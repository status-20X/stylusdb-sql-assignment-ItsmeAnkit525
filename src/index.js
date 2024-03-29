// src/index.js

const parseQuery = require('./queryParser');
const readCSV = require('./csvReader');
const fs = require('fs').promises;

function evaluateCondition(row, clause) {
    const { field, operator, value } = clause;
    switch (operator) {
        case '=': return row[field] === value;
        case '!=': return row[field] !== value;
        case '>': return row[field] > value;
        case '<': return row[field] < value;
        case '>=': return row[field] >= value;
        case '<=': return row[field] <= value;
        default: throw new Error(`Unsupported operator: ${operator}`);
    }
}

async function executeSELECTQuery(query) {
    try {
        const { fields, table, whereClauses } = parseQuery(query);
        
        // Check if the CSV file exists
        try {
            await fs.access(`${table}.csv`);
        } catch (error) {
            throw new Error(`Table not found: ${table}`);
        }

        const data = await readCSV(`${table}.csv`);

        // Apply WHERE clause filtering
        const filteredData = whereClauses.length > 0
            ? data.filter(row => whereClauses.every(clause => evaluateCondition(row,clause)))
            : data;

        // Select the specified fields
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

