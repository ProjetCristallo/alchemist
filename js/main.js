/* Generate the world in function of the platform (different world size and 
 * layout depending of the use of cordova -> usage of the larger screen of
 * the mobile */ 
if(constants.USE_CORDOVA || constants.IS_MOBILE){
	var game = new Phaser.Game(constants.BACKGROUND_WIDTH + 
			constants.TASKBAR_WIDTH, constants.BACKGROUND_HEIGHT,
			Phaser.AUTO, '', {preload:preload,create:createMenu,
				update:update});
}else{
	var game = new Phaser.Game(constants.BACKGROUND_WIDTH,
			constants.BACKGROUND_HEIGHT + constants.TASKBAR_HEIGHT,
			Phaser.AUTO,'', {preload:preload,create:createMenu,
				update:update});
}

/** Sprite representing the ball the user play with.
  */
var ball;
/** Sprite representing the taskBar background.
  */
var taskBarSprite;
/** Sprite representing the goal of each level
  */
var endSprite;
/** Sprite representing the endscreen background
  */
var endScreen;

/** Sprite representing the endscreen background for the tutorial
  */
var endScreenTuto;

/** Booleans indicating the game's state
  */
var tutorial = false;

/** Last direction the ball has taken, useful for the turn blocks
  */
var lastDir=null;

/**Scores to get two or three stars (usage : for 2 stars array[0], 
  * for 3 array[1]).
  */ 
var starsNumber = [];


/** Button and screen used for displaying help :
  *<p> - helpScreens : the different help screens spritesheet.</p>
  *<p> - buttonNext : the button to go to the next page.</p>
  *<p> - buttonPrev : the butotn to go to the previous page.</p>
  *<p> - posInHelp : the current position in the help pages.</p>
  *<p> - posText : the text indicating the index of the current page.</p>
  */
var helpStruct={helpScreens:[],buttonNext:null,buttonPrev:null,posInHelp:null,
	posText:null};

/** Boolean indicating if the player is allowed to play. 
  */
var playing=false;

/** variable to manage the levels and select level screen.
  *<p> - nbrLevel : number of level.</p>
  *<p> - nbLevelAccessible : number of level unlocked.</p>
  *<p> - numPageCourant : number of current page in select level screen.</p>
  *<p> - nbrPageTotal : total number of pages in select level screen.</p>
  *<p> - currentLevel : current level used.</p>
  */
var levelStruct={nbrLevel:1,nbrLevelAccessible:0,numPageCourant:1,
	nbrPageTotal:1,currentLevel:1};

/** variable to manage the tutorial levels.
  *<p> - nbrLevelTuto : number of level in the tutorial.</p>
  *<p> - currentLevelTuto : current level used in the tutorial.</p>
  *<p> - nbrScreenTuto : number of help screens displayed in the tutorial.</p>
  *<p> - tutoScreens : help screens from the tutorial.</p>
  *<p> - posInTuto : position in the help screens from the tutorial.</p>
  */
var tutoStruct={nbrLevelTuto:1,currentLevelTuto:1,nbrScreenTuto:[],
	tutoScreens:[],posInTuto:0};


//Swipe handling

var element = document.body;

/** Last direction chosen by the user (mobile use unly)
  */
var swipe = null;
Hammer(element).on("swipeleft", function(event) {
	swipe='left';
});
Hammer(element).on("swiperight", function(event) {
	swipe='right';
});
Hammer(element).on("swipedown", function(event) {
	swipe='down';
});
Hammer(element).on("swipeup", function(event) {
	swipe='up';
});

/** variable managing all the blocks groups of the world.
  *<p> - hole : group of 'hole' sprites.</p>
  *<p> - simple : groupe of 'simple' sprites.</p>
  *<p> - unilateral : groupe of 'unilateral' sprites.</p>
  *<p> - breakable : group of 'breakable' sprites.</p>
  *<p> - salt : group of 'salt' sprites.</p>
  *<p> - porous : group of 'porous' sprites.</p>
  *<p> - end : group of 'end' sprites.</p>
  *<p> - item : group of 'items' sprites.</p>
  *<p> - turn : group of 'turn sprites.</p>
  */
var blockGroups={hole:null,simple:null,unilateral:null,breakable:null,
	salt:null,porous:null,end:null,item:null,turn:null};

