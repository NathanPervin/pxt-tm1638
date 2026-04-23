/*
 * Extension for Controlling a TM1638 Board
 */ 
//% color="#0057A6"
//% block="TM1638"
namespace tm1638 {

    let strobe = DigitalPin.P0
    let clock = DigitalPin.P1
    let data = DigitalPin.P2

    let ledStatus: boolean[] = [false, false, false, false, false, false, false, false]
    let sevenSegmentStatus: number[] = [0, 0, 0, 0, 0, 0, 0, 0]

    let lastButtonState = 0
    let buttonFunctions: ((btn: number) => void)[] = []
    let monitorButtonsEnable = false // true=monitor buttons, false=don't monitor buttons

    let buttonPollRate = 50 // ms

    let sevenSegmentDecoderTable: { [key: string]: number } = {
        "0": 0x3f,
        "1": 0x06,
        "2": 0x5b,
        "3": 0x4f,
        "4": 0x66,
        "5": 0x6d,
        "6": 0x7d,
        "7": 0x07,
        "8": 0x7f,
        "9": 0x6f,
        "A": 0x77,
        "B": 0x7c,
        "C": 0x39,
        "D": 0x5e,
        "E": 0x79,
        "F": 0x71,
        "G": 0x3d,
        "H": 0x76,
        "I": 0x06,
        "J": 0x1e,
        "L": 0x38,
        "N": 0x54,
        "O": 0x3f,
        "P": 0x73,
        "Q": 0x67,
        "R": 0x50,
        "S": 0x6d,
        "T": 0x78,
        "U": 0x3e,
        "Y": 0x6e,
        "Z": 0x5b,
        " ": 0x00,
        "-": 0x40,
        "=": 0x48,
        "_": 0x08
    }

    export enum SelectDigit {
        //%block="1"
        One = 1,
        //%block="2"
        Two = 2,
        //%block="3"
        Three = 3,
        //%block="4"
        Four = 4,
        //%block="5"
        Five = 5,
        //%block="6"
        Six = 6,
        //%block="7"
        Seven = 7,
        //%block="8"
        Eight = 8
    }

    export enum PinOptions {
        //% block="P0=STB, P1=CLK, P2=DIO"
        Default,
        //% block="P16=STB, P15=CLK, P14=DIO"
        AlternateOne,
        //% block="P16=STB, P8=CLK, P2=DIO"
        AlternateTwo,
        //% block="P16=STB, P8=CLK, P1=DIO"
        AlternateThree,
        //% block="P16=STB, P8=CLK, P0=DIO"
        AlternateFour
    }

    /**
     * Converts input char to corresponding seven segment 
     * binary value, if the character is not found in the
     * table such as "M" or "X", the function will return as empty 
     * space (svn segment off). This is because some characters
     * such as "M" and "X" cannot be represented in a seven
     * segment display.
     */
    function sevenSegmentDecoder(c: string): number {
        if (sevenSegmentDecoderTable[c] != undefined) {
            return sevenSegmentDecoderTable[c]
        } else {
            return 0x00
        }
    }

    /* 
     * Replicates Arduino shiftOut function (with MSBFIRST option removed),
     * sends out 8-bit number one bit at a time starting with the
     * least significant bit
     */
    function shiftOut(dataPin: DigitalPin, clockPin: DigitalPin, value: number): void {
        let bit: number

        // loop through all 8 bits
        for (let i = 0; i < 8; i++) {

            // right shift value by current bit
            // being sent (determined by loop index)
            // this places the bit that is being send in the 
            // LSB, then AND with binary 00000001 to mask
            // out all other bits 
            bit = (value >> i) & 0b1

            pins.digitalWritePin(dataPin, bit)
            pins.digitalWritePin(clockPin, 1)
            pins.digitalWritePin(clockPin, 0)
        }
    }

    /* 
     * Replicates Arduino shiftIn function (with MSBFIRST option removed),
     * reads in 8-bit number one bit at a time starting with the
     * least significant bit
     */
    function shiftIn(dataPin: DigitalPin, clockPin: DigitalPin): number {
        let value = 0
        for (let j = 0; j < 8; j++) {
            pins.digitalWritePin(clockPin, 1)

            // shift read in bit status to the index 
            // of the current bit being read LSB first
            // OR with other bits 
            value |= (pins.digitalReadPin(dataPin) << j)
            pins.digitalWritePin(clockPin, 0)
        }
        return value
    }

