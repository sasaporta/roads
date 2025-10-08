describe('Hello world app', () => {
  it('loads the page', () => {
    // uses baseUrl from cypress.config.js
    cy.visit('/');

    // simplest assert: body exists / is visible
    cy.get('body').should('exist').and('be.visible');

    // optional stronger check: document readyState is 'complete'
    // cy.document().its('readyState').should('eq', 'complete');
  });
});
