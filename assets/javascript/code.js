const GUESS_LENGTH = 15;
var timerID;
var TIMER_EXPIRED = false;
var sfxPlayer;
var player


function gameMessageDisplay(gameState) {
    // Function updates the message container based upon passeed message
    if (gameState === "initial") {
        $("#game-message-display").text(`Welcome to the trivia challenge! Answer each question by clicking on your response. You will have ${GUESS_LENGTH} seconds to make your selection.\nGood luck!`);
        $("#timer-display").text(`Time left: ${GUESS_LENGTH} seconds!`);
    }
    else if (gameState === "correct") {
        $("#game-message-display").text(`Good job! You have answered ${dataObject.correctAnswers} questions correctly so far!`);
    }
    else if (gameState === "incorrect") {
        $("#game-message-display").text(`Better luck next time! You have answered ${dataObject.correctAnswers} questions correctly so far!`);
    }
    else if (gameState === "timeout") {
        $("#game-message-display").text(`You ran out of time! You have answered ${dataObject.correctAnswers} questions correctly so far!`);
    }
    else if (gameState === "end") {
        $("#game-message-display").html(`Game Over!<br> You answered
        <br>${dataObject.correctAnswers} questions correctly,<br>
        ${dataObject.incorrectAnswers} questions incorrectly,<br>
        and didn't answer ${dataObject.notAnswered} questions.<br>Press the button below to play again`);
    }
}

function initialFades() {
    // Inital fade sequence. Final chained function starts the guess timer. Uses setTimeout to give user a chance to read.
    setTimeout(function () {
        $(".initial-view").fadeOut(1000, function () {
            $(".initial-hidden").fadeIn(1000, function () {
                startGuessTimer()
            });
        });

    }, 5000);
}

function updateQuestionDisplay() {
    // Use this function to change out questions from dataObject.data array. Also removes some classes to reset formatting
    let questions = $(".list-group-item-action");
    questions.removeClass("bg-success bg-danger text-white");

    // check for out of bounds in data array here
    if (dataObject.currentIndex < dataObject.data.length) {
        $("#question-display").text(dataObject.data[dataObject.currentIndex].question);
        questions.each(function (i, element) {
            element.innerText = (dataObject.data[dataObject.currentIndex].selections[i]);

        });
    }
}

function startGuessTimer() {
    // Guess timer updates every second based upon global variable GUESS_LENGTH (seconds)
    let timer = GUESS_LENGTH;

    // reset global flag TIMER_EXPIRED here 
    TIMER_EXPIRED = false;
    clearInterval(timerID);
    timerID = setInterval(function () {

        $("#timer-display").text(`Time left: ${timer} seconds!`);
        timer--;

        if (timer < 0) {
            clearInterval(timerID);
            $("#timer-display").text("Time's up!");
            TIMER_EXPIRED = true;
        }

    }, 1000);
}

function transitionAfterAnswer() {
    // function to transition after user selects an answer. Initially fades out inccorects responses, then fades out input conatiner
    // and fades in message display. Call updateQuestion here to setup the next round of questions
    $(`.list-group-item-action[index!='${dataObject.data[dataObject.currentIndex].correct}']`).fadeOut(1000, function () {
        setTimeout(function () {
            $(".initial-hidden").fadeOut(1000, function () {
                $(".initial-view").fadeIn(1000, function () {
                    $(".list-group-item-action").css("display", "flex");
                    updateQuestionDisplay();
                })
                $("#timer-display").text(`Time left: ${GUESS_LENGTH} seconds!`);
            })
        }, 3000);
    });

}

function transitionNewQuestion() {
    // Function transtitions from the message to the trivia questions. Start timer is set once the message container finishes fading out,
    // seems to prevent too much delay from starting the counter after the questions fully fade in and prevents unexpected bugs from 
    // guessing a questions before the timer starts
    setTimeout(function () {
        $(".initial-view").fadeOut(1000, function () {
            startGuessTimer()
            $(".initial-hidden").fadeIn(1000, function () {
            });
        });

    }, 7000);
}

function checkForTimerExp() {
    // Rescursive function. Acts like a less intense while loop. Fires off every quarter-second. Real action happens if TIMER_EXPIRED
    // is set to true. Highlights correct answer, and initiates the transistions like an incorrect option was pressed,
    // but timed-out responses are independently tracked.
    setTimeout(function () {

        if (TIMER_EXPIRED) {

            sfxPlayer.getElementsByTagName("source")[0].src = "assets/audio/smb_pipe.wav";
            sfxPlayer.load();
            sfxPlayer.play();

            TIMER_EXPIRED = false;
            dataObject.notAnswered++;

            clearInterval(timerID);
            $(`.list-group-item-action[index=${dataObject.data[dataObject.currentIndex].correct}]`).addClass("bg-success text-white");
            gameMessageDisplay("timeout");

            transitionAfterAnswer();
            dataObject.currentIndex++;

            if (dataObject.currentIndex < dataObject.data.length) {
                transitionNewQuestion();
                checkForTimerExp();
            }
            else {
                player.pause();

                sfxPlayer.getElementsByTagName("source")[0].src = "assets/audio/smb_stage_clear.wav";
                sfxPlayer.load();
                sfxPlayer.play();

                transitionEndScreen();
            }
        }
        else {
            checkForTimerExp();
        }
    }, 250);
}

