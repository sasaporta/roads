describe('Highway Designer Lane Configuration State Persistence', () => {
    beforeEach(() => {
        cy.visit('index.html');
    });

    // Helper function to click the lanes option and set the palette state
    const setLanesAndVerifyPalette = (componentContainerId, componentAlias, lanes, index) => {
        cy.log(`--- Setting ${lanes} lanes for ${componentAlias} ---`);
        const gearIcon = cy.get(componentContainerId).find('.control-icon-wrapper');

        // 1. Click gear icon to open menu
        gearIcon.click();
        
        // Ensure the main options menu is visible before proceeding
        const componentOptions = cy.get(componentContainerId).find('.component-options');
        componentOptions.should('be.visible');

        // 2. Click "Lanes" menu item
        componentOptions
            .contains('.menu-item', 'Lanes')
            .click();

        // 3. Click the specific lane option (0 for 2 lanes, 1 for 4 lanes)
        // Adding should('be.visible') here to ensure the sub-menu is fully displayed before querying contents.
        cy.get('.lanes-sub-menu')
            .should('be.visible')
            .find('.menu-item')
            .eq(index) 
            .click(); 

        // 4. Verify palette state updated
        cy.get(componentAlias)
            .should('have.attr', 'data-lanes', lanes.toString());
            
        // 5. Cleanup: Close menu by clicking the gear icon again
        //gearIcon.click(); 
    };

    // Helper function to drop and verify the component on the canvas
    const dropAndVerifyCanvas = (componentAlias, componentType, lanes) => {
        const dropX = 300; 
        const dropY = 300;
        const lanesString = lanes.toString();

        // 1. Drop component
        cy.get('#diagram-canvas').trigger('drop', {
            offsetX: dropX, 
            offsetY: dropY,
            componentType: componentType,
            orientation: componentType === 'straight-road' ? 'horizontal' : '0', // Provide default orientation
            lanes: lanes, 
        });

        // 2. Verify dropped component state
        cy.get('#diagram-canvas')
            .find('.component-wrapper')
            .last()
            .should('exist')
            .find('.dropped-component')
            .should('have.attr', 'data-lanes', lanesString);
            
        // 3. Clean up the canvas
        cy.get('.delete-control').click();
    };

    // ====================================================================
    // TEST 1: STRAIGHT ROAD
    // ====================================================================
    it('1. Should correctly set default 2 lanes and switched 4 lanes for Straight Road', () => {
        const componentContainerId = '#straight-road-palette-container';
        const componentAlias = '#straight-road-palette';
        const componentType = 'straight-road';

        // --- TEST 1A: DEFAULT 2 LANES ---
        cy.log(`**Verifying Default 2 Lanes for Straight Road**`);
        cy.get(componentAlias).should('have.attr', 'data-lanes', '2');
        dropAndVerifyCanvas(componentAlias, componentType, 2);

        // --- TEST 1B: SWITCH TO 4 LANES ---
        cy.log(`**Verifying Switched 4 Lanes for Straight Road**`);
        setLanesAndVerifyPalette(componentContainerId, componentAlias, 4, 1);
        dropAndVerifyCanvas(componentAlias, componentType, 4);

        // --- TEST 1C: RESTORE TO 2 LANES ---
        setLanesAndVerifyPalette(componentContainerId, componentAlias, 2, 0);
    });

    // ====================================================================
    // TEST 2: CURVED ROAD
    // ====================================================================
    it('2. Should correctly set default 2 lanes and switched 4 lanes for Curved Road', () => {
        const componentContainerId = '#curved-road-palette-container';
        const componentAlias = '#curved-road-palette';
        const componentType = 'curved-road';

        // --- TEST 2A: DEFAULT 2 LANES ---
        cy.log(`**Verifying Default 2 Lanes for Curved Road**`);
        cy.get(componentAlias).should('have.attr', 'data-lanes', '2');
        dropAndVerifyCanvas(componentAlias, componentType, 2);

        // --- TEST 2B: SWITCH TO 4 LANES ---
        cy.log(`**Verifying Switched 4 Lanes for Curved Road**`);
        setLanesAndVerifyPalette(componentContainerId, componentAlias, 4, 1);
        dropAndVerifyCanvas(componentAlias, componentType, 4);

        // --- TEST 2C: RESTORE TO 2 LANES ---
        setLanesAndVerifyPalette(componentContainerId, componentAlias, 2, 0);
    });

    // ====================================================================
    // TEST 3: CROSSROADS
    // ====================================================================
    it('3. Should correctly set default 2 lanes and switched 4 lanes for Crossroads', () => {
        const componentContainerId = '#crossroads-palette-container';
        const componentAlias = '#crossroads-palette';
        const componentType = 'crossroads';

        // --- TEST 3A: DEFAULT 2 LANES ---
        cy.log(`**Verifying Default 2 Lanes for Crossroads**`);
        cy.get(componentAlias).should('have.attr', 'data-lanes', '2');
        dropAndVerifyCanvas(componentAlias, componentType, 2);

        // --- TEST 3B: SWITCH TO 4 LANES ---
        cy.log(`**Verifying Switched 4 Lanes for Crossroads**`);
        setLanesAndVerifyPalette(componentContainerId, componentAlias, 4, 1);
        dropAndVerifyCanvas(componentAlias, componentType, 4);

        // --- TEST 3C: RESTORE TO 2 LANES ---
        setLanesAndVerifyPalette(componentContainerId, componentAlias, 2, 0);
    });
});