    /* 
     * Manufacturer provided method of sending a command to the TM1638
     */
    function sendCommand(cmd: number): void {
        pins.digitalWritePin(strobe, 0)
        shiftOut(data, clock, cmd)
        pins.digitalWritePin(strobe, 1)
    }

    /* 
     * Manufacturer provided method of reading button status
     */
    function readButtons(): number {
        let buttons = 0
        pins.digitalWritePin(strobe, 0)
        shiftOut(data, clock, 0x42)

        pins.setPull(data, PinPullMode.PullNone)

        for (let k = 0; k < 4; k++) {
            let v = shiftIn(data, clock) << k
            buttons |= v
        }

        pins.digitalWritePin(strobe, 1)
        return buttons
    }

    /**
     * Displays a string on the 7-segment display.
     * Maximum 8 characters in length, characters that
     * can't be represented on a seven segment display
     * will instead be blank.
     * @param input_text the text (string) to be displayed, eg: "hello"
     */
    //%block weight=7
    export function showString(input_text: string): void {
        input_text = input_text.toUpperCase()
        sevenSegmentStatus = [0, 0, 0, 0, 0, 0, 0, 0]

        // if the input string is above 8 chars in length, truncate down to 8 chars
        if (input_text.length > 8) {
            input_text = input_text.slice(0, 8)
        }

        // loop through all inputted characters
        for (let l = 0; l < input_text.length; l++) {

            // call decoder function to recieve the seven segment binary for
            // the current letter
            sevenSegmentStatus[l] = sevenSegmentDecoder(input_text.charAt(l))

        }

        // display the sanitized input text on the seven segment displays
        updateSevenSegments()
    }

    /**
     * Sets the status of the 8 LEDs. 
     * @param led0 the state of LED 1, expects a boolean (true or false), eg. false
     * @param led1 the state of LED 2, expects a boolean (true or false), eg. false
     * @param led2 the state of LED 3, expects a boolean (true or false), eg. false
     * @param led3 the state of LED 4, expects a boolean (true or false), eg. false
     * @param led4 the state of LED 5, expects a boolean (true or false), eg. false
     * @param led5 the state of LED 6, expects a boolean (true or false), eg. false
     * @param led6 the state of LED 7, expects a boolean (true or false), eg. false
     * @param led7 the state of LED 8, expects a boolean (true or false), eg. false
     */
    //% block="turn ON/OFF LEDs | LED1 =$led0 LED2 =$led1 LED3 =$led2 LED4 =$led3 LED5 =$led4 LED6 =$led5 LED7 =$led6 LED8 =$led7"
    //% led0.shadow="toggleOnOff" led1.shadow="toggleOnOff" led2.shadow="toggleOnOff" led3.shadow="toggleOnOff"
    //% led4.shadow="toggleOnOff" led5.shadow="toggleOnOff" led6.shadow="toggleOnOff" led7.shadow="toggleOnOff"
    //% led0.defl=false led1.defl=false led2.defl=false led3.defl=false
    //% led4.defl=false led5.defl=false led6.defl=false led7.defl=false
    //% weight=5
    export function setLEDs(
        led0: boolean, led1: boolean, led2: boolean, led3: boolean,
        led4: boolean, led5: boolean, led6: boolean, led7: boolean
    ): void {
        ledStatus = [led0, led1, led2, led3, led4, led5, led6, led7]
        updateLEDs()
    }

    /* 
     * Manufacturer provided method of reading button status
     * modified to loop through a list of led status instead
     * of setting an individual led at specified position
     */
    function updateLEDs(): void {

        // loop through all 8 LEDs in ledStatus list
        for (let m = 0; m < 8; m++) {

            shiftOut(data, clock, 0x44)
            pins.digitalWritePin(strobe, 0)

            // convert boolean to 1 or 0
            // for current led
            let led_state: number
            if (ledStatus[m]) {
                led_state = 1
            } else {
                led_state = 0
            }

            pins.digitalWritePin(strobe, 0)
            shiftOut(data, clock, 0xC1 + (m << 1))
            shiftOut(data, clock, led_state)
            pins.digitalWritePin(strobe, 1)
        }
    }

