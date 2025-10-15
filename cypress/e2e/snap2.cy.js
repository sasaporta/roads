// snap2.cy.js

const tolerance = 1;

const snapCases = [];
for (const lanes of [2, 4]) {

/*
    snapCases.push(
        {
            name: 'straight, horizontal, snap to right edge',
            lanes: lanes,
            roadA: {
                componentType: 'straight-road',
                orientation: 'horizontal',
                dropX: 300, 
                dropY: 300,
            },
            roadB: {
                componentType: 'straight-road',
                orientation: 'horizontal',
                dropX: 452,
                dropY: 302,
            },
            expectedLeft: 375, 
            expectedTop: lanes == 2 ? 275 : 250 
        }
    );
    snapCases.push(
        {
            name: 'straight, horizontal, snap to left edge',
            lanes: lanes,
            roadA: {
                componentType: 'straight-road',
                orientation: 'horizontal',
                dropX: 300, 
                dropY: 300,
            },
            roadB: {
                componentType: 'straight-road',
                orientation: 'horizontal',
                dropX: 148,
                dropY: 302,
            },
            expectedLeft: 75,
            expectedTop: lanes == 2 ? 275 : 250 
        }
    );
    snapCases.push(
        {
            name: 'straight, vertical, snap to bottom edge',
            lanes: lanes,
            roadA: {
                componentType: 'straight-road',
                orientation: 'vertical',
                dropX: 300, 
                dropY: 300,
                dropB_X: 302,
                dropB_Y: 452,
            },
            roadB: {
                componentType: 'straight-road',
                orientation: 'vertical',
                dropX: 302,
                dropY: 452,
            },
            expectedLeft: lanes == 2 ? 275: 250,
            expectedTop: 375 
        },
    );
    snapCases.push(
        {
            name: 'straight, vertical, snap to top edge',
            lanes: lanes,
            roadA: {
                componentType: 'straight-road',
                orientation: 'vertical',
                dropX: 300, 
                dropY: 300,
            },
            roadB: {
                componentType: 'straight-road',
                orientation: 'vertical',
                dropX: 302,
                dropY: 152,
            },
            expectedLeft: lanes == 2 ? 275: 250,
            expectedTop: 75 
        },
    );

    snapCases.push(
        {
            name: 'curved, snap to top right',
            lanes: lanes,
            roadA: {
                componentType: 'curved-road',
                orientation: '0',
                dropX: 300, 
                dropY: 300,
            },
            roadB: {
                componentType: 'curved-road',
                orientation: '90',
                dropX: 452,
                dropY: 302,
            },
            expectedLeft: 375,
            expectedTop: 225
        },
    );
    snapCases.push(
        {
            name: 'curved, snap to bottom right',
            lanes: lanes,
            roadA: {
                componentType: 'curved-road',
                orientation: '90',
                dropX: 300, 
                dropY: 300,
            },
            roadB: {
                componentType: 'curved-road',
                orientation: '180',
                dropX: 302,
                dropY: 452,
            },
            expectedLeft: 225,
            expectedTop: 375
        },
    );
    snapCases.push(
        {
            name: 'curved, snap to bottom left',
            lanes: lanes,
            roadA: {
                componentType: 'curved-road',
                orientation: '180',
                dropX: 300, 
                dropY: 300,
            },
            roadB: {
                componentType: 'curved-road',
                orientation: '270',
                dropX: 152,
                dropY: 302,
            },
            expectedLeft: 75,
            expectedTop: 225
        },
    );
    snapCases.push(
        {
            name: 'curved, snap to top left',
            lanes: lanes,
            roadA: {
                componentType: 'curved-road',
                orientation: '270',
                dropX: 300, 
                dropY: 300,
            },
            roadB: {
                componentType: 'curved-road',
                orientation: '0',
                dropX: 302,
                dropY: 152,
            },
            expectedLeft: 225,
            expectedTop: 75
        },
    );
*/

    snapCases.push(
        {
            name: 'crossroads, snap to right edge',
            lanes: lanes,
            roadA: {
                componentType: 'crossroads',
                orientation: '0',
                dropX: 300, 
                dropY: 300,
            },
            roadB: {
                componentType: 'straight-road',
                orientation: 'horizontal',
                dropX: 452,
                dropY: 302,
            },
            expectedLeft: 375, 
            expectedTop: lanes == 2 ? 275 : 250 
        }
    );
    snapCases.push(
        {
            name: 'crossroads, snap to bottom edge',
            lanes: lanes,
            roadA: {
                componentType: 'crossroads',
                orientation: '0',
                dropX: 300, 
                dropY: 300,
            },
            roadB: {
                componentType: 'straight-road',
                orientation: 'vertical',
                dropX: 302,
                dropY: 452,
            },
            expectedLeft: lanes == 2 ? 275 : 250,
            expectedTop: 375
        }
    );
    snapCases.push(
        {
            name: 'crossroads, snap to left edge',
            lanes: lanes,
            roadA: {
                componentType: 'crossroads',
                orientation: '0',
                dropX: 300, 
                dropY: 300,
            },
            roadB: {
                componentType: 'straight-road',
                orientation: 'horizontal',
                dropX: 152,
                dropY: 302,
            },
            expectedLeft: 75, 
            expectedTop: lanes == 2 ? 275 : 250 
        }
    );
    snapCases.push(
        {
            name: 'crossroads, snap to top edge',
            lanes: lanes,
            roadA: {
                componentType: 'crossroads',
                orientation: '0',
                dropX: 300, 
                dropY: 300,
            },
            roadB: {
                componentType: 'straight-road',
                orientation: 'vertical',
                dropX: 302,
                dropY: 152,
            },
            expectedLeft: lanes == 2 ? 275 : 250,
            expectedTop: 75
        }
    );
}

