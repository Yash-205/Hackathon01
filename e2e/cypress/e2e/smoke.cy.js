describe('Smoke Test', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should load the landing page', () => {
    cy.contains('What can I help you with?').should('be.visible');
    cy.get('#chat-message-input').should('be.visible');
  });

  it('should show suggestions', () => {
    cy.contains('Create an image').should('be.visible');
    cy.contains('Help me code').should('be.visible');
  });

  it('should have a working sidebar toggle', () => {
    // Check if sidebar is closed initially (depending on layout, it might be open on desktop)
    // Looking at Sidebar component, it uses isOpen prop
    cy.get('[data-testid="sidebar-toggle"]').click();
    // Alternatively, look for specific text in sidebar
    cy.get('[data-testid="new-chat-button"]').should('be.visible');
  });
});
