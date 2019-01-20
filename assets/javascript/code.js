const GUESS_LENGTH = 15;

function gameMessageDisplay(gameState) {
    if (gameState === "initial") {
        $("#game-message-display").text(`Welcome to the trivia challenge! Answer each question by clicking on your response. You will have ${GUESS_LENGTH} seconds to make your selection.\nGood luck!`);
        $("#timer-display").text(`Time left: ${GUESS_LENGTH} seconds!`);
    }
    else if (gameState === "correct") {
        $("#game-message-display").text(`Good job! You have answered ${correct} questions correctly so far!`);
    }
    else if (gameState === "incorrect") {
        $("#game-message-display").text(`Better luck next time! You have answered ${correct} questions correctly so far!`);
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

function updateQuestionDisplay(index) {
    let questions = $(".list-group-item-action");

    $("#question-display").text(dataObject.data[index].question);
    questions.each(function (i, element) {
        element.innerText = (dataObject.data[index].selections[i]);
    });
}

function startGuessTimer() {
    let timer = GUESS_LENGTH;
    let t = setInterval(function () {

        $("#timer-display").text(`Time left: ${timer} seconds!`);
        timer--;

        if (timer < 0) {
            clearInterval(t);
            $("#timer-display").text("Time's up!");
        }

    }, 1000);
}


$(document).ready(function () {

    var questionIndex = 0;
    var correct = 0, incorrect = 0;

    gameMessageDisplay("initial");
    initialFades();
    updateQuestionDisplay(questionIndex);

    $(".list-group-item-action").on("click", function () {
        if ($(this).attr("index") == dataObject.data[questionIndex].correct) {
            alert("Correct");
            correct++;
        }
        else {
            alert("not correct");
            incorrect++;
        }
    });




});