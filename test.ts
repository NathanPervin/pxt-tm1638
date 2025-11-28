// tests go here; this will not be compiled when this package is used as an extension.
TM1638.onButtonPressed(TM1638.one_through_eight.Digit5, function () {
    TM1638.setLEDs(
        false,
        false,
        false,
        false,
        true,
        false,
        false,
        false
    )
})
function scrollDecimals() {
    TM1638.setDecimalPoint(TM1638.one_through_eight.Digit1, true)
    basic.pause(100)
    TM1638.setDecimalPoint(TM1638.one_through_eight.Digit1, false)
    TM1638.setDecimalPoint(TM1638.one_through_eight.Digit2, true)
    basic.pause(100)
    TM1638.setDecimalPoint(TM1638.one_through_eight.Digit2, false)
    TM1638.setDecimalPoint(TM1638.one_through_eight.Digit3, true)
    basic.pause(100)
    TM1638.setDecimalPoint(TM1638.one_through_eight.Digit3, false)
    TM1638.setDecimalPoint(TM1638.one_through_eight.Digit4, true)
    basic.pause(100)
    TM1638.setDecimalPoint(TM1638.one_through_eight.Digit4, false)
    TM1638.setDecimalPoint(TM1638.one_through_eight.Digit5, true)
    basic.pause(100)
    TM1638.setDecimalPoint(TM1638.one_through_eight.Digit5, false)
    TM1638.setDecimalPoint(TM1638.one_through_eight.Digit6, true)
    basic.pause(100)
    TM1638.setDecimalPoint(TM1638.one_through_eight.Digit6, false)
    TM1638.setDecimalPoint(TM1638.one_through_eight.Digit7, true)
    basic.pause(100)
    TM1638.setDecimalPoint(TM1638.one_through_eight.Digit7, false)
    TM1638.setDecimalPoint(TM1638.one_through_eight.Digit8, true)
    basic.pause(100)
    TM1638.setDecimalPoint(TM1638.one_through_eight.Digit8, false)
}
TM1638.onButtonPressed(TM1638.one_through_eight.Digit8, function () {
    TM1638.setLEDs(
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        true
    )
})
TM1638.onButtonPressed(TM1638.one_through_eight.Digit4, function () {
    TM1638.setLEDs(
        false,
        false,
        false,
        true,
        false,
        false,
        false,
        false
    )
})
input.onButtonPressed(Button.A, function () {
    if (button_mode_enable == 0) {
        TM1638.showString("Hello")
    }
})
TM1638.onButtonPressed(TM1638.one_through_eight.Digit1, function () {
    TM1638.setLEDs(
        true,
        false,
        false,
        false,
        false,
        false,
        false,
        false
    )
})
input.onButtonPressed(Button.AB, function () {
    TM1638.reset()
    if (button_mode_enable == 0) {
        button_mode_enable = 1
        TM1638.startCheckingButtons()
        TM1638.scrollText("press buttons", 5)
    } else {
        TM1638.stopCheckingButtons()
        button_mode_enable = 0
    }
})
TM1638.onButtonPressed(TM1638.one_through_eight.Digit6, function () {
    TM1638.setLEDs(
        false,
        false,
        false,
        false,
        false,
        true,
        false,
        false
    )
})
input.onButtonPressed(Button.B, function () {
    if (button_mode_enable == 0) {
        TM1638.showString("Goodbye")
    }
})
TM1638.onButtonPressed(TM1638.one_through_eight.Digit2, function () {
    TM1638.setLEDs(
        false,
        true,
        false,
        false,
        false,
        false,
        false,
        false
    )
})
TM1638.onButtonPressed(TM1638.one_through_eight.Digit7, function () {
    TM1638.setLEDs(
        false,
        false,
        false,
        false,
        false,
        false,
        true,
        false
    )
})
TM1638.onButtonPressed(TM1638.one_through_eight.Digit3, function () {
    TM1638.setLEDs(
        false,
        false,
        true,
        false,
        false,
        false,
        false,
        false
    )
})
let index = 0
let button_mode_enable = 0
button_mode_enable = 0
TM1638.choosePinOption(TM1638.PinOptions.AlternateFour)
TM1638.initialize()
TM1638.scrollText("TEST0123456789", 5)
scrollDecimals()
basic.forever(function () {

})
loops.everyInterval(100, function () {
    if (button_mode_enable == 0) {
        if (index == 0) {
            TM1638.setLEDs(
                true,
                false,
                false,
                false,
                false,
                false,
                false,
                false
            )
        } else if (index == 1) {
            TM1638.setLEDs(
                false,
                true,
                false,
                false,
                false,
                false,
                false,
                false
            )
        } else if (index == 2) {
            TM1638.setLEDs(
                false,
                false,
                true,
                false,
                false,
                false,
                false,
                false
            )
        } else if (index == 3) {
            TM1638.setLEDs(
                false,
                false,
                false,
                true,
                false,
                false,
                false,
                false
            )
        } else if (index == 4) {
            TM1638.setLEDs(
                false,
                false,
                false,
                false,
                true,
                false,
                false,
                false
            )
        } else if (index == 5) {
            TM1638.setLEDs(
                false,
                false,
                false,
                false,
                false,
                true,
                false,
                false
            )
        } else if (index == 6) {
            TM1638.setLEDs(
                false,
                false,
                false,
                false,
                false,
                false,
                true,
                false
            )
        } else if (index == 7) {
            TM1638.setLEDs(
                false,
                false,
                false,
                false,
                false,
                false,
                false,
                true
            )
        }
        if (index == 7) {
            index = 0
        } else {
            index += 1
        }
    }
})
