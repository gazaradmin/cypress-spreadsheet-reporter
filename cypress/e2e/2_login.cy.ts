describe('Login Test', () => {
  context('Admin Login', () => {
    it('Super admin Login__Sheet1!N6,Sheet1!Q2', () => {
      cy.visit('https://example.cypress.io');
    });

    it('Admin Login__Sheet1!N7,Sheet1!Q2', () => {
      cy.visit('https://example.cypress.io');
    });
  });

  context('User Login', () => {
    it.skip('User 1 Login__Sheet1!N8,Sheet1!Q2', () => {
      cy.visit('https://example.cypress.io');
    });
    it('User 2 Login__Sheet1!N9,Sheet1!Q2', () => {
      cy.visit('https://exampe.cypress.io');
    });
  });
});
