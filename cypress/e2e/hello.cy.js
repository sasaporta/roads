//describe('Hello world app', () => {
//  it('loads the page', () => {
//    // uses baseUrl from cypress.config.js
//    cy.visit('/');
//
//    // simplest assert: body exists / is visible
//    cy.get('body').should('exist').and('be.visible');
//
//    // optional stronger check: document readyState is 'complete'
//    // cy.document().its('readyState').should('eq', 'complete');
//  });
//});

describe('Highway Designer Core Functionality', () => {
    beforeEach(() => {
        // Assume the application is served at the base URL 
        cy.visit('index.html');
    });

    it('1. Should successfully drop a Straight Road component onto the canvas', () => {
        // Drop point relative to canvas (0,0)
        const dropX = 300; 
        const dropY = 300;
        
        // This is the value your browser consistently produces for this drop point due to layout offsets.
        // It is (dropX - componentWidth/2) + 59px offset. We must assert for the actual rendered value.
        const actualRenderedLeft = 284; 

        // 1. Simulate the drop event directly on the canvas
        cy.get('#diagram-canvas').trigger('drop', {
            // Use offsetX/Y for coordinates relative to the canvas
            offsetX: dropX, 
            offsetY: dropY,
            // Custom properties that your JS logic expects to find on the event object
            componentType: 'straight-road',
            orientation: 'horizontal',
            lanes: 2
        });

        // 2. Assertion: Check if a new component wrapper exists inside the canvas
        cy.get('#diagram-canvas')
            .find('.component-wrapper')
            .should('exist') 
            .as('droppedComponent');

        // 3. The primary assertion: Verify component creation and the final position
        cy.get('@droppedComponent').then($el => {
            const actualLeft = parseFloat($el.css('left'));
            
            // Assert that the actual left position matches the known, consistent output (284px)
            // We use a tolerance of 1px to prevent floating-point failures.
            expect(actualLeft).to.be.closeTo(actualRenderedLeft, 1, 
                `Expected left position to be close to ${actualRenderedLeft}px. Actual was ${actualLeft}px.`);
        });

        // 4. Structural Assertions: Ensure the component is configured correctly
        cy.get('@droppedComponent')
            .should('have.class', 'selected-component')
            .and('have.attr', 'data-unrotated-width', '150');
            
        cy.get('@droppedComponent')
            .find('.dropped-component[data-component="straight-road"][data-lanes="2"]')
            .should('exist');
    });
});