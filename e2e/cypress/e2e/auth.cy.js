describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.visit('/');
    // Clear localStorage to ensure we're not logged in
    cy.clearLocalStorage();
  });

  it('should open login modal when clicking Login', () => {
    cy.contains('Login').click();
    cy.get('[role="dialog"]').should('be.visible');
    cy.contains('Welcome Back').should('be.visible');
    cy.get('input[type="email"]').should('be.visible');
    cy.get('input[type="password"]').should('be.visible');
  });

  it('should open signup modal when clicking Sign Up', () => {
    cy.contains('Sign Up').click();
    cy.contains('Create Account').should('be.visible');
    cy.get('input[placeholder="John Doe"]').should('be.visible');
    cy.get('input[type="email"]').should('be.visible');
    cy.get('input[type="password"]').should('be.visible');
  });

  it('should switch between Login and Signup modes', () => {
    cy.contains('Login').click();
    cy.contains("Don't have an account? Sign Up").click();
    cy.contains('Create Account').should('be.visible');
    cy.contains('Already have an account? Sign In').click();
    cy.contains('Welcome Back').should('be.visible');
  });

  it('should show error on failed login', () => {
    cy.contains('Login').click();
    cy.get('input[type="email"]').type('nonexistent@example.com');
    cy.get('input[type="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();
    
    // We expect an error message to appear
    cy.get('.text-red-400').should('be.visible');
  });
});