// --- Reusable Verification Function ---
function verifySnapBehavior(testCase) {
    let clientA_X, clientA_Y, clientB_X, clientB_Y;
    
    // A. CALCULATE ABSOLUTE COORDINATES
    cy.get('#diagram-canvas').then(($canvas) => {
        const rect = $canvas[0].getBoundingClientRect();
        const canvasClientLeft = rect.left;
        const canvasClientTop = rect.top;

        // Calculate absolute client coordinates for Drop A and Drop B
        clientA_X = canvasClientLeft + testCase.roadA.dropX;
        clientA_Y = canvasClientTop + testCase.roadA.dropY;
        clientB_X = canvasClientLeft + testCase.roadB.dropX;
        clientB_Y = canvasClientTop + testCase.roadB.dropY;

        // B. DROP ROAD A (The Base Road)
        cy.log(`Drop Road A (${testCase.name}): Internal X: ${testCase.roadA.dropX}, Y: ${testCase.roadA.dropY}`);
        cy.get('#diagram-canvas').trigger('drop', {
            clientX: clientA_X, 
            clientY: clientA_Y,
            componentType: testCase.roadA.componentType,
            orientation: testCase.roadA.orientation,
            lanes: testCase.lanes,
        });
    });

    // Ensure Road A is created
    cy.get('.component-wrapper')
        .should('have.length', 1)
        .as('roadA');

    // C. DROP ROAD B (The Test Road - expecting snap)
    cy.get('#diagram-canvas').then(() => {
        cy.log(`Drop Road B (${testCase.name}): Internal X: ${testCase.roadB.dropX}, Y: ${testCase.roadB.dropY}`);
        cy.get('#diagram-canvas').trigger('drop', {
            clientX: clientB_X, 
            clientY: clientB_Y,
            componentType: testCase.roadB.componentType,
            orientation: testCase.roadB.orientation,
            lanes: testCase.lanes, 
        });
    });

    // D. ASSERT ROAD B's Position
    cy.get('.component-wrapper')
        .should('have.length', 2)
        .eq(1).as('roadB')

    // 1. Assert LEFT position
    cy.get('@roadB')
        .invoke('css', 'left')
        .then(parseFloat)
        .should('be.closeTo', testCase.expectedLeft, tolerance, 
            `Road B failed LEFT check. Expected ${testCase.expectedLeft}.`);
    
    // 2. Assert TOP position
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
    });

    snapCases.forEach((testCase) => {
        it(`Should correctly verify snap for: ${testCase.name}`, () => {
            verifySnapBehavior(testCase);
        });
    });
});