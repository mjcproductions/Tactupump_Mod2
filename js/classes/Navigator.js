/*
	--- Navigator class ---

	NOTE: Declared as singleton/global object in main.js
	
	Allows dynamic navigation in the module
*/

// use the ERS namespace for all code
var ERS = ERS || {};


// ---- Navigator constructor ----
ERS.Navigator = function() {
	
};

// ---- Next screen navigation from index ----
ERS.Navigator.prototype.nextScreen = function() {
	this.gotoScreen( ERS.moduleData.getCurrentScreenNumber() + 1 );
};

// ---- Previous screen navigation from index ----
ERS.Navigator.prototype.previousScreen = function() {
	this.gotoScreen( ERS.moduleData.getCurrentScreenNumber() - 1 );
};

// ---- Jumps to a specific screen, if it exists ----
ERS.Navigator.prototype.gotoScreen = function( a_screenNumber ) {
	// if screen exists (was set), display that screen
	if( ERS.moduleData.setCurrentScreenNumber( a_screenNumber ) )
		ERS.moduleData.displayNewScreen();
};