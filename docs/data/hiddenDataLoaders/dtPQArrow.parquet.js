import axios from 'axios';
import csv from 'csv-parser';
import * as Arrow from "apache-arrow";

async function loadCSVToArrow(csvUrl) {
  const rows = [];

  const response = await axios.get(csvUrl);
  const csvData = response.data;

  return new Promise((resolve, reject) => {
    const stream = csv({ headers: true })
      .on('data', (data) => {
        // Process each row of the CSV file
        rows.push(data);
      })
      .on('end', () => {
        // Convert rows to Arrow Table
        const table = Arrow.Table.from(rows);

        // Convert Arrow Table to array of objects
        const array = table.toArray();

        console.log('CSV file loaded and converted to Arrow successfully!');
        resolve(array);
      })
      .on('error', (error) => {
        console.error('Error occurred while loading CSV file:', error);
        reject(error);
      });

    stream.write(csvData);
    stream.end();
  });
}

// Usage example
const csvUrl = "../data/dt.csv";

console.log('Loading and converting CSV file to Arrow...');

loadCSVToArrow(csvUrl)
  .then(array => {
    // Now you can use the array as needed
    console.log(array);
    // Convert the array to a string before writing it to stdout
    process.stdout.write(JSON.stringify(array));
  })
  .catch(error => {
    console.error('Error occurred while loading and converting CSV file:', error);
  });