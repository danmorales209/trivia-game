const GUESS_LENGTH = 10;
var timerID;
var TIMER_EXPIRED = false;
var KEEP_PLAYING = true;


function gameMessageDisplay(gameState) {
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
    setTimeout(function () {
        $(".initial-view").fadeOut(1000, function () {
            $(".initial-hidden").fadeIn(1000, function () {
                startGuessTimer()
            });
        });

    }, 5000);
}

function updateQuestionDisplay() {
    let questions = $(".list-group-item-action");
    questions.removeClass("bg-success bg-danger");

    if (dataObject.currentIndex < dataObject.data.length) {
        $("#question-display").text(dataObject.data[dataObject.currentIndex].question);
        questions.each(function (i, element) {
            element.innerText = (dataObject.data[dataObject.currentIndex].selections[i]);

        });
    }
}

function startGuessTimer() {
    let timer = GUESS_LENGTH;
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
    setTimeout(function () {
        $(".initial-hidden").fadeOut(1000, function () {
            $(".initial-view").fadeIn(1000, function () {
                updateQuestionDisplay();
            })
            $("#timer-display").text(`Time left: ${GUESS_LENGTH} seconds!`);
        })
    }, 2000);

}

function transitionNewQuestion() {
    setTimeout(function () {
        $(".initial-view").fadeOut(1000, function () {
            $(".initial-hidden").fadeIn(1000, function () {
                startGuessTimer()
            });
        });

    }, 5000);
}

function checkForTimerExp() {
    setTimeout(function () {

        if (TIMER_EXPIRED) {
            TIMER_EXPIRED = false;
            dataObject.notAnswered++;
            
            clearInterval(timerID);
            $(`.list-group-item-action[index=${dataObject.data[dataObject.currentIndex].correct}]`).addClass("bg-success");
            gameMessageDisplay("timeout");

            transitionAfterAnswer();
            dataObject.currentIndex++;

            console.log(dataObject.currentIndex + "  " + dataObject.data.length);

            if (dataObject.currentIndex < dataObject.data.length) {
                transitionNewQuestion();

                if (KEEP_PLAYING) {
                    checkForTimerExp();
                }
            }
            else {
                transitionEndScreen();
            }
        }
        else {
            checkForTimerExp();
        }
    }, 250);
}

function transitionEndScreen() {
    gameMessageDisplay("end");

    setTimeout(function () {
        $(".initial-hidden").fadeOut(1000, function () {
            $(".initial-view, #show-at-end").fadeIn(1000, function () {
                updateQuestionDisplay();
            })
            $("#timer-display").text(`Time left: ${GUESS_LENGTH} seconds!`);
        })
    }, 2000);


}

function resetTranstion() {
    $("#show-at-end, .initial-view").fadeOut(1000, function() {
        gameMessageDisplay("initial");
        $(".initial-view").fadeIn(1000, function (){
            updateQuestionDisplay();
            initialFades();
        })
    });

}

function resetData() {
    dataObject.currentIndex = 0;
    dataObject.correctAnswers = 0;
    dataObject.incorrectAnswers = 0;
    dataObject.notAnswered = 0;
    TIMER_EXPIRED = false;
}

function guessButtonAction() {
    let result = "";

    if (!TIMER_EXPIRED) {
        if ($(this).attr("index") == dataObject.data[dataObject.currentIndex].correct) {
            dataObject.correctAnswers++;
            $(this).addClass("bg-success");
            result = "correct";
        }
        else {
            $(this).addClass("bg-danger");
            dataObject.incorrectAnswers++;
            $(`.list-group-item-action[index=${dataObject.data[dataObject.currentIndex].correct}]`).addClass("bg-success");
            result = "incorrect";
        }

        clearInterval(timerID);
        dataObject.currentIndex++;

        if (dataObject.currentIndex < dataObject.data.length) {
            gameMessageDisplay(result);
            transitionAfterAnswer();
            transitionNewQuestion();
        }
        else {
            transitionEndScreen();
        }
    }
}

function resetButtonAction() {
    resetData();
    resetTranstion();
    checkForTimerExp();
}

$(document).ready(function () {

    gameMessageDisplay("initial");
    initialFades();
    updateQuestionDisplay();

    $(".list-group-item-action").on("click", guessButtonAction);

    $("#show-at-end").on("click", resetButtonAction);

    checkForTimerExp();



});