function transitionEndScreen() {
    // Transition to end screen. Incorrect buttons are faded out, and then the end screen message and reset button fade in.

    gameMessageDisplay("end");
    // use dataObject.currentIndex - 1 since the calling function increments prior to check
    $(`.list-group-item-action[index!=${dataObject.data[dataObject.currentIndex - 1].correct}]`).fadeOut(1000, function () {
        setTimeout(function () {
            $(".initial-hidden").fadeOut(1000, function () {
                $(".initial-view, #show-at-end").fadeIn(1000, function () {
                    updateQuestionDisplay();
                })
                $("#timer-display").text(`Time left: ${GUESS_LENGTH} seconds!`);
            })
        }, 2000);
    });

}

function resetTranstion() {
    // Function to get back to original page state, and kicks off initial fade
    $(".list-group-item-action").css("display", "flex");
    $("#show-at-end, .initial-view").fadeOut(1000, function () {
        gameMessageDisplay("initial");
        $(".initial-view").fadeIn(1000, function () {
            updateQuestionDisplay();
            initialFades();
        })
    });

}

function resetData() {
    // reset game state when user wants to play again
    dataObject.currentIndex = 0;
    dataObject.correctAnswers = 0;
    dataObject.incorrectAnswers = 0;
    dataObject.notAnswered = 0;
    TIMER_EXPIRED = false;
}

function guessButtonAction() {
    // tracks the user input. Gets called when a user clicks on one of the <a> tags. Only fires if TIMER_EXPIRED is false. 
    // Both responses highligh the correct answer and play a fun sounds clip. If the user selects the wrong answer,
    // it is immediately highlighted in red. Calls the appropriate transitions based upon the index of the object array.
    // Assumes starting at front and ends when there dataObject.data array reaches the end.
    let result = "";

    if (!TIMER_EXPIRED) {
        if ($(this).attr("index") == dataObject.data[dataObject.currentIndex].correct) {
            dataObject.correctAnswers++;
            $(this).addClass("bg-success text-white");
            result = "correct";
            console.log(sfxPlayer);
            sfxPlayer.getElementsByTagName("source")[0].src = "assets/audio/smb_powerup.wav";
            sfxPlayer.load();
            sfxPlayer.play();

        }
        else {
            $(this).addClass("bg-danger");
            dataObject.incorrectAnswers++;
            $(`.list-group-item-action[index=${dataObject.data[dataObject.currentIndex].correct}]`).addClass("bg-success text-white");
            result = "incorrect";

            sfxPlayer.getElementsByTagName("source")[0].src = "assets/audio/smb_pipe.wav";
            sfxPlayer.load();
            sfxPlayer.play();
        }
        
        clearInterval(timerID); // Probably uncessary
        gameMessageDisplay(result);
        transitionAfterAnswer();
        // Move to next question
        dataObject.currentIndex++;

        //questions left
        if (dataObject.currentIndex < dataObject.data.length) {
            transitionNewQuestion();
        }
        else { // no questions left

            player.pause();

            sfxPlayer.getElementsByTagName("source")[0].src = "assets/audio/smb_stage_clear.wav";
            sfxPlayer.load();
            sfxPlayer.play();

            transitionEndScreen();
        }
    }
}

function resetButtonAction() {
    // Triggers when the user presses the reset button.
    resetData();
    resetTranstion();
    checkForTimerExp();
    player.play();
}

$(document).ready(function () {
    // Main function that starts when the document finishes loading
    
    // get audio players info intialized after document is loaded
    player = document.getElementById("background-sound");
    sfxPlayer = document.getElementById("sfx-player");

    // Setup the initial state
    gameMessageDisplay("initial");
    initialFades();
    updateQuestionDisplay();

    // add event listener on the trivia resoponse links
    $(".list-group-item-action").on("click", guessButtonAction);

    // add even listener to (initially hidden) reset button
    $("#show-at-end").on("click", resetButtonAction);

    // Starts the timeout loop with function call
    checkForTimerExp();

    // start the atmosphere
    player.volume = 0.33;
    player.loop = true;
    player.play();



});