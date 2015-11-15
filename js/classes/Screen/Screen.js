/*
	--- Screen class ----
	
	Instance of a screen in the module
		- an instance of this class holds one screen's data in the module
		- controls "screen loading", or loading the HTML/audio/video data to the view (the 'content' DOM object in index.html)
		- controls audio/video playing through it's member MediaPlayer object
*/

// use the ERS namespace for all code
var ERS = ERS || {};


// ---- Screen constructor ----
ERS.Screen = function( a_params ) {
	
	// save all data handed in through the parameters
	this._screenName = a_params.screenName;       // the name of this screen (ex: M1L1S01)
	this._screenTitle = a_params.screenTitle != null ? a_params.screenTitle : "";     // the title for this screen
	
	// determine the html file path on the server
	var rawScreensPath = MEDIA_SCREENS_PATH + "/" + this._screenName + "/";
	this._htmlPath = rawScreensPath + this._screenName + ".html";
	// determine the media file path on the server
	this._mediaPath = a_params.mediaName ? MEDIA_AUDIO_PATH + "/" + a_params.mediaName : "";
	
	// save whether this screen has an animation
	this._animationFileExists = (a_params.hasAnimation == true);
	// this Screen's div container id (the element which will contain this Screen's HTML)
	this._divContainerId = this._screenName + "_container";
	// IF this screen has an animation, create a member Animator object (otherwise null)
	this._animator = this._animationFileExists ? new ERS.Animator( this, this._divContainerId ) : null;
	
	// does this screen have a video? true/false
	this._screenHasVideo = this._determineAudioOrVideo();
	// create the member MediaPlayer object (audio or video)
	this._mediaPlayer = this._screenHasVideo ? new ERS.Video( this._mediaPath, this._animator ) : new ERS.Audio( this._mediaPath, this._animator, this );
	
	// assign the proper assessment object for this screen, null if no assessment exists for this screen
	this._assessment;
	if( this instanceof ERS.Screen )
		this._assessment = this._parseAssessmentType( a_params.assessmentType, a_params.assessmentOptions );
	
	// parse a_popupXML and create list of popup Screens
	this._popupList = [];
	if( a_params.popupXML != null )
		this._popupList = this._parsePopupData( a_params.popupXML );
	
	// list of Button objects associated with this screen
	this._buttonList = [];
	
	// where this screen should load its content
	this._loadDOM = ERS.DOM.content;
	// holds a reference to this screen's container element
	this._containerDOM; 
	// the background image's URL
	this._backgroundImageURL = rawScreensPath + this._screenName + ".png";
	
	// set any remaining settings based on the screen's 'type'
	if( a_params.screenType )
		this._parseScreenType( a_params.screenType );
};

// ---- loads the moduleData's current screen HTML into the index ----
ERS.Screen.prototype.loadScreen = function() {
	var classRef = this;
	
	// load this screen to the z-buffer
	ERS.moduleData.pushScreenToZBuffer( this );
	
	// do some base Screen specific logic on load
	if( this instanceof ERS.Screen )
	{
		// dim certain UI elements if this screen has no media
		if( this._mediaPath == "" )
			this._dimUI( true );
		else
			this._dimUI( false );
			
		// load the screen's title
		ERS.DOM.title.innerHTML = this._screenTitle;
	}
	else
	{
		// stop media on any under-lying screens 
		ERS.moduleData.pauseMediaOnExistingScreens();
	}
	
	// create this Screen's container
	var contentDivHTML = CONTENT_DIV_HTML;
	contentDivHTML = contentDivHTML.replace( "ID_REPLACE", this._divContainerId );
	// set this screen's z-index
	var z = ERS.moduleData.getZBufferLength();
	if( z > 1 || this instanceof ERS.ReturnScreen ) z += POPUP_MIN_Z_INDEX;
	contentDivHTML = contentDivHTML.replace( "Z_REPLACE", z );
	// prepend this screen's HTML container
	//$( "#" + ERS.DOM.content.id ).prepend( contentDivHTML );
	$( this._loadDOM ).prepend( contentDivHTML );
	// save where we will be loading this Screen's content
	this._containerDOM = document.getElementById( this._divContainerId );
	
	// load this screen's HTML into the previously created container, initialize the screen when done loading
	$( "#" + this._containerDOM.id ).load( this._htmlPath, function() {

		classRef._loadScreenComplete( this );

	});
};

