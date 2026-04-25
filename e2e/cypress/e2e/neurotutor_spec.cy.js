describe("NeuroTutor E2E Flow", () => {
  beforeEach(() => {
    // Clean database before each test to ensure a clean state
    cy.cleanupDB();
    cy.clearLocalStorage();
    cy.visit("/");
  });

  it("should show the landing state and handle unauthenticated chat", () => {
    cy.contains(/What can I help you with/i).should("be.visible");
    
    // Try to send a message
    cy.get("#chat-message-input").type("Hello NeuroTutor{enter}");
    
    // Should show auth modal
    cy.get('[role="dialog"]', { timeout: 10000 }).should("be.visible");
    cy.get('[role="dialog"]').contains(/Create Account/i).should("be.visible");
  });

  it("should complete a full learning journey: Chat -> Mind Map -> New Chat -> Document Ingestion", () => {
    // 1. Register and Login
    cy.contains(/Sign Up/i).click({ force: true });
    cy.get('[role="dialog"] input').eq(0).type("Test Learner");
    cy.get('[role="dialog"] input').eq(1).type(`learner_${Date.now()}@example.com`);
    cy.get('[role="dialog"] input').eq(2).type("password123");
    cy.get('[role="dialog"] button').contains(/Get Started/i).click();
    cy.contains(/Online/i, { timeout: 15000 }).should("be.visible");

    // 2. Ask about a topic and trigger Mind Map
    cy.get("#chat-message-input").type("Explain Quantum Physics and show me a mind map{enter}");
    
    // Wait for the Mind Map button to appear in the message
    cy.contains(/Generate Mind Map/i, { timeout: 30000 }).should("be.visible").click();

    // 3. Interact with Mind Map
    cy.get('[data-testid="mind-map-loader"]').should("be.visible");
    cy.get('[data-testid="mind-map-container"]', { timeout: 20000 }).should("be.visible"); 
    
    // Give a moment for animations to settle
    cy.wait(1000);

    // Find the root or any node and click it
    cy.get('[data-testid="mind-map-node"]').first().click({ force: true });
    
    // Close the node detail modal
    cy.get('[data-testid="node-modal"]').should("be.visible");
    cy.get('[data-testid="node-modal"]').find('button').click({ force: true });

    // Close the Mind Map Overlay itself
    cy.get('[data-testid="close-mind-map"]').click({ force: true });

    // 4. Create a New Chat
    cy.get('[data-testid="new-chat-button"]').click({ force: true });
    cy.contains(/What can I help you with/i).should("be.visible");

    // 5. Test Document Ingestion
    cy.intercept('POST', '**/api/documents/upload').as('uploadDoc');
    
    // Target the input directly via test id and force the change event
    cy.get('[data-testid="file-upload-input"]').selectFile('cypress/fixtures/sample_doc.txt', { force: true }).trigger('change', { force: true });
    
    // Wait for upload to complete
    cy.wait('@uploadDoc', { timeout: 20000 });
    
    // Verify document badge appears
    cy.contains('Context:', { timeout: 15000 }).should("be.visible");
    cy.contains("sample_doc.txt").should("be.visible");

    // 6. Ask about the document
    cy.get("#chat-message-input").type("What does the uploaded document say about LangGraph?{enter}");
    cy.contains(/uses LangGraph/i, { timeout: 30000 }).should("be.visible");
  });
});
