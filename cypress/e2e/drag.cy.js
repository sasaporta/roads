describe('Highway Designer Straight Road Orientation State Persistence', () => {
    beforeEach(() => {
        cy.visit('index.html');
        // Alias the straight road palette component
        cy.get('#straight-road-palette-container .component-palette').as('straightRoadPalette');
    });

    it('2. Should change straight road orientation in palette and reflect on drop', () => {
        const dropX = 300; 
        const dropY = 300;
        const componentWidth = 150; // Horizontal width (SEGMENT_LENGTH)
        const componentHeight = 50; // Vertical width (ROAD_WIDTH_2_LANE)

        // --- PART 1: Verify Default Horizontal Orientation and Drop ---
        
        // Assertion 1: Check the default orientation on the palette
        cy.get('@straightRoadPalette')
            .should('have.attr', 'data-orientation', 'horizontal');
        
        // Drop the component (Horizontal)
        cy.get('#diagram-canvas').trigger('drop', {
            offsetX: dropX, 
            offsetY: dropY,
            componentType: 'straight-road',
            orientation: 'horizontal',
            lanes: 2
        });
        
        // Assertion 2: EXPLICITLY verify the dropped component is horizontal
        cy.get('#diagram-canvas')
            .find('.component-wrapper')
            .first()
            .should('exist')
            .find('.dropped-component')
            .should('have.attr', 'data-orientation', 'horizontal')
            // Verify dimensions match the horizontal state: width=150px
            .and('have.css', 'width', `${componentWidth}px`);

        // Clean up the canvas before the next step
        cy.get('.delete-control').click();


        // --- PART 2: Change Orientation to Vertical via Options Menu ---
        
        // Assertion 3.1: Click the control icon to open the options dropdown.
        cy.get('@straightRoadPalette')
            .parent('.palette-item-container')
            .find('.control-icon-wrapper')
            .click(); 

        // Assertion 3.2: Click the "Orientation" menu item to open the sub-menu.
        cy.get('.component-options') 
            .should('be.visible')
            .contains('.menu-item', 'Orientation')
            .click();

        // Assertion 4: Click the Vertical option (second icon wrapper in the sub-menu).
        cy.get('.orientation-sub-menu')
            .should('be.visible')
            .find('.orientation-icon-wrapper')
            .eq(1) 
            .click(); 
        
        // Assertion 5: Verify the palette item's data attribute is immediately updated to 'vertical'
        cy.get('@straightRoadPalette')
            .should('have.attr', 'data-orientation', 'vertical');


        // --- PART 3: Verify Vertical Drop ---

        // Drop a new component (Vertical).
        cy.get('#diagram-canvas').trigger('drop', {
            offsetX: dropX, 
            offsetY: dropY,
            componentType: 'straight-road',
            orientation: 'vertical', // New orientation passed in the simulated drag payload
            lanes: 2
        });

        // Assertion 6: Verify the newly dropped component is vertical
        cy.get('#diagram-canvas')
            .find('.component-wrapper')
            .last()
            .should('exist')
            .as('droppedVerticalComponent');

        cy.get('@droppedVerticalComponent')
            .find('.dropped-component')
            .should('have.attr', 'data-orientation', 'vertical');

        // Assertion 7: Verify the component dimensions have swapped (Vertical road: width=50, height=150)
        cy.get('@droppedVerticalComponent')
            .should('have.attr', 'data-unrotated-height', componentWidth.toString()) // data-unrotated-height is 150
            .and('have.css', 'width', `${componentHeight}px`); // CSS width is 50px
    });
});

