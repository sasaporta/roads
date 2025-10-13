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
    const expectedRenderedLeft2 = internalDropX2 - positionOffset - SNAP_ADJUSTMENT; // 452 - 75 - 2 = 375 (Snapped position)
    
    // Expected position for non-snapped drop (the target drop point minus offset): 452 - 75 = 377
    const expectedRenderedLeft_NoSnap = internalDropX2 - positionOffset; // (Non-snapped position)

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

    it('1. Should drop two straight roads, verify snap, delete roads, uncheck snap, drop a third road, and verify non-snap on a fourth road', () => {
        
        const tolerance = 1; 

        // --- Step 0: Get the absolute position of the canvas and STORE as aliases ---
        cy.get('#diagram-canvas')
            .then(($canvas) => {
                const rect = $canvas[0].getBoundingClientRect();
                const canvasClientLeft = rect.left;
                const canvasClientTop = rect.top;

                // Calculate and store the absolute clientX/Y values using cy.wrap().as()
                cy.wrap(canvasClientLeft + internalDropX1).as('clientX1');
                cy.wrap(canvasClientTop + internalDropY1).as('clientY1');
                cy.wrap(canvasClientLeft + internalDropX2).as('clientX2');
                cy.wrap(canvasClientTop + internalDropY2).as('clientY2');
            })
            // --- Step 1: Drop Road 1 at (300, 300) ---
            .then(() => {
                // RETRIEVE ALIASES for the drop event
                cy.get('@clientX1').then(clientX1 => {
                    cy.get('@clientY1').then(clientY1 => {
                        
                        cy.log(`Dropping Road 1 at canvas coordinates (${internalDropX1}, ${internalDropY1})`);

                        cy.get('#diagram-canvas').trigger('drop', {
                            clientX: clientX1, 
                            clientY: clientY1,
                            componentType: componentType,
                            orientation: orientation,
                            lanes: lanes, 
                        });
                    });
                });
            });

        // Verification Step: Check Road 1's creation and position, and alias it
        cy.get('.component-wrapper')
            .should('have.length', 1)
            .as('road1')
            .should('have.css', 'left')
            .then((leftValue) => {
                const actualLeft1 = parseFloat(leftValue);
                // Assert Road 1 is correct (225px)
                expect(actualLeft1).to.be.closeTo(expectedRenderedLeft1, tolerance);
            })
            // --- Synchronization and State Reset for Road 2 ---
            .then(() => {
                // Click the canvas background to attempt to reset the selection state.
                cy.log('Clicking canvas background to reset selection state.');
                cy.get('#diagram-canvas').click(10, 10); 
                
                // --- Step 2: Drop Road 2 at (452, 300) ---
                cy.log(`Dropping Road 2 (SNAP ENABLED) at canvas coordinates (${internalDropX2}, ${internalDropY2}), expecting snapped position ${expectedRenderedLeft2}`);
                
                // RETRIEVE ALIASES for the drop event
                cy.get('@clientX2').then(clientX2 => {
                    cy.get('@clientY2').then(clientY2 => {
                        
                        cy.get('#diagram-canvas').trigger('drop', {
                            clientX: clientX2, 
                            clientY: clientY2,
                            componentType: componentType,
                            orientation: orientation,
                            lanes: lanes, 
                        });
                    });
                });
            });
            
        // Verification Step: Check Road 2's position
        cy.get('.component-wrapper')
            .should('have.length', 2)
            .eq(1).as('road2')
            .invoke('css', 'left')
            .then((leftValue2) => {
                const actualLeft2 = parseFloat(leftValue2);
                
                // CRUCIAL ASSERTION: Check Road 2 is at the correct snapped position (375)
                expect(actualLeft2).to.be.closeTo(expectedRenderedLeft2, tolerance, 
                    `Road 2 failed to snap correctly. Expected ${expectedRenderedLeft2} but found ${actualLeft2}.`);
            })

            // --- DELETION LOGIC ---
            .then(() => {
                cy.log('Deleting Road 1 and Road 2 to clear canvas state.');
                
                // 1. Road 2 is the current selected element. Delete it.
                cy.get('@road2')
                    .find('.delete-control').click({ force: true });
                
                // 2. Road 1 is now the only element left. Delete it.
                cy.get('.component-wrapper').should('have.length', 1);
                
                cy.get('.component-wrapper')
                    .eq(0).click({ force: true }) // Selects the remaining Road 1
                    .find('.delete-control').click({ force: true });
                
                // 3. Final verification of clear canvas
                cy.get('.component-wrapper').should('not.exist');
            })
            
            // --- Step 3: Uncheck the "Snap to fit" checkbox ---
            .then(() => {
                cy.log('Unchecking the "Snap to fit" checkbox.');
                cy.get('#snap-checkbox')
                .should('be.checked')
                .uncheck()
                .should('not.be.checked'); // Verify the checkbox state
            })
            
            // --- Step 4: Drop Road 3 (Base Road for No Snap) ---
            .then(() => {
                cy.log(`Dropping Road 3 (Base road for NO SNAP) at canvas coordinates (${internalDropX1}, ${internalDropY1}).`);
                
                // Use the ALIASES to reliably retrieve the coordinates
                cy.get('@clientX1').then(clientX1 => {
                    cy.get('@clientY1').then(clientY1 => {
                        
                        cy.get('#diagram-canvas').trigger('drop', {
                            clientX: clientX1, 
                            clientY: clientY1,
                            componentType: componentType,
                            orientation: orientation,
                            lanes: lanes, 
                        });
                    });
                });
            })
            .then(() => {
                cy.get('.component-wrapper')
                    .should('have.length', 1)
                    .as('road3');
                
                cy.get('#diagram-canvas').click(10, 10); // Deselect Road 3
            })
            
            // --- Step 5: Drop Road 4 (Interaction Test for No Snap) ---
            .then(() => {
                cy.log(`Dropping Road 4 (Test road for NO SNAP) at canvas coordinates (${internalDropX2}, ${internalDropY2}).`);
                
                // Use the ALIASES for the snap-trigger location (X2, Y2)
                cy.get('@clientX2').then(clientX2 => {
                    cy.get('@clientY2').then(clientY2 => {
                        
                        cy.get('#diagram-canvas').trigger('drop', {
                            clientX: clientX2, 
                            clientY: clientY2,
                            componentType: componentType,
                            orientation: orientation,
                            lanes: lanes, 
                        });
                    });
                });
            })
            // Final check on component count and aliasing Road 4
            .then(() => {
                cy.get('.component-wrapper')
                    .should('have.length', 2)
                    .eq(1).as('road4');
            })
            
            // --- Step 6: Verification of Road 4 (The Crucial Test) ---
            .then(() => {
                 cy.get('@road4')
                    .invoke('css', 'left')
                    .then((leftValue4) => {
                        const actualLeft4 = parseFloat(leftValue4);
                        
                        cy.log('--- Post-Drop 4 Position Check ---');
                        cy.log(`Road 4 final position: ${actualLeft4.toFixed(2)}px (Expected ~${expectedRenderedLeft_NoSnap}px)`);
                        cy.log('-----------------------------------');
                        
                        // ASSERTION: Road 4 must NOT be snapped (377px)
                        expect(actualLeft4).to.be.closeTo(expectedRenderedLeft_NoSnap, tolerance, 
                            `Road 4 was incorrectly snapped. Expected non-snapped position ${expectedRenderedLeft_NoSnap} but found ${actualLeft4}.`);
                    });
            });

        cy.log('Successfully completed and verified all steps for snap and non-snap behavior.');
    }); 
});