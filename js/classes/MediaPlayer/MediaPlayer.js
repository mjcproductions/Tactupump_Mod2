/*
	--- MediaPlayer class ---

	Controls all media (audio/video) in the module
	NOTE: Both ERS.Audio and ERS.Video classes inherit from this class
*/

// use the ERS namespace for all code
var ERS = ERS || {};


// ---- MediaPlayer constructor ----
ERS.MediaPlayer = function( a_mediaPath, a_animatorRef, a_screenRef ) {
	this._mediaPath = a_mediaPath;
	this._animatorRef = a_animatorRef;
	this._screenRef = a_screenRef;
	// assign the audio or video DOM object to load the media to
	this._mediaDOMObject = (this instanceof ERS.Audio) ? ERS.DOM.audio : ERS.DOM.video;
	if( a_screenRef instanceof ERS.GlossaryScreen )
		this._mediaDOMObject = document.getElementById( "glossAudioID" );
	
	// saves the current time of this MediaPlayer's audio/video element for pause/resume
	this._currentTime = 0;
	this._isPlaying = false;
	this._ended = false;
};

// ---- called from the playPauseButton, toggles playing/pausing of media ----
ERS.MediaPlayer.prototype.togglePlayPause = function() {
	if( !this._mediaDOMObject.paused )
	{
		this.pause();
	}
	else if( this._ended )
	{
		// media ended, reset it and play again
		this.refresh();
	}
	else
	{
		this.play();
	}
};

ERS.MediaPlayer.prototype.togglePlayReset = function() {
	if( !this._mediaDOMObject.paused )
	{
		this.reset();
		this.pause();
	}
	else if( this._ended )
	{
		// media ended, reset it and play again
		this.refresh();
	}
	else
	{
		this.play();
	}
};

// ---- media re-play function (reset/play) ----
ERS.MediaPlayer.prototype.refresh = function() {
	
	// if this screen has no media (such as a popup w/ no media), reset the entire screen
	if( this._mediaPath == "" )
	{
		ERS.navigator.gotoScreen( ERS.moduleData.getCurrentScreenNumber() );
		return;
	}
	
	this.reset();
	this.play();
};

ERS.MediaPlayer.prototype.loadMedia = function( a_mediaPath, a_mediaDOM ) {
	if( a_mediaPath )
		this._mediaPath = a_mediaPath;
	
	if( a_mediaDOM )
		this._mediaDOMObject = a_mediaDOM;
	
	this._isPlaying = false;
	
	if( this instanceof ERS.Video )
	{
		ERS.DOM.video.style.display = "inherit";
	}
	
	this._mediaDOMObject.src = this._mediaPath;
	this._mediaDOMObject.load();
	
	var ios7 = navigator.userAgent.match(/(iPad|iPhone|iPod touch);.*CPU.*OS 7_\d/i) ? true : false;
	if( ios7 && this._mediaDOMObject.readyState > 0 )
		this._mediaDOMObject.currentTime = this._currentTime;
};

ERS.MediaPlayer.prototype.unloadMedia = function() {
	
	this.pause( false );
	
	if( this instanceof ERS.Video )
	{
		ERS.DOM.video.style.display = "none";
		this._mediaDOMObject.src = "";
		this._mediaDOMObject.load();
	}
	
	ERS.moduleData.activateNextScreenInBuffer();
};

// ---- parent play function ----
ERS.MediaPlayer.prototype.play = function() {
	
	// change the play button into a pause button
	$( "#" + ERS.DOM.playPauseButton.id ).switchClass( "play", "pause" );
	
	// use the old time (for resuming playback)
	if( this._mediaDOMObject.readyState > 0 )
		this._mediaDOMObject.currentTime = this._currentTime;
	this._mediaDOMObject.play();
	
	this._isPlaying = true;
};
// ---- parent pause function ----
ERS.MediaPlayer.prototype.pause = function( a_effectUI ) {
	
	if( a_effectUI != false )
	{
		// change the pause button into a play button
		$( "#" + ERS.DOM.playPauseButton.id ).switchClass( "pause", "play" );
	}
	
	// save the media's current time (for resuming)
	this._currentTime = this._mediaDOMObject.currentTime;
	// pause the audio/video element
	this._mediaDOMObject.pause();
	
	this._isPlaying = false;
};

// ---- reset this MediaPlayer object as if it is being played for the first time ----
ERS.MediaPlayer.prototype.reset = function() {
	this._currentTime = 0;
	if( this._mediaDOMObject.readyState > 0 )
		this._mediaDOMObject.currentTime = 0;
		
	ERS.DOM.scrubber.style.width = "0px";
	var baseName = ERS.moduleData.getBaseScreenObject().getScreenName();
		if( !(this._screenRef instanceof ERS.HelpScreen || (this._screenRef instanceof ERS.PopupScreen && !( baseName == "M2L2S02" || baseName == "M2L3S02" || baseName == "M2L3S09" || baseName == "M2L3S14" || baseName == "M2L4S08"  || baseName == "M2L4S14" )) ) )
	//if( !(this._screenRef instanceof ERS.HelpScreen || this._screenRef instanceof ERS.PopupScreen) )
		this.loadMedia();	
	
	if( this._animatorRef != null )
		this._animatorRef.timeReset();
};

// ---- called on every ontimeupdate for this MediaPlayer's media DOM object ----
ERS.MediaPlayer.prototype.timeUpdate = function() {
	
	//if( !this._isPlaying )
	//	return;
	
	// keep track of the current time
	this._currentTime = this._mediaDOMObject.currentTime;
	// determine if the audio/video element is finished
	if( this._mediaDOMObject.ended )
	{
		this._ended = true;
		
		// make sure the scrubber is sitting at the end of the bar
		var scrubberWidth = $( "#" + ERS.DOM.scrubberBackground.id ).width();
		ERS.DOM.scrubber.style.width = ((scrubberWidth * .01) * 100) + "px";
		
		this.pause();
		return;
	}
	
	this._ended = false;
	
	// set the scrubber according to the current time
    var progress_percent = Math.ceil( this._mediaDOMObject.currentTime / this._mediaDOMObject.duration * 100);
	var scrubberWidth = $( "#" + ERS.DOM.scrubberBackground.id ).width();
	ERS.DOM.scrubber.style.width = ((scrubberWidth * .01) * progress_percent) + "px";
};

// ---- called when the scrubber is clicked/touched, scrubs to the selected time in the media ----
ERS.MediaPlayer.prototype.scrubberTouched = function( e ) {
	// because we are making a sudden change in the currentTime, animator needs to make a full reset (unlike the media player)
	if( this._animatorRef != null )
		this._animatorRef.timeReset();
	
	var scrubberWidth = $( "#" + ERS.DOM.scrubberBackground.id ).width();
	var percentToSet = (e.offsetX / scrubberWidth);
	this._mediaDOMObject.currentTime = percentToSet * this._mediaDOMObject.duration;
};

ERS.MediaPlayer.prototype.getMediaDOM = function() {
	return this._mediaDOMObject;
};