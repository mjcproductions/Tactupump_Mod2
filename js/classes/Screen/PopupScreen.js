/*
	--- PopupScreen class ---
	
	Inherits from the Screen class.
		- instances of this class live in a list contained by this instance's corresponding Screen object.
*/

// use the ERS namespace for all code
var ERS = ERS || {};

ERS.PopupScreen = function( a_screenName, a_mediaName, a_hasAnimation, a_parentScreenName ) {
	
	// construct the arguments for Screen parent constructor
	var params = {
		screenName: a_screenName,
		mediaName: a_mediaName,
		hasAnimation: a_hasAnimation
	};
	ERS.Screen.call( this, params ); // initialize parent's constructor
	
	this._parentScreenName = a_parentScreenName;
	
	// change the path to this popup's HTML file
	this._htmlPath = MEDIA_SCREENS_PATH + "/" + this._parentScreenName + "/" + this._screenName + "/" + this._screenName + ".html";
	// change the popup's background image
	this._backgroundImageURL = MEDIA_SCREENS_PATH + "/" + this._parentScreenName + "/" + this._screenName + "/" + this._screenName + ".png";
	
	this._loadDOM = ERS.DOM.contentBG;
	
	this._isDisplaying = false;
};
// -- Make the PopupScreen class a child of the Screen class
ERS.PopupScreen.prototype = Object.create( ERS.Screen );

ERS.PopupScreen.prototype.loadScreen = function() {
	
	if( this._isDisplaying )
		return;
	
	// call base function
	ERS.Screen.prototype.loadScreen.call( this );
};

ERS.PopupScreen.prototype.animatorGetRequestComplete = function() {
	// call base function
	ERS.Screen.prototype.animatorGetRequestComplete.call( this );
};

ERS.PopupScreen.prototype.unloadScreen = function() {
	// call base function
	ERS.Screen.prototype.unloadScreen.call( this );
	
	this._isDisplaying = false;
};

ERS.PopupScreen.prototype.timeUpdate = function() {
	// call base function
	ERS.Screen.prototype.timeUpdate.call( this );
};

// ---- data getters ----
ERS.PopupScreen.prototype.getScreenName = function() {
	// call base function
	return ERS.Screen.prototype.getScreenName.call( this );
};
ERS.PopupScreen.prototype.getDivContainerId = function() {
	// call base function
	return ERS.Screen.prototype.getDivContainerId.call( this );
};
ERS.PopupScreen.prototype.getMediaPlayer = function() {
	// call base function
	return ERS.Screen.prototype.getMediaPlayer.call( this );
};


// ---- Helper Functions ---- //
// -------------------------- //

ERS.PopupScreen.prototype._loadScreenComplete = function( a_DOMRef ) {
	// call base function
	ERS.Screen.prototype._loadScreenComplete.call( this, a_DOMRef );
	
	this._isDisplaying = true;
};

ERS.PopupScreen.prototype._determineAudioOrVideo = function() {
	// call base function
	ERS.Screen.prototype._determineAudioOrVideo.call( this );
};

ERS.PopupScreen.prototype._buildButtons = function() {
	// call base function
	ERS.Screen.prototype._buildButtons.call( this );
};