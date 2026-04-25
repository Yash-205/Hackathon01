describe('Document Upload and RAG Flow', () => {
  beforeEach(() => {
    // Simulate being logged in
    cy.window().then((win) => {
      win.localStorage.setItem('auth_token', 'fake-token');
    });

    // Mock threads API to prevent 401 Unauthorized errors
    cy.intercept('GET', '/api/threads', {
      statusCode: 200,
      body: []
    }).as('getThreads');

    cy.intercept('POST', '/api/threads', {
      statusCode: 200,
      body: { message: 'Thread saved' }
    }).as('postThreads');

    // Mock the document upload endpoint so we don't actually hit Qdrant Cloud in the UI test
    cy.intercept('POST', '/api/documents/upload', {
      statusCode: 200,
      body: {
        id: 'doc-123',
        filename: 'biology_notes.pdf',
        format: 'pdf',
        page_count: 5
      }
    }).as('uploadDoc');

    // Mock the chat endpoint to simulate a RAG-based response
    cy.intercept('POST', '/api/chat', {
      statusCode: 200,
      body: {
        id: 'test-thread-id',
        content: 'Based on your uploaded document "biology_notes.pdf", the light-dependent reactions occur in the thylakoid membrane.'
      }
    }).as('postChat');

    cy.visit('/');
  });

  it('should allow a user to upload a document and ask a question about it', () => {
    // 1. Simulate file upload (assuming you have an input type="file")
    // Note: If the actual file input is hidden, use { force: true }
    cy.get('input[type="file"]').selectFile({
      contents: Cypress.Buffer.from('Fake PDF content'),
      fileName: 'biology_notes.pdf',
      mimeType: 'application/pdf',
    }, { force: true });

    // 2. Wait for the upload mock to finish
    cy.wait('@uploadDoc');

    // 3. Verify the UI reflects the uploaded file (adjust selector based on your UI)
    // cy.contains('biology_notes.pdf').should('be.visible');

    // 4. Send a chat message asking about the document
    cy.get('#chat-message-input').type('Where do light dependent reactions occur?{enter}');

    // 5. Wait for the mocked LLM response
    cy.wait('@postChat');

    // 6. Assert the mocked RAG response appears in the chat
    cy.get('[data-testid="message-bubble"]')
      .last()
      .should('contain.text', 'Based on your uploaded document');
  });
});
