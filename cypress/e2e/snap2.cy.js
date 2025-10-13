// snap2.cy.js

// Define known component constants and offsets
const componentType = 'straight-road';
const lanes = 2;
const tolerance = 1;
const SEGMENT_LENGTH = 150; 
const positionOffset = 75; 

// --- Data-Driven Snap Test Cases (Final, Corrected Values) ---
const snapCases = [
    // 1. Horizontal: Snap to the LEFT edge of the base road (Side-by-side alignment)
    {
        name: 'Horizontal: Snap to LEFT Edge of Base Road',
        testOrientation: 'horizontal',
        dropA_X: 300, 
        dropA_Y: 300,
        dropB_X: 452, // Drop target to trigger snap
        dropB_Y: 300,
        // Expected CSS 'left' for Road B when snapped side-by-side: 375
        expectedLeft: 375, 
        // Expected CSS 'top' for horizontal alignment: 275 
        expectedTop: 275 
    },
    // 2. Vertical: Snap UP to the BOTTOM edge of the base road (End-to-end alignment)
    {
        name: 'Vertical Road: Snap UP to Bottom Edge of Base Road',
        testOrientation: 'vertical',
        dropA_X: 300, 
        dropA_Y: 300, // Road A: CSS Top 225, Bottom Edge 375
        
        // FIX: Drop point is below Road A's bottom edge (375) to force UP snap.
        dropB_X: 300,
        dropB_Y: 452, // Using 452 (similar trigger distance as 452 for horizontal X)
        
        // Expected CSS 'left' (horizontal alignment): 225 
        expectedLeft: 275, 
        // Expected CSS 'top': Road B's top aligns with Road A's bottom edge (375)
        expectedTop: 375 
    },
];

// --- Reusable Verification Function ---
function verifySnapBehavior(testCase) {
    let clientA_X, clientA_Y, clientB_X, clientB_Y;
    
    // A. CALCULATE ABSOLUTE COORDINATES
    cy.get('#diagram-canvas').then(($canvas) => {
        const rect = $canvas[0].getBoundingClientRect();
        const canvasClientLeft = rect.left;
        const canvasClientTop = rect.top;

        // Calculate absolute client coordinates for Drop A and Drop B
        clientA_X = canvasClientLeft + testCase.dropA_X;
        clientA_Y = canvasClientTop + testCase.dropA_Y;
        clientB_X = canvasClientLeft + testCase.dropB_X;
        clientB_Y = canvasClientTop + testCase.dropB_Y;

        // B. DROP ROAD A (The Base Road)
        cy.log(`Drop Road A (${testCase.name}): Internal X: ${testCase.dropA_X}, Y: ${testCase.dropA_Y}`);
        cy.get('#diagram-canvas').trigger('drop', {
            clientX: clientA_X, 
            clientY: clientA_Y,
            componentType: componentType,
            orientation: testCase.testOrientation,
            lanes: lanes, 
        });
    });

    // Ensure Road A is created and deselect it
    cy.get('.component-wrapper')
        .should('have.length', 1)
        .as('roadA');
    cy.get('#diagram-canvas').click(10, 10); 

    // C. DROP ROAD B (The Test Road - expecting snap)
    cy.get('#diagram-canvas').then(() => {
        cy.log(`Drop Road B (${testCase.name}): Internal X: ${testCase.dropB_X}, Y: ${testCase.dropB_Y}`);
        
        cy.get('#diagram-canvas').trigger('drop', {
            clientX: clientB_X, 
            clientY: clientB_Y,
            componentType: componentType,
            orientation: testCase.testOrientation,
            lanes: lanes, 
        });
    });

    // D. ASSERT ROAD B's Position (Checking both axes for all cases)
    cy.get('.component-wrapper')
        .should('have.length', 2)
        .eq(1).as('roadB')

    // 1. Assert LEFT position (Snap check for horizontal, alignment check for vertical)
    cy.get('@roadB')
        .invoke('css', 'left')
        .then(parseFloat)
        .should('be.closeTo', testCase.expectedLeft, tolerance, 
            `Road B failed LEFT check. Expected ${testCase.expectedLeft}.`);
    
    // 2. Assert TOP position (Snap check for vertical, alignment check for horizontal)
    cy.get('@roadB')
        .invoke('css', 'top')
        .then(parseFloat)
        .should('be.closeTo', testCase.expectedTop, tolerance,
            `Road B failed TOP check. Expected ${testCase.expectedTop}.`);
}


// --- Main Test Suite ---

describe('Highway Designer Snap Functionality: Multiple Snap Cases (SNAP ENABLED)', () => {
    
    beforeEach(() => {
        cy.visit('index.html');
        cy.get('#diagram-canvas', { timeout: 10000 }).should('be.visible'); 
        
        // CRUCIAL: Clear canvas before every test
        cy.get('#diagram-canvas').then($canvas => {
             // Deletes all components by clicking their delete controls
             $canvas.find('.component-wrapper').each((index, el) => {
                cy.wrap(el).click({ force: true }).find('.delete-control').click({ force: true });
            });
        });
        cy.get('.component-wrapper').should('not.exist');
        
        // CRUCIAL: Ensure snap is CHECKED for all these tests
        cy.get('#snap-checkbox').check().should('be.checked');
    });

    // Loop through the data array to create isolated tests
    snapCases.forEach((testCase) => {
        it(`Should correctly verify snap for: ${testCase.name}`, () => {
            verifySnapBehavior(testCase);
        });
    });
});