/** score of the current level. */
var score;

/** Boolean indicating if the music is on or off. */
var mute = false;

/** boolean indicating if the title and the startup background have already been
  * loaded. */
var progressPageLoaded = false;
/** text displayed during the loading. */
var progressInfo =null;

/** Display the background and the title of the main menu.
  */
function displayBackgroundAndTitle(){
        mainMenuSprite = game.add.sprite(0, 0, 'mainMenuSprite');
        title = game.add.sprite(0.5*constants.BACKGROUND_WIDTH,
                        0.3*constants.BACKGROUND_HEIGHT, 'title');
        title.anchor={'x':0.5,'y':0.5};
}



/** Create and update the display of the loading screen.
  */
function updateProgress(){
	if(progressInfo==null){
		progressInfo = game.add.text(0.5*constants.BACKGROUND_WIDTH,
				0.7*constants.BACKGROUND_HEIGHT,"0 %",
				{ font: "65px Arial", align: "center" });
		progressInfo.anchor={'x':0.5,'y':0.5};
	}
	if(!progressPageLoaded && game.cache.checkImageKey('mainMenuSprite') &&
			game.cache.checkImageKey('title')) 
	{
		displayBackgroundAndTitle();
		progressInfo = game.add.text(0.5*constants.BACKGROUND_WIDTH,
				0.7*constants.BACKGROUND_HEIGHT,"0 %",
				{ font: "65px Arial", align: "center" });
		progressInfo.anchor={'x':0.5,'y':0.5};
		progressPageLoaded = true;
	}
	progressInfo.text = game.load.progress+" %";
};

/** Load every ressources (images, cookie, levels).
  */