    /* 
     * Manufacturer provided method of writing to seven segment displays
     */
    function updateSevenSegments(): void {

        pins.digitalWritePin(strobe, 0)
        shiftOut(data, clock, 0x40)
        pins.digitalWritePin(strobe, 1)

        pins.digitalWritePin(strobe, 0)
        shiftOut(data, clock, 0xC0)

        for (let n = 0; n < 8; n++) {

            shiftOut(data, clock, sevenSegmentStatus[n])
            shiftOut(data, clock, ledStatus[n] ? 1 : 0)
        }

        pins.digitalWritePin(strobe, 1)
    }

    /** 
     * Clears the seven segment displays and LEDs.
     */
    //% block="clear board" weight=8
    export function reset(): void {
        sendCommand(0x40)
        pins.digitalWritePin(strobe, 0)
        shiftOut(data, clock, 0xC0)
        for (let o = 0; o < 16; o++) {
            shiftOut(data, clock, 0x00)
        }
        pins.digitalWritePin(strobe, 1)

        ledStatus = [false, false, false, false, false, false, false, false]
        updateLEDs()
    }

    /* 
     * Manufacturer provided method of board setup
     */
    function setup(): void {
        sendCommand(0x8F)
        reset()
        setBrightness(0)
        basic.pause(500)
        setBrightness(7)
        basic.pause(500)
    }

    /**
     * Scrolls through input text from right to left at a specified speed.
     * The text can be any length. 
     * @param text the text to be scrolled (string), eg. "test012345"
     * @param speed that the text will scroll from 1 (slowest) to 10 (fastest), eg. 5
     */
    //% block="scroll text %text with speed %speed" weight=6
    //% speed.min=1 speed.max=10 speed.defl=5
    export function scrollText(text: string, speed: number): void {

        text = text.toUpperCase()

        // convert 1 through 10 for input speed to a delay in ms
        // start with 350 initial delay, subtract the 1-10 speed
        // after scaling it to ms, each increase of speed value
        // decreases the delay by 30 ms
        let delay = 350 - (speed * 30)

        // add spaces before and after the text
        let padded_text = "        " + text + "        "

        // loop through each 8-character slice in the padded_text
        for (let p = 0; p <= padded_text.length - 8; p++) {

            // get the current 8-char text from the padded text
            let current_text = padded_text.slice(p, p + 8)

            // call existing show string function and
            // delay for specified time before showing the
            // next 8-char slice
            showString(current_text)
            basic.pause(delay)
        }
    }

    /**
     * Enables or disables the decimal point on a 
     * specified seven segment display.
     * @param digit the seven segment decimal to be changed, eg. tm1638.SelectDigit.One
     * @param state the state of the decimal true for on, false for off eg. true
     */
    //%block="turn decimal point $state at digit %digit" weight=4
    //% digit.defl=tm1638.SelectDigit.One
    //% state.shadow="toggleOnOff" state.defl=true
    export function setDecimalPoint(digit: SelectDigit, state: boolean): void {
        let index = digit - 1

        // decimal point is controlled by the 7th bit
        // so a seven segment binary of 0x80=0b10000000
        // will enable the decimal point
        if (state) {
            sevenSegmentStatus[index] |= 0x80
        } else {
            // to clear the decimal point, AND
            // with the inverse of 0b10000000
            // to maintain all other bits but clear the decimal bit
            sevenSegmentStatus[index] &= ~0x80
        }

        updateSevenSegments()
    }

    /**
     * Starts checking the button status.
     */
    //% block="start checking buttons" weight=3
    export function startCheckingButtons(): void {

        // if the buttons are already being checked and the
        // function is called again, return to avoid two
        // background subroutines
        if (monitorButtonsEnable) return

        // function was called while the buttons were not being 
        // checked so enable this flag to start checking the buttons
        monitorButtonsEnable = true

        // run in background block
        control.inBackground(() => {

            while (monitorButtonsEnable) {

                // call function to get current button status
                let current = readButtons()

                // loop through all 8 bits of current
                // each bit represents the corresponding button status
                for (let q = 0; q < 8; q++) {

                    // set all bits to 0 except current bit being checked
                    let mask = 1 << q

                    // check that current button is pressed,
                    // ensure that the button state has changed since last recorded status 
                    // (otherwise holding the button would count as multiple presses)
                    if ((current & mask) && !(lastButtonState & mask)) {

                        // check if the user has created a 
                        // function block for the current button that was pressed
                        if (buttonFunctions[q]) {

                            // if the user has created the function block, call the function
                            buttonFunctions[q](q + 1)
                        }
                    }
                }

                // save the current button states and delay for specified time
                lastButtonState = current
                basic.pause(buttonPollRate)
            }
        })
    }

