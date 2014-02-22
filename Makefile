sign:
	jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore build/SudokuLounge.keystore build/SudokuLounge_unsigned.apk SudokuLounge

verify:
	jarsigner -verify -verbose -certs build/SudokuLounge_unsigned.apk

zalign:
	zipalign -f -v 4 build/SudokuLounge_unsigned.apk build/SudokuLounge.apk

all:
	make sign
	make verify
	make zalign
	