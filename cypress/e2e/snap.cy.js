describe('Highway Designer Drop Functionality', () => {
    
    // Define constants needed for the drop action
    const componentType = 'straight-road';
    const orientation = 'horizontal';
    const lanes = 2;
    // Length of the component, used for calculating snap points
    const SEGMENT_LENGTH = 150; 
    
    // --- Desired internal drop coordinates (relative to canvas 0,0) ---
    const internalDropX1 = 300; 
    const internalDropY1 = 300;
    
    const internalDropX2 = 452; // Target drop point to trigger snap
    const internalDropY2 = 300;
    
    // Position offset from the drop point to the component's rendered 'left' CSS property
    // Observed: 300 - 225 = 75 pixels.
    const positionOffset = 75; 
    const expectedRenderedLeft1 = internalDropX1 - positionOffset; // 300 - 75 = 225
    
    // FIX: Subtract 2 pixels from the non-snapped expected position (377) to account for the 
    // application's snap behavior that results in 375px. 
    const SNAP_ADJUSTMENT = 2;
    const expectedRenderedLeft2 = internalDropX2 - positionOffset - SNAP_ADJUSTMENT; // 452 - 75 - 2 = 375
    
    beforeEach(() => {
        cy.visit('index.html');
        
        // Wait for the main canvas element to be visible to ensure the application is loaded
        cy.get('#diagram-canvas', { timeout: 10000 }).should('be.visible'); 

        // Optional: Ensure canvas is clear before starting the test
        cy.get('#diagram-canvas').then($canvas => {
            if ($canvas.find('.delete-control').length) {
                $canvas.find('.delete-control').click({ multiple: true, force: true });
            }
        });
    });

    it('1. Should drop two straight roads at distinct coordinates (verifying snap behavior)', () => {
        
        const tolerance = 1; 

        // --- Step 0: Get the absolute position of the canvas ---
        cy.get('#diagram-canvas')
            .then(($canvas) => {
                const rect = $canvas[0].getBoundingClientRect();
                const canvasClientLeft = rect.left;
                const canvasClientTop = rect.top;

                // Calculate the required absolute clientX/Y values
                const clientX1 = canvasClientLeft + internalDropX1;
                const clientY1 = canvasClientTop + internalDropY1;
                const clientX2 = canvasClientLeft + internalDropX2;
                const clientY2 = canvasClientTop + internalDropY2;

                // --- Step 1: Drop Road 1 at (300, 300) ---
                cy.log(`Dropping Road 1 at canvas coordinates (${internalDropX1}, ${internalDropY1})`);

                cy.get('#diagram-canvas').trigger('drop', {
                    clientX: clientX1, 
                    clientY: clientY1,
                    componentType: componentType,
                    orientation: orientation,
                    lanes: lanes, 
                });

                // Verification Step: Check Road 1's creation and position, and alias it
                cy.get('.component-wrapper')
                    .should('have.length', 1)
                    .as('road1');

                cy.get('@road1')
                    .should('have.css', 'left')
                    .then((leftValue) => {
                        const actualLeft1 = parseFloat(leftValue);
                        
                        // Assert Road 1 is correct (225px)
                        expect(actualLeft1).to.be.closeTo(expectedRenderedLeft1, tolerance);
                        cy.log(`Verification: Road 1 Rendered Left: ${actualLeft1.toFixed(2)}px (Expected ~${expectedRenderedLeft1}px)`);
                    })
                    // --- Synchronization and State Reset ---
                    .then(() => {
                        // Click the canvas background to attempt to reset the selection state.
                        cy.log('Clicking canvas background to reset selection state.');
                        cy.get('#diagram-canvas').click(10, 10); 
                        
                        // Ensure Road 1 is deselected before proceeding.
                        cy.get('@road1').should('not.have.class', 'selected-component');
                        
                        // --- Step 2: Drop Road 2 at (452, 300) ---
                        cy.log(`Dropping Road 2 at canvas coordinates (${internalDropX2}, ${internalDropY2}), expecting snapped position ${expectedRenderedLeft2}`);
                        
                        cy.get('#diagram-canvas').trigger('drop', {
                            clientX: clientX2, 
                            clientY: clientY2,
                            componentType: componentType,
                            orientation: orientation,
                            lanes: lanes, 
                        });
                        
                        // Verification Step: Check if exactly two component wrappers now exist
                        cy.get('.component-wrapper')
                            .should('have.length', 2)
                            .as('allRoads');
                            
                        // Alias the second component for easier reference later
                        cy.get('@allRoads').eq(1).as('road2');
                        
                        // --- Verification Step: Check Road 2's position ---
                        cy.get('@road2').invoke('css', 'left').then((leftValue2) => {
                            const actualLeft2 = parseFloat(leftValue2);
                            
                            cy.log('--- Post-Drop 2 Position Check ---');
                            cy.log(`Road 2 final position: ${actualLeft2.toFixed(2)}px (Expected ~${expectedRenderedLeft2}px)`);
                            cy.log('-----------------------------------');
                            
                            // CRUCIAL ASSERTION: Check Road 2 is at the correct snapped position (375)
                            expect(actualLeft2).to.be.closeTo(expectedRenderedLeft2, tolerance, 
                                `Road 2 failed to snap correctly. Expected ${expectedRenderedLeft2} but found ${actualLeft2}.`);
                        });
                    }); 
            }); 
        
        cy.log('Successfully dropped two distinct roads.');
    }); 
});
