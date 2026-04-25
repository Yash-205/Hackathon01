describe('Chat Interface', () => {
  beforeEach(() => {
    // Intercept API calls
    cy.intercept('GET', '/api/threads', {
      statusCode: 200,
      body: []
    }).as('getThreads');

    cy.intercept('POST', '/api/chat', {
      statusCode: 200,
      body: {
        id: 'test-thread-id',
        content: 'Quantum physics is a fundamental theory in physics that provides a description of the physical properties of nature at the scale of atoms and subatomic particles. It is the foundation of all quantum physics including quantum chemistry, quantum field theory, quantum technology, and quantum information science.'
      }
    }).as('postChat');

    cy.intercept('POST', '/api/documents/upload', {
      statusCode: 200,
      body: { message: 'Upload successful' }
    }).as('uploadDoc');

    cy.intercept('POST', '/api/threads', {
      statusCode: 200,
      body: { message: 'Thread saved' }
    }).as('postThreads');

    cy.intercept('POST', '/api/mindmap', {
      statusCode: 200,
      body: {
        central_topic: "Quantum Physics",
        nodes: [
          {
            id: "1",
            label: "Wave-Particle Duality",
            detail: "The concept that every elementary particle or quantic entity may be partly described in terms not only of particles, but also of waves.",
            color: "#A78BFA",
            children: []
          },
          {
            id: "2",
            label: "Schrödinger's Cat",
            detail: "A thought experiment that illustrates a paradox of quantum superposition.",
            color: "#A78BFA",
            children: []
          }
        ]
      }
    }).as('postMindmap');

    // Simulate being logged in
    cy.window().then((win) => {
      win.localStorage.setItem('auth_token', 'fake-token');
    });

    cy.visit('/');
  });

  it('should send a message and display the response', () => {
    const userMessage = 'Hello assistant!';
    
    cy.get('#chat-message-input').type(userMessage);
    cy.get('[data-testid="chat-input-button"]').click();

    // Check if user message is displayed
    cy.get('[data-testid="message-bubble"]').contains(userMessage).should('be.visible');

    // Wait for AI response
    cy.wait('@postChat');
    
    // Check if AI response is displayed
    cy.get('[data-testid="message-bubble"]').contains('Quantum physics is a fundamental theory').should('be.visible');
  });

  it('should trigger mind map generation', () => {
    const userMessage = 'Explain quantum physics';
    
    cy.get('#chat-message-input').type(userMessage);
    cy.get('[data-testid="chat-input-button"]').click();

    cy.wait('@postChat');

    // Look for the "Mind Map" button in the assistant message
    cy.get('[data-testid="generate-mindmap-button"]').click();

    cy.wait('@postMindmap');

    // Check if mind map overlay appears
    cy.get('[role="dialog"]').should('be.visible');
    cy.contains('Quantum Physics').should('be.visible');
  });

  it('should upload a file', () => {
    const fileName = 'test-doc.txt';
    cy.get('[data-testid="file-upload-input"]').selectFile({
      contents: Cypress.Buffer.from('This is a test file content'),
      fileName: fileName,
      mimeType: 'text/plain'
    }, { force: true });

    cy.wait('@uploadDoc');
    cy.contains(fileName).should('be.visible');
    cy.contains('Knowledge Base Updated').should('be.visible');
  });
});