// ---- called when the animator has finished it's AJAX GET request ----
ERS.Screen.prototype.animatorGetRequestComplete = function() {

	// reset the media player (in case it was already played)
	this._mediaPlayer.reset();

	// don't play the audio on load for the glossary or if there is no media
	if( this instanceof ERS.GlossaryScreen || this._mediaPath == "" )
		return;
	
	if( this._mediaPlayer != null )
	{
		this._mediaPlayer.loadMedia();
		// begin playing the audio/video
		this._mediaPlayer.play();
	}
};

ERS.Screen.prototype.unloadScreen = function() {
	// if this screen played audio, don't leave a visual foot-print of it
	ERS.DOM.scrubber.style.width = "0px";
	// remove the screen from the zBuffer
	ERS.moduleData.removeScreenFromZBuffer( this );
	// remove the visual content from the DOM
	$( "#" + this._divContainerId ).remove();
	// unload media player content
	this._mediaPlayer.unloadMedia();
};

// ---- fired from the ontimeupdate event ----
ERS.Screen.prototype.timeUpdate = function( a_mediaDOMObject ) {
	if( this._animator != null )
		this._animator.timeUpdate( a_mediaDOMObject );
	
	this._mediaPlayer.timeUpdate();
};
// ---- gets this Screen's MediaPlayer object ----
ERS.Screen.prototype.getMediaPlayer = function() {
	return this._mediaPlayer;
};

// ---- screen data getters ----
ERS.Screen.prototype.getScreenHTMLPath = function() {
	return this._htmlPath;
};
ERS.Screen.prototype.getScreenAudioPath = function() {
	return this._audioPath;
};
ERS.Screen.prototype.getScreenTitle = function() {
	return this._screenTitle;
};
ERS.Screen.prototype.getScreenName = function() {
	return this._screenName;
};
ERS.Screen.prototype.screenHasVideo = function() {
	return this._screenHasVideo;
};
ERS.Screen.prototype.getMediaPlayer = function() {
	return this._mediaPlayer;
};
ERS.Screen.prototype.getDivContainerId = function() {
	return this._divContainerId;
};
ERS.Screen.prototype.getPopupByName = function( a_name ) {
	
	for( var i = 0; i < this._popupList.length; i++ )
	{
		if( a_name == this._popupList[i].getScreenName() )
			return this._popupList[i];
	}
};
ERS.Screen.prototype.getAssessment = function() {
	return this._assessment;
};
ERS.Screen.prototype.getButtonsByType = function( a_type ) {
	var returnList = [];
	for( var i = 0; i < this._buttonList.length; i++ )
	{
		if( this._buttonList[i].isType( a_type ) )
			returnList.push( this._buttonList[i] );
	}
	
	return returnList;
};

ERS.Screen.prototype.getButtonById = function( a_id ) {
	for( var i = 0; i < this._buttonList.length; i++ )
	{
		if( this._buttonList[i].getId() == a_id )
			return this._buttonList[i];
	}
	
	return null;
}


// ---- Helper Functions ---- //
// -------------------------- //