    /**
     * Stops checking the button status.
     */
    //% block="stop checking buttons" weight=1
    export function stopCheckingButtons(): void {
        monitorButtonsEnable = false
    }

    /**
     * This function will be run when the buttons have started
     * being checked and when the specified button was pressed.
     * @param button the button that, when pressed, will call the function, eg. tm1638.SelectDigit.One
     * @param buttonFunction the function that will be called, eg. function () {tm1638.scrollText("button 1", 5)}
     */
    //% block="on button %btn pressed" weight=2
    //% button.defl=tm1638.SelectDigit.One
    export function onButtonPressed(button: SelectDigit, buttonFunction: () => void): void {

        // adds a reference to a function to buttonFunctions as a list element
        // with index corresponding to the button number
        // ie. button 1 will call function in index position 0,
        // button 8 will call function in index position 7 
        buttonFunctions[button - 1] = buttonFunction
    }

    /** 
     * Sets the brightness of the board. 
     * @param level the brightness of the board from 0 (dimmest) to 7 (brightest), eg. 7
     */
    //% block="set brightness to %level" weight=9
    //% level.min=0 level.max=7
    export function setBrightness(level: number): void {
        sendCommand(0x88 | level)
    }

    /**
     * Enables or disables a specified LED 
     * @param digit the led to be changed, eg. tm1638.SelectDigit.One
     * @param state the state of the LED true for on, false for off eg. true
     */
    //%block="turn LED $state at digit %digit" weight=8
    //% digit.defl=tm1638.SelectDigit.One
    //% state.shadow="toggleOnOff" state.defl=true
    export function setLED(digit: SelectDigit, state: boolean): void {
        let index = digit - 1
        ledStatus[index] = state 
        updateLEDs()
    }

    /*
     * This function fixes a runtime error seen only
     * when using test.ts
     */
    function initializeVariables(): void {

        ledStatus = [false, false, false, false, false, false, false, false]
        sevenSegmentStatus = [0, 0, 0, 0, 0, 0, 0, 0]
        lastButtonState = 0
        buttonPollRate = 50

        sevenSegmentDecoderTable = {
            "0": 0x3f, "1": 0x06, "2": 0x5b, "3": 0x4f,
            "4": 0x66, "5": 0x6d, "6": 0x7d, "7": 0x07,
            "8": 0x7f, "9": 0x6f, "A": 0x77, "B": 0x7c,
            "C": 0x39, "D": 0x5e, "E": 0x79, "F": 0x71,
            "G": 0x3d, "H": 0x76, "I": 0x06, "J": 0x1e,
            "L": 0x38, "N": 0x54, "O": 0x3f, "P": 0x73,
            "Q": 0x67, "R": 0x50, "S": 0x6d, "T": 0x78,
            "U": 0x3e, "Y": 0x6e, "Z": 0x5b, " ": 0x00, 
            "-": 0x40, "=": 0x48, "_": 0x08
        }
    }

    function initializeInternal(): void {
        basic.pause(50)
        initializeVariables()
        setup()
        basic.pause(100)
    }

    /**
     * Initializes the board using the specified pins.
     * @param pins the pin option that will be used, eg. tm1638.PinOptions.Default
     */
    //% block="initialize with pins %pins" weight=10
    export function initialize(pins: PinOptions): void {
        if (pins == PinOptions.Default) {
            strobe = DigitalPin.P0
            clock = DigitalPin.P1
            data = DigitalPin.P2
        } else if (pins == PinOptions.AlternateOne) {
            strobe = DigitalPin.P16
            clock = DigitalPin.P15
            data = DigitalPin.P14
        }
        else if (pins == PinOptions.AlternateTwo) {
            strobe = DigitalPin.P16
            clock = DigitalPin.P8
            data = DigitalPin.P2
        }
        else if (pins == PinOptions.AlternateThree) {
            strobe = DigitalPin.P16
            clock = DigitalPin.P8
            data = DigitalPin.P1
        }
        else {
            strobe = DigitalPin.P16
            clock = DigitalPin.P8
            data = DigitalPin.P0
        }

        initializeInternal()
    }

}