describe('Highway Designer Curved Road Orientation State Persistence', () => {
    beforeEach(() => {
        cy.visit('index.html');
        cy.get('#curved-road-palette-container').as('curvedRoadPaletteContainer');
        cy.get('#curved-road-palette').as('curvedRoadPalette');
    });

    // Helper function to click the orientation option and update state
    const changeAndVerifyPalette = (angleString, iconIndex) => {
        cy.log(`--- Setting Angle: ${angleString} degrees ---`);
        const gearIcon = cy.get('@curvedRoadPaletteContainer').find('.control-icon-wrapper');

        // 1. Click gear icon to open menu
        gearIcon.click(); 

        // 2. Click "Orientation" menu item
        cy.get('.component-options') 
            .contains('.menu-item', 'Orientation')
            .click();

        // 3. Click the specific angle icon
        cy.get('.orientation-sub-menu')
            .should('be.visible')
            .find('.orientation-icon-wrapper')
            .eq(iconIndex) 
            .click(); 
        
        // 4. Verify palette state updated
        cy.get('@curvedRoadPalette')
            .should('have.attr', 'data-orientation', angleString);
    };

    // Helper function to drop and verify the component
    const dropAndVerifyCanvas = (angleString) => {
        const dropX = 300; 
        const dropY = 300;

        // 1. Drop component
        cy.get('#diagram-canvas').trigger('drop', {
            offsetX: dropX, 
            offsetY: dropY,
            componentType: 'curved-road',
            orientation: angleString, 
            lanes: 2
        });

        // 2. Verify dropped component state
        cy.get('#diagram-canvas')
            .find('.component-wrapper')
            .last()
            .should('exist')
            .as('droppedCurvedComponent');

        cy.get('@droppedCurvedComponent')
            .find('.dropped-component')
            .should('have.attr', 'data-orientation', angleString);
            
        // 3. Clean up the canvas
        cy.get('@droppedCurvedComponent').find('.delete-control').click();
    };


    it('3. Should cycle through 0, 90, 180, and 270-degree orientations sequentially', () => {

        // =======================================================
        // 1. TEST 0 DEGREES (DEFAULT STATE)
        // =======================================================

        cy.log('--- TEST 0 DEGREES (DEFAULT) ---');
        // Verify default palette state
        cy.get('@curvedRoadPalette').should('have.attr', 'data-orientation', '0');
        // Drop and verify on canvas
        dropAndVerifyCanvas('0');


        // =======================================================
        // 2. TEST 90 DEGREES
        // =======================================================

        changeAndVerifyPalette('90', 1); // Index 1 is the second icon
        dropAndVerifyCanvas('90');


        // =======================================================
        // 3. TEST 180 DEGREES
        // =======================================================
        
        changeAndVerifyPalette('180', 2); // Index 2 is the third icon
        dropAndVerifyCanvas('180');


        // =======================================================
        // 4. TEST 270 DEGREES
        // =======================================================
        
        changeAndVerifyPalette('270', 3); // Index 3 is the fourth icon
        dropAndVerifyCanvas('270');
    });
});

describe('Highway Designer Crossroads Options Validation', () => {
    beforeEach(() => {
        cy.visit('index.html');
        // Alias the crossroads palette component container
        cy.get('#crossroads-palette-container').as('crossroadsPaletteContainer');
    });

    it('4. Should disable the Orientation option for the Crossroads component', () => {
        cy.log('--- Validating Crossroads Orientation option is disabled ---');
        
        // 1. Click the gear icon to open the options dropdown.
        cy.get('@crossroadsPaletteContainer')
            .find('.control-icon-wrapper')
            .click();

        // 2. Find the component options dropdown and assert visibility.
        cy.get('@crossroadsPaletteContainer')
            .find('.component-options')
            .should('be.visible')
            .as('optionsDropdown');

        // 3. Assert that the "Orientation" menu item is present and has the 'disabled' class.
        cy.get('@optionsDropdown')
            .contains('.menu-item', 'Orientation')
            .should('exist')
            // Check that the item has the 'disabled' class
            .and('have.class', 'disabled')
            .click({ force: true }); // Attempt to click it to ensure no unexpected action occurs

        // 4. Assert that the orientation sub-menu *did not* open (it should be hidden/display: none).
        cy.get('@optionsDropdown')
            .find('.orientation-sub-menu')
            // The sub-menu should exist in the DOM but must not be visible.
            .should('not.be.visible');

        // 5. Cleanup: Close the main dropdown.
        cy.get('@crossroadsPaletteContainer')
            .find('.control-icon-wrapper')
            .click();
    });
});