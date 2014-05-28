function parser(filename) {
	var file = new ActiveXObject("Scripting.FileSystemObject");
	var f_in = file.OpenTextFile(filename,1);
	while (!f_in.AtEndOfStream) {
		var block;
		var line = f_in.ReadLine();
		var res = line.split(" ");
		x = 30+60*parseInt(res[1]);
		y = 30+60*parseInt(res[2]);
		switch(res[0]) {
			case "begin":
				Ball = game.add.sprite(x,y,'logo');
				Ball.anchor.setTo(0.5,0.5);
				Ball.checkWorldBounds = true;
				game.physics.enable(Ball,Phaser.Physics.ARCADE);
				Ball.body.collideWorldBounds = true;
				BallMoving = false;
				break;
			case "end":
				break;
			case "hole":
				block = Hole.create(x,y,'hole');
				game.physics.enable(block,Phaser.Physics.ARCADE);
				block.body.immovable = true;
				break;
			case "simple":
				block = Simple.create(x,y,'simple');
				game.physics.enable(block,Phaser.Physics.ARCADE);
				block.body.immovable = true;
				break;
			case "unilateral":			
				switch(res[3]) {
					case "up":
						block = Unilateral.create(x,y,'u_up');
						block.body.checkCollision.up = false;
						break;
					case "down":
						block = Unilateral.create(x,y,'u_d');
						block.body.checkCollision.down = false;
						break;
					case "right":
						block = Unilateral.create(x,y,'u_r');
						block.body.checkCollision.right = false;
						break;
					case "left":
						block = Unilateral.create(x,y,'u_l');
						block.body.checkCollision.left = false;
						break;
				}
				game.physics.enable(block,Phaser.Physics.ARCADE);
				block.body.immovable = true;
				break;
			case "fragile":
				block = Fragile.create(x,y,'fragile');
				block.health = parseInt(res[3]);
				game.physics.enable(block,Phaser.Physics.ARCADE);
				block.body.immovable = true;
				break;
			case "change_up":
				block = C_up.create(x,y,'c_up');
				game.physics.enable(block,Phaser.Physics.ARCADE);
				block.body.immovable = true;
				break;
			case "change_down":
				block = C_down.create(x,y,'c_down');
				game.physics.enable(block,Phaser.Physics.ARCADE);
				block.body.immovable = true;
				break;
			case "change_right":
				block = C_right.create(x,y,'c_right');
				game.physics.enable(block,Phaser.Physics.ARCADE);
				block.body.immovable = true;
				break;
			case "change_left":
				block = C_left.create(x,y,'c_left');
				game.physics.enable(block,Phaser.Physics.ARCADE);
				block.body.immovable = true;
				break;
		}
	}
}