function preload(){

	//=======================================
	// Main menu
	//=======================================
	game.load.image('mainMenuSprite',constants.mainMenuSpriteUrl);
	game.load.image('title',constants.titleUrl);
	
	//=======================================
	// Buttons
	//=======================================
	if(constants.USE_CORDOVA || constants.IS_MOBILE){
		game.load.image('taskBar',constants.taskBarSmartphoneUrl);
	}else{
		game.load.image('taskBar',constants.taskBarUrl);
	}
	game.load.image('nextPage',constants.nextPageUrl);
	game.load.image('prevPage',constants.prevPageUrl);
	
	game.load.spritesheet('buttonPlay',constants.buttonPlayUrl,
		constants.BUTTON_WIDTH, constants.BUTTON_HEIGHT);
	game.load.spritesheet('buttonSelectLevel',
			constants.buttonSelectLevelUrl, 
			constants.BUTTON_WIDTH, constants.BUTTON_HEIGHT);
	game.load.spritesheet('buttonTutorial',
			constants.buttonTutorialUrl, 
			constants.BUTTON_WIDTH, constants.BUTTON_HEIGHT);
	game.load.spritesheet('buttonReturn',
			constants.buttonReturnUrl, 
			constants.BUTTON_WIDTH, constants.BUTTON_HEIGHT);
	game.load.spritesheet('buttonNextLevel',
			constants.buttonNextLevelUrl,
			constants.BUTTON_WIDTH, constants.BUTTON_HEIGHT);
	game.load.spritesheet('buttonReplay',
			constants.buttonReplayUrl,
			constants.BUTTON_WIDTH, constants.BUTTON_HEIGHT);
	game.load.spritesheet('buttonNextImage',
			constants.buttonNextImageUrl,
			constants.ARROWS_WIDTH,constants.ARROWS_HEIGHT);
	game.load.spritesheet('buttonPrevImage',
			constants.buttonPrevImageUrl,
			constants.ARROWS_WIDTH,constants.ARROWS_HEIGHT);
	game.load.spritesheet('buttonCloseImage',
			constants.buttonCloseImageUrl,
			constants.CLOSE_WIDTH, constants.CLOSE_HEIGHT);
	game.load.spritesheet('soundButton', constants.soundButtonUrl, 
		constants.TASKBAR_BUTTON_WIDTH, constants.TASKBAR_BUTTON_HEIGHT);
	game.load.image('buttonHelp', constants.buttonHelpUrl,
		constants.TASKBAR_BUTTON_WIDTH, constants.TASKBAR_BUTTON_HEIGHT);
	game.load.image('buttonRestart', constants.buttonRestartUrl,
		constants.TASKBAR_BUTTON_WIDTH, constants.TASKBAR_BUTTON_HEIGHT);
	game.load.spritesheet('mainMenuButton', 
			constants.mainMenuButtonUrl,
			constants.TASKBAR_MENU_WIDTH, constants.TASKBAR_MENU_HEIGHT);
	game.load.spritesheet('yes', constants.buttonYesUrl,
	constants.BUTTON_WIDTH, constants.BUTTON_HEIGHT);
	game.load.spritesheet('no', constants.buttonNoUrl,
	constants.BUTTON_WIDTH, constants.BUTTON_HEIGHT);
	game.load.spritesheet('buttonNextTuto',
			constants.buttonNextTutoUrl,
			constants.BUTTON_WIDTH, constants.BUTTON_HEIGHT);
        game.load.spritesheet('buttonCloseTuto',
			constants.buttonCloseTutoUrl,
			constants.BUTTON_WIDTH, constants.BUTTON_HEIGHT);
	
	//=======================================
	// Backgrounds
	//=======================================
	game.load.image('fond',constants.fondUrl);
	game.load.image('win',constants.winUrl);
	game.load.image('fail',constants.failUrl);
	game.load.image('levelInaccessible',constants.levelInaccessibleUrl);
	game.load.image('endScreen',constants.endScreenUrl);
    game.load.image('endScreenTuto',constants.endScreenTutoUrl);
	game.load.spritesheet('stars',constants.starsUrl,
		constants.STARS_WIDTH, constants.STARS_HEIGHT);
	game.load.image('areYouSure', constants.areYouSureUrl);
	
	//=======================================
	// Blocks
	//=======================================
	game.load.image('simple',constants.simpleUrl);
	game.load.image('end',constants.endUrl);
	game.load.image('hole',constants.holeUrl);
	game.load.image('uniRight',constants.uniRightUrl);
	game.load.image('uniUp',constants.uniUpUrl);
	game.load.image('uniDown',constants.uniDownUrl);
	game.load.image('uniLeft',constants.uniLeftUrl);
	game.load.image('turnUL',constants.turnULUrl);
	game.load.image('turnUR',constants.turnURUrl);
	game.load.image('turnDL',constants.turnDLUrl);
	game.load.image('turnDR',constants.turnDRUrl);
	game.load.image('porous',constants.porousUrl);	
	game.load.spritesheet('breakable',constants.breakableUrl,
		constants.TILE_SIZE, constants.TILE_SIZE);
	game.load.spritesheet('salt',constants.saltUrl,
		constants.TILE_SIZE, constants.TILE_SIZE);

	//=======================================
	// Ball and energy items
	//=======================================
	game.load.spritesheet('ball',constants.ballUrl,
		constants.TILE_SIZE, constants.TILE_SIZE);
	game.load.image('energyUp',constants.energyUpUrl);
	game.load.image('energyDown',constants.energyDownUrl);
	
	//=======================================
	// Select levels
	//=======================================
	game.load.image('levelA',constants.levelAUrl);
	game.load.image('levelI',constants.levelIUrl);	
	
	//=======================================
	// Help screen
	//=======================================
	for (var i = 1; i <= constants.NUMBER_OF_HELP_SCREEN; i ++){
		game.load.image('helpScreen' + i,
				constants.helpScreenUrl[i - 1]);
	}
	
	//=======================================
	// Sounds
	//=======================================
	game.load.audio('salted',[constants.saltSoundMP3Url,constants.saltSoundOGGUrl] ); 
	game.load.audio('block',[constants.blockSoundMP3Url, constants.saltSoundOGGUrl]); 
	game.load.audio('glass', [constants.glassSoundMP3Url, constants.saltSoundOGGUrl] );
	game.load.audio('drop', [constants.dropSoundMP3Url, constants.saltSoundOGGUrl] );
	game.load.audio('gaz', [constants.gazSoundMP3Url, constants.saltSoundOGGUrl] );
	//game.load.audio('lost', [constants.lostSoundMP3Url, constants.saltSoundOGGUrl] );
	
	game.load.onFileComplete.add(updateProgress, this);
	
	// The first level is supposed to be always accessible, so it's usable
	// to determine the valueOk.
	var valueOk = loadValueOk("levels/1.txt");

	// In case the previous assumption was false, we have to define a upper
	// bound to the number of level to avoid an infinite loop.
	while (doesFileExist("levels/"+levelStruct.nbrLevel+".txt",valueOk) && 
			levelStruct.nbrLevel < 500){
		levelStruct.nbrLevel++;
	}
	if(levelStruct.nbrLevel == 500){
		levelStruct.nbrLevel = 0;
	}else{
		levelStruct.nbrLevel--;
	}
	levelStruct.nbrPageTotal = parseInt(1 + (levelStruct.nbrLevel - 1) / 9);

        //Number of tutorial levels
	// In case the previous assumption was false, we have to define a upper
	// bound to the number of level to avoid an infinite loop.
        while (doesFileExist("tutorial/"+tutoStruct.nbrLevelTuto+".txt",
				valueOk) && 
			tutoStruct.nbrLevelTuto < 500){
		tutoStruct.nbrLevelTuto++;
	}
	if(tutoStruct.nbrLevelTuto == 500){
		tutoStruct.nbrLevelTuto = 0;
	}else{
		tutoStruct.nbrLevelTuto--;
	}

        //Number of tutorial screens for each tutorial levels
    for (var i=1; i <= tutoStruct.nbrLevelTuto; i++){
	tutoStruct.nbrScreenTuto[i - 1] = 1;
	while (doesFileExist("ressources/tutorial/tutorial"+i+"-"+
				tutoStruct.nbrScreenTuto[i - 1]+".png",
				valueOk) && 
	       tutoStruct.nbrScreenTuto[i - 1] < 500){
	    game.load.image('tutorial'+i+"-"+tutoStruct.nbrScreenTuto[i - 1],
			    "ressources/tutorial/tutorial"+i+"-"+
			    tutoStruct.nbrScreenTuto[i - 1]+".png");
	    tutoStruct.nbrScreenTuto[i - 1]++;
	}
	if(tutoStruct.nbrScreenTuto[i - 1] == 500){
	    tutoStruct.nbrScreenTuto[i - 1] = 0;
	}else{
	    tutoStruct.nbrScreenTuto[i - 1]--;
	}
    }
	//Number of levels already unlocked
	if(constants.USE_CORDOVA){
		stars = window.localStorage.getItem("cookieSmartphone");
		if(stars == null){
			levelStruct.nbrLevelAccessible=1;
		}else{
			levelStruct.nbrLevelAccessible = stars.length+1;
		}
	}else{
		levelStruct.nbrLevelAccessible = readCookie("levelmax");
		if (levelStruct.nbrLevelAccessible == null) {
			levelStruct.nbrLevelAccessible = 1;
		}
	}	

	//Cookie containing the scores for each level 
	if(constants.USE_CORDOVA){
		stars = window.localStorage.getItem("cookieSmartphone");
		if(stars == null){
			window.localStorage.setItem("cookieSmartphone","");
		}
	}else{
		stars = readCookie("stars");
		if (stars == null) {
			createCookie("stars", "", 30);
		}
	}
}

/** Return the value obtain when trying to open the file, this function is 
  * useful for different system returning different value when the request is
  * successful (0 on iOs, 200 on Android and Desktop for example).
  * @param {string} filename Name of a file (if you want this function to be 
  * useful make sure this file exists).
  * @return {int} The value returned by an XML request on filename.
  */
function loadValueOk(filename)
{
	if(document.all) {
		var xhr = new ActiveXObject("Scripting.FileSystemObject");
	}
	else
	{
		var xhr = new XMLHttpRequest();
	}
	xhr.open('HEAD', filename, false);
	xhr.send();
	return xhr.status;
}

/** Check if a file exist.
  * @param {string} urlToFile The file to test.
  * @param {int} valueOk The expected return of a successful XML request.
  * @return {boolean} The result of the test (true = the file exists).
  */
function doesFileExist(urlToFile, valueOk)
{
	if(document.all) {
		var xhr = new ActiveXObject("Scripting.FileSystemObject");
	}
	else
	{
		var xhr = new XMLHttpRequest();
	}
	xhr.open('HEAD', urlToFile, false);
	xhr.send();
	if (xhr.status == valueOk) {
		return true;
	} else {
		return false;
	}
}
