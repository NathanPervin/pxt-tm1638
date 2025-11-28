// tests go here; this will not be compiled when this package is used as an extension.

/* 
Board will start by lighting up all of the 8 LEDs.
Then will show the string LO on the seven segments and will be dim.
Then will show the string HIGH on the seven segments and be bright.
Then will show the string test0123 on the seven segments
Then the decimal point will turn on and off sequentially from left to right.
Lastly, it will scroll through the text test0123456789
*/
TM1638.initialize(TM1638.PinOptions.Default)

TM1638.setLEDs(true, true, true, true, true, true, true, true)

TM1638.showString("LO")
TM1638.setBrightness(0)
basic.pause(2000)
TM1638.showString("HIGH")
TM1638.setBrightness(7)
basic.pause(2000)

TM1638.showString("test0123")
basic.pause(1000)
TM1638.showString("")
basic.pause(200)

for (let i = 1; i <= 8; i++) {
    TM1638.setDecimalPoint(i as TM1638.one_through_eight, true)
    basic.pause(250)
    TM1638.setDecimalPoint(i as TM1638.one_through_eight, false)
}

TM1638.scrollText("test0123456789", 5)