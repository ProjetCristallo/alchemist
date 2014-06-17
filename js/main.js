/* Generate the world in function of the platform (different world size and 
 * layout depending of the use of cordova -> usage of the larger screen of
 * the mobile */ 
if(constants.USE_CORDOVA){
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
var endScreenTuto;

/** Booleans indicating the game's state
  */
var tutoriel = false;

/** Last direction the ball has taken, useful for the turn blocks
  */
var lastDir=null;

/**Scores to get two or three stars (usage : for 2 stars array[0], 
  * for 3 array[1]).
  */ 
var starsNumber = [];


/** Button and screen used for displaying help :
  * - helpScreens : the different help screens spritesheet.
  * - buttonNext : the button to go to the next page.
  * - buttonPrev : the butotn to go to the previous page.
  * - posInHelp : the current position in the help pages.
  * - posText : the text indicating the index of the current page.
  */
var helpStruct={helpScreens:[],buttonNext:null,buttonPrev:null,posInHelp:null,
	posText:null};

/** Boolean indicating if the player is allowed to play. 
  */
var playing=false;

/** variable to manage the levels and select level screen.
  * - nbrLevel : number of level.
  * - nbLevelAccessible : number of level unlocked.
  * - numPageCourant : number of current page in select level screen.
  * - nbrPageTotal : total number of pages in select level screen.
  * - currentLevel : current level used.
  */
var levelStruct={nbrLevel:1,nbrLevelAccessible:0,numPageCourant:1,
	nbrPageTotal:1,currentLevel:1};

/** variable to manage the tutorial levels.
  * - nbrLevelTuto : number of level in the tutorial.
  * - currentLevelTuto : current level used in the tutorial.
  * - nbrScreenTuto : number of help screens displayed in the tutorial.
  * - tutoScreens : help screens from the tutorial.
  * - posInTuto : position in the help screens from the tutorial.
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
  * - hole : group of 'hole' sprites.
  * - simple : groupe of 'simple' sprites.
  * - unilateral : groupe of 'unilateral' sprites.
  * - breakable : group of 'breakable' sprites.
  * - salt : group of 'salt' sprites.
  * - porous : group of 'porous' sprites.
  * - end : group of 'end' sprites.
  * - item : group of 'items' sprites.
  * - turn : group of 'turn sprites
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
	if(constants.USE_CORDOVA){
		game.load.image('taskBar',constants.taskBarSmartphoneUrl);
	}else{
		game.load.image('taskBar',constants.taskBarUrl);
	}
	game.load.image('nextPage',constants.nextPageUrl);
	game.load.image('prevPage',constants.prevPageUrl);
	
	game.load.spritesheet('buttonPlay',constants.buttonPlayUrl,133,35);
	game.load.spritesheet('buttonSelectLevel',
			constants.buttonSelectLevelUrl, 133, 35);
	game.load.spritesheet('buttonTutorial',
			constants.buttonTutorialUrl, 140, 35);
	game.load.spritesheet('buttonReturn',
			constants.buttonReturnUrl, 133, 35);
	game.load.spritesheet('buttonNextLevel',
			constants.buttonNextLevelUrl,400/3,35);
	game.load.spritesheet('buttonReplay',
			constants.buttonReplayUrl,400/3,35);
	game.load.spritesheet('buttonNextImage',
			constants.buttonNextImageUrl,25,50);
	game.load.spritesheet('buttonPrevImage',
			constants.buttonPrevImageUrl,25,50);
	game.load.spritesheet('buttonCloseImage',
			constants.buttonCloseImageUrl,35,35);
	game.load.spritesheet('soundButton', constants.soundButtonUrl, 80, 80);
	game.load.image('buttonHelp', constants.buttonHelpUrl,80,80);
	game.load.image('buttonRestart', constants.buttonRestartUrl,80,80);
	game.load.spritesheet('mainMenuButton', 
			constants.mainMenuButtonUrl,100,80);
	game.load.spritesheet('yes', constants.buttonYesUrl,400/3,35);
	game.load.spritesheet('no', constants.buttonNoUrl,400/3,35);
	game.load.spritesheet('buttonNextTuto',
			constants.buttonNextTutoUrl,133,35);
        game.load.spritesheet('buttonCloseTuto',
			constants.buttonCloseTutoUrl,133,35);
	
	//=======================================
	// Backgrounds
	//=======================================
	game.load.image('fond',constants.fondUrl);
	game.load.image('win',constants.winUrl);
	game.load.image('fail',constants.failUrl);
	game.load.image('levelInaccessible',constants.levelInaccessibleUrl);
	game.load.image('endScreen',constants.endScreenUrl);
        game.load.image('endScreenTuto',constants.endScreenTutoUrl);
	game.load.spritesheet('stars',constants.starsUrl,100,25);
	game.load.image('areYouSure', constants.areYouSureUrl, 320, 240);
	
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
	game.load.spritesheet('breakable',constants.breakableUrl,60,60);
	game.load.spritesheet('salt',constants.saltUrl,60,60);

	//=======================================
	// Ball and energy items
	//=======================================
	game.load.spritesheet('ball',constants.ballUrl,60,60);
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
	game.load.audio('salted',constants.saltSoundUrl); 
	game.load.audio('block',constants.blockSoundUrl); 
	game.load.audio('glass', constants.glassSoundUrl );
	game.load.audio('drop', constants.dropSoundUrl );
	game.load.audio('gaz', constants.gazSoundUrl );
	
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