// ---- called when jQuery's 'load' function in the loadScreen function completes ----
// - a_DOMRef: holds a reference to the DOM object that this Screen has loaded into
ERS.Screen.prototype._loadScreenComplete = function( a_DOMRef ) {

	// prepend this screens background image to its HTML content
	if( this._backgroundImageURL != null )
	{
		var backgroundImageHTML = BACKGROUND_IMAGE_HTML;
		backgroundImageHTML = backgroundImageHTML.replace( "SRC_REPLACE", this._backgroundImageURL );
		$(a_DOMRef).prepend( backgroundImageHTML );
	}
	
	this._buildButtons();
	
	if( this._assessment != null )
	{
		this._assessment.reset();
		this._assessment.init();
	}
	
	// get the animation data for the screen if we need it
	if( this._animator != null )
	{
		// when the _animator.getXMLData call completes, animatorGetRequestComplete() is called (plays media, etc.)
		this._animator.getXMLData();
	}
	else
	{
		// there is no animator, just call the completion function anyway as if the Animator existed
		this.animatorGetRequestComplete();
	}
};

// ---- determines if a screen has a video given the media file path ----
// - returns true if screen contains a video, false otherwise
ERS.Screen.prototype._determineAudioOrVideo = function() {
	// get the extension on the end of the file
	var fileExtensionLength = this._mediaPath.length - this._mediaPath.indexOf( "." );
	var fileExtension = this._mediaPath.substring( this._mediaPath.length-fileExtensionLength, this._mediaPath.length );
	
	// if the 'audio' file is actually a video, return true
	for( var i = 0; i < VIDEO_EXTENSION_TYPES.length; i++ )
	{
		if( fileExtension == "." + VIDEO_EXTENSION_TYPES[i] )
			return true;
	}
	
	// otherwise, it is an audio file (or no media file, treat it like an empty audio file)
	return false;
};

// ---- parses this Screen's popup XML data, returns a list of PopupScreen objects ----
ERS.Screen.prototype._parsePopupData = function( a_popupData ) {
	
	// return an empty list if there is no data
	if( a_popupData == null || $( a_popupData ).length < 1 )
		return [];
	
	var classRef = this;
	var returnList = [];
	$( a_popupData ).each( function() {
		var name = $.trim( $(this).children( "name" ).text() );
		var mediaName = $.trim( $(this).children( "mediaName" ).text() );
		var type = $.trim( $(this).children( "type" ).text() );
		
		var popupScreen;
		// determine what type of popup it is, construct accordingly
		switch( type )
		{
			// -- TODO --
			// the "hasAnimation" parameter is being set to false, implement/check if it has one later
			case "flash":
				popupScreen = new ERS.FlashScreen( name, mediaName, false, classRef._screenName );
				break;
			default:
				popupScreen = new ERS.PopupScreen( name, mediaName, false, classRef._screenName );
				break;
		}
		
		// push the new popup into the return list
		returnList.push( popupScreen );
	});
	
	return returnList;
};

// ---- find each button in this Screen's HTML, and make it function properly ----
ERS.Screen.prototype._buildButtons = function() {
	var classRef = this;
	$( "#" + this._divContainerId ).find( ".button" ).each( function() {
		
		var button = new ERS.Button( this, ERS.moduleData.getScreenZBufferHeight( classRef ) );
		
		classRef._buttonList.push( button );	
	});
};

ERS.Screen.prototype._parseScreenType = function( a_type ) {
	switch( a_type )
	{
		case "":
			break;
		case "splash":
			this._loadDOM = ERS.DOM.contentBG;
			break;
	}
};

ERS.Screen.prototype._parseAssessmentType = function( a_type, a_options ) {
	switch( a_type )
	{
		case "multiple":
			return new ERS.MultipleChoice( this, a_options );
		case "dragAndDrop":
			return new ERS.DragAndDrop( this, a_options );
		default:
			return null;
	}
};

// ---- visually 'dims' certain UI elements based on the a_dim boolean ----
ERS.Screen.prototype._dimUI = function( a_dim ) {
	
	var newClass = a_dim ? "off" : "on";
	var oldClass = newClass == "on" ? "off" : "on";
	
	$( "#" + ERS.DOM.playPauseButton.id ).switchClass( oldClass, newClass );
	$( "#" + ERS.DOM.refreshButton.id ).switchClass( oldClass, newClass );
	
	ERS.DOM.scrubberBackground.style.display = a_dim ? "none" : "inherit";
};