function ensureOneCheck(checkBoxName, messageId, submitId) {
  const checkBoxes = document.getElementsByName(checkBoxName);
  let checkCount = 0;

  checkBoxes.forEach((x) => {
    if (x.checked) {
      checkCount++;
    }
  });

  if (checkCount === 0) {
    document.getElementById(messageId).style.display = "block";
    document.getElementById(submitId).disabled = true;
    return false;
  } else {
    document.getElementById(messageId).style.display = "none";
    document.getElementById(submitId).disabled = false;
    return true;
  }
}

function getOMdbMovie() {
  const title = document.getElementById("title").value;
  const poster = document.getElementById("poster");
  const omdbErr = document.getElementById("OMdbErr");
  const posterURL = document.getElementById("posterURL");
  const starring = document.getElementById("starring");
  const story = document.getElementById("story");
  const datepicker = document.getElementById("datepicker");
  fetch("https://www.omdbapi.com/?t=" + title + "&apikey=9d5bc50d")
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      if (data.Response === "False") {
        poster.src = "/img/no-image.jpg";
        omdbErr.style.display = "inline";
      } else {
        omdbErr.style.display = "none";
        poster.src = data.Poster;
        starring.value = data.Actors;
        posterURL.value = data.Poster; // hidden input field to submit
        story.value = data.Plot;
        datepicker.value = moment(new Date(data.Released)).format("DD/MM/YYYY");
      }
    })
    .catch((error) => {
      omdbErr.innerHTML = error;
    });
}

$("#posterUpload").on("change", function () {
  let image = $("#posterUpload")[0].files[0];
  let formdata = new FormData();
  formdata.append("posterUpload", image);
  $.ajax({
    url: "/outfit/upload",
    type: "POST",
    data: formdata,
    contentType: false,
    processData: false,
    success: (data) => {
      $("#poster").attr("src", data.file);
      $("#posterURL").attr("value", data.file); // sets posterURL hidden field
      console.log("hello");
      if (data.err) {
        $("#posterErr").show();
        $("#posterErr").text(data.err.message);
      } else {
        $("#posterErr").hide();
      }
    },
  });
});

let poll = {
  question: "What do you think of this outfit?",
  answers: ["Looks Good!", "Looks Meh"],
  pollCount: 20,
  answersWeight: [12, 8],
  selectedAnswer: -1,
};

let pollDOM = {
  question: document.querySelector(".poll .question"),
  answers: document.querySelector(".poll .answers"),
};

pollDOM.question.innerText = poll.question;
pollDOM.answers.innerHTML = poll.answers
  .map(function (answer, i) {
    return `
      <div class="answer" onclick="markAnswer('${i}')">
        ${answer}
        <span id="percentagebar" class="percentage-bar"></span>
        <span class="percentage-value"></span>
      </div>
      `;
  })
  .join("");

function markAnswer(i) {
  poll.selectedAnswer = +i;
  try {
    document
      .querySelector(".poll .answers .answer .selected")
      .classList.remove("selected");
  } catch (msg) {}
  document
    .querySelectorAll(".poll .answers .answer")
    [+i].classList.add("selected");
  showResults();
}

function showResults() {
  let answers = document.querySelectorAll(".poll .answers .answer");
  for (let i = 0; i < answers.length; i++) {
    let percentage = 0;
    if (i == poll.selectedAnswer) {
      percentage = Math.round(
        ((poll.answersWeight[i] + 1) * 100) / (poll.pollCount + 1)
      );
    } else {
      percentage = Math.round(
        (poll.answersWeight[i] * 100) / (poll.pollCount + 1)
      );
    }

    answers[i].querySelector(".percentage-bar").style.width = percentage + "%";
    answers[i].querySelector(".percentage-value").innerText = percentage + "%";
  }
}
