// tests go here; this will not be compiled when this package is used as an extension.

/* 
Board will start by lighting up all of the 8 LEDs.
Then will show the string LO on the seven segments and will be dim.
Then will show the string HIGH on the seven segments and be bright.
Then will show the string test0123 on the seven segments
Then the decimal point will turn on and off sequentially from left to right.
Then it will scroll through the text test0123456789
Lastly, it will turn on LED1, then turn it off after 2 seconds
*/

tm1638.initialize(tm1638.PinOptions.Default)

tm1638.setLEDs(true, true, true, true, true, true, true, true)

tm1638.showString("LO")
tm1638.setBrightness(0)
basic.pause(2000)
tm1638.showString("HIGH")
tm1638.setBrightness(7)
basic.pause(2000)

tm1638.showString("test0123")
basic.pause(1000)
tm1638.showString("")
basic.pause(200)

for (let i = 1; i <= 8; i++) {
    tm1638.setDecimalPoint(i as tm1638.SelectDigit, true)
    basic.pause(250)
    tm1638.setDecimalPoint(i as tm1638.SelectDigit, false)
}

tm1638.scrollText("test0123456789", 5)
tm1638.reset()
tm1638.setLED(tm1638.SelectDigit.One, true)
basic.pause(2000)
tm1638.setLED(tm1638.SelectDigit.One, false)