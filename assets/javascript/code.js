const GUESS_LENGTH = 1;
var timerID;
var TIMER_EXPIRED = false;
var KEEP_PLAYING = true;


function gameMessageDisplay(gameState, score = undefined) {
    if (gameState === "initial") {
        $("#game-message-display").text(`Welcome to the trivia challenge! Answer each question by clicking on your response. You will have ${GUESS_LENGTH} seconds to make your selection.\nGood luck!`);
        $("#timer-display").text(`Time left: ${GUESS_LENGTH} seconds!`);
    }
    else if (gameState === "correct") {
        $("#game-message-display").text(`Good job! You have answered ${score} questions correctly so far!`);
    }
    else if (gameState === "incorrect") {
        $("#game-message-display").text(`Better luck next time! You have answered ${score} questions correctly so far!`);
    }
    else if(gameState === "timeout") {
        $("#game-message-display").text(`You ran out of time! You have answered ${score} questions correctly so far!`);
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

    if(dataObject.currentIndex < dataObject.data.length) {
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
    }, 1000);

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

function checkForTimerExp(score) {
    setTimeout(function() {
        
        if (TIMER_EXPIRED) {
            TIMER_EXPIRED = false;
            clearInterval(timerID);
            
            gameMessageDisplay("timeout",score);
            transitionAfterAnswer();
            dataObject.currentIndex++;
            
            console.log(dataObject.currentIndex + "  " + dataObject.data.length);
            
            if (dataObject.currentIndex < dataObject.data.length) {
                transitionNewQuestion();

                if(KEEP_PLAYING) {
                    checkForTimerExp(score);
                }
            }
        }
        else {
            checkForTimerExp(score);
        }
    },1000);
}


$(document).ready(function () {
    var correct = 0;

    gameMessageDisplay("initial");
    initialFades();
    updateQuestionDisplay();

    $(".list-group-item-action").on("click", function () {
        let result = "";
        
        if (!TIMER_EXPIRED) {
            if ($(this).attr("index") == dataObject.data[dataObject.currentIndex].correct) {
                correct++;
                $(this).addClass("bg-success");
                result = "correct";
            }
            else {
                $(this).addClass("bg-danger");
                $(`.list-group-item-action[index=${dataObject.data[dataObject.currentIndex].correct}]`).addClass("bg-success");
                result = "incorrect";
            }
            
            clearInterval(timerID);
            gameMessageDisplay(result, correct);
            transitionAfterAnswer();
            dataObject.currentIndex++;
            
            if (dataObject.currentIndex !== dataObject.data.length) {
                transitionNewQuestion();
            }
        }
    });
    
    checkForTimerExp(correct);
    
    
    
});