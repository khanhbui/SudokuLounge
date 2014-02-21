sign:
	jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore SudokuLounge.keystore build/SudokuLounge.apk SudokuLounge

verify:
	jarsigner -verify -verbose -certs build/SudokuLounge.apk

zalign:
	zipalign -v 4 build/SudokuLounge.apk build/SudokuLounge.apk build/SudokuLounge_.apk
	