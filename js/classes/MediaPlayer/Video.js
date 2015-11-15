/*
	--- Video class ---
	
	Inherits from the MediaPlayer class, controls all video playback
*/

// use the ERS namespace for all code
var ERS = ERS || {};


// ---- Video constructor ----
ERS.Video = function() {
	ERS.MediaPlayer.apply( this, arguments ); // initialize parent's members
};
// -- Make the Video class a child of the MediaPlayer class
ERS.Video.prototype = Object.create( ERS.MediaPlayer );

// ---- toggle playPauseButton override ----
ERS.Video.prototype.togglePlayPause = function() {
	// call base function
	ERS.MediaPlayer.prototype.togglePlayPause.call(this);
};
ERS.Video.prototype.togglePlayReset = function() {
	// call base function
	ERS.MediaPlayer.prototype.togglePlayReset.call(this);
};
ERS.Video.prototype.refresh = function() {
	// call base function
	ERS.MediaPlayer.prototype.refresh.call(this);
};

ERS.Video.prototype.loadMedia = function( a_mediaPath, a_mediaDOM ) {
	// call base function
	ERS.MediaPlayer.prototype.loadMedia.call( this, a_mediaPath, a_mediaDOM );
};
ERS.Video.prototype.unloadMedia = function() {
	// call base function
	ERS.MediaPlayer.prototype.unloadMedia.call( this );
};

// ---- play button override ----
ERS.Video.prototype.play = function() {
	// call base function
	ERS.MediaPlayer.prototype.play.call(this);
};
// ---- pause button overrride ----
ERS.Video.prototype.pause = function( a_effectUI ) {
	// call base function
	ERS.MediaPlayer.prototype.pause.call(this, a_effectUI);
};
// ---- reset object override ----
ERS.Video.prototype.reset = function() {
	// call base function
	ERS.MediaPlayer.prototype.reset.call(this);
};
// ---- timeUpdate override ----
ERS.Video.prototype.timeUpdate = function() {
	// call base function
	ERS.MediaPlayer.prototype.timeUpdate.call(this);
};

ERS.Video.prototype.scrubberTouched = function( e ) {
	// call base function
	ERS.MediaPlayer.prototype.scrubberTouched.call(this, e);
};

ERS.Video.prototype.getMediaDOM = function() {
	// call base function
	return ERS.MediaPlayer.prototype.getMediaDOM.call(this);
};