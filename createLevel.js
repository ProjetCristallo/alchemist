function createLevel()
{
        chaine1 = "levels/";
        chaine2 = current_level;
        chaine3 = ".txt";
        chaine2 = chaine1.concat(chaine2);
        chaine = chaine2.concat(chaine3);
	parser(chaine);
}
