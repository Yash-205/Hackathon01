// Custom command to clean the database
Cypress.Commands.add("cleanupDB", () => {
  cy.request("POST", "http://127.0.0.1:8080/api/testing/cleanup");
});

// Import commands.js using ES2015 syntax:
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')
