let slideAnimation = null;
let sliderContainer = null;
let photoSensor = null;
let milkSensor = null;
let valve = null;
let allBoxes = [];
let endMachine = null;
let gear = null;
let thereAreTheBreaks = null;
let thereAreTheBreaksAgain = null;
const STAND_BY = 8000;
let buttonStart = null;

let ledRun = null;
let ledStandBy = null;
let ledFull = null;

document.addEventListener("DOMContentLoaded", function () {
  gear = document.querySelectorAll(".gear");
  thereAreTheBreaks = document.querySelector(".TheseAreTheBreaks");
  thereAreTheBreaksAgain = document.querySelector(".TheseAreTheBreaks_Again");

  sliderContainer = document.querySelector(".conveyor-machine--slide");
  photoSensor = document.querySelector("#photo-sensor-colaider");
  allBoxes = document.getElementsByClassName("box--wrapper");
  endMachine = document.querySelector("#end-machine");
  milkSensor = document.querySelector(".milk-sensor");
  valve = document.querySelector(".valve");
  buttonStart = document.querySelector("#checkbox-start");

  ledRun = document.querySelector("#led-run .led");
  ledStandBy = document.querySelector("#led-stand-by .led");
  ledFull = document.querySelector("#led-full .led");

  setAnimationTranslate();
  stopAnimationBelt();

  buttonStart.addEventListener("click", (ev) => {
    if (ev.target.checked) {
      setTimeout(() => {
        start();
        ledRun.classList.add("active");
      }, 800);
    } else {
      stopMachine();
    }
  });
});

window.addEventListener("visibilitychange", (ev) => {
  if (ev.target.hidden) {
    stopMachine();
  }
});

function stopMachine() {
  slideAnimation.cancel();
  inactiveBottleFilledSensor();
  inactivePhotoSensor();
  stopAnimationBelt();
  ledRun.classList.remove("active");
  ledStandBy.classList.remove("active");
  ledFull.classList.remove("active");
  buttonStart.checked = false;

  const allBoxesToClear = document.querySelectorAll(".box--wrapper");

  if (allBoxesToClear.length !== 0) {
    allBoxesToClear.forEach((box) => {
      box.classList.remove("filled");
    });
  }
}

function start() {
  slideAnimation.play();
  startAnimationBelt();

  for (let i = 0; i < allBoxes.length; i++) {
    const box = allBoxes[i];

    const interceptor = detectIntersection(
      box,
      endMachine,
      () => {
        interceptor.stop();
        box.classList.remove("filled");

        if (i === 0) {
          slideAnimation.cancel();
          start();
        }
      },
      STAND_BY + 500
    );
  }

  for (let i = 0; i < allBoxes.length; i++) {
    const box = allBoxes[i];

    const interceptor = detectIntersection(
      box,
      photoSensor,
      () => {
        if (slideAnimation.playState === "running") {
          ledStandBy.classList.add("active");
          activePhotoSensor();
          slideAnimation.pause();
          stopAnimationBelt();
          startTimer(3000, ".timer__display-3", () => {});

          setTimeout(() => {
            activeValve();
            box.classList.add("filled");
          }, 3100);

          setTimeout(() => {
            activeBottleFilledSensor();
            inactiveValve();
            document.querySelector(".timer__display-3").innerHTML = "0000 ms";
            ledFull.classList.add("active");
            startTimer(2000, ".timer__display-2", () => {});
          }, STAND_BY - 800);

          setTimeout(() => {
            if (slideAnimation.playState === "paused") {
              playAllAnimations();
              document.querySelector(".timer__display-2").innerHTML = "0000 ms";
              ledFull.classList.remove("active");
            }
          }, STAND_BY + 1800);
        }
      },
      STAND_BY + 1000
    );
  }
}

function setAnimationTranslate() {
  if (sliderContainer) {
    slideAnimation = sliderContainer.animate(
      {
        transform: [
          "translate3d(0,0,0)",
          `translate3d(${sliderContainer.clientWidth + 500}px,0,0)`,
        ],
      },
      {
        duration: 22000,
        easing: "linear",
        fill: "forwards",
      }
    );

    slideAnimation.pause();
  }
}

function playAllAnimations() {
  slideAnimation.play();
  startAnimationBelt();

  setTimeout(() => {
    inactiveBottleFilledSensor();
    inactivePhotoSensor();
    ledStandBy.classList.remove("active");
  }, 200);
}

function stopAnimationBelt() {
  gear.forEach((gear) => (gear.style.animationPlayState = "paused"));
  thereAreTheBreaks.style.animationPlayState = "paused";
  thereAreTheBreaksAgain.style.animationPlayState = "paused";
}

function startAnimationBelt() {
  gear.forEach((gear) => (gear.style.animationPlayState = "running"));
  thereAreTheBreaks.style.animationPlayState = "running";
  thereAreTheBreaksAgain.style.animationPlayState = "running";
}

const activePhotoSensor = () => {
  if (!photoSensor.parentNode.classList.contains("active")) {
    photoSensor.parentNode.classList.add("active");
  }
};

const inactivePhotoSensor = () => {
  if (photoSensor.parentNode.classList.contains("active")) {
    photoSensor.parentNode.classList.remove("active");
  }
};

const activeBottleFilledSensor = () => {
  if (!milkSensor.classList.contains("active")) {
    milkSensor.classList.add("active");
  }
};

const inactiveBottleFilledSensor = () => {
  if (milkSensor.classList.contains("active")) {
    milkSensor.classList.remove("active");
  }
};

const activeValve = () => {
  if (!valve.classList.contains("active")) {
    valve.classList.add("active");
  }
};

const inactiveValve = () => {
  if (valve.classList.contains("active")) {
    valve.classList.remove("active");
  }
};

function detectIntersection(
  element1,
  element2,
  collisionCallback,
  timeDelay = 2000
) {
  let flag = false;

  function intersection() {
    const rect1 = element1.getBoundingClientRect();
    const rect2 = element2.getBoundingClientRect();

    if (
      (rect1.left >= rect2.left &&
        rect1.right <= rect2.right &&
        rect1.top >= rect2.top &&
        rect1.bottom <= rect2.bottom) ||
      (rect2.left >= rect1.left &&
        rect2.right <= rect1.right &&
        rect2.top >= rect1.top &&
        rect2.bottom <= rect1.bottom)
    ) {
      if (!flag) {
        flag = true;
        window.cancelAnimationFrame(animationId);

        collisionCallback();

        setTimeout(() => {
          flag = false;
        }, timeDelay);
      }
    }

    if (!flag) {
      animationId = window.requestAnimationFrame(intersection);
    }
  }

  let animationId = window.requestAnimationFrame(intersection);

  return {
    stop: () => {
      window.cancelAnimationFrame(animationId);
    },
  };
}

function startTimer(duration, selector, callback) {
  let timer = 0;

  let interval = setInterval(function () {
    let milliseconds = timer;

    document.querySelector(selector).textContent =
      milliseconds < 100
        ? `00${milliseconds} ms`
        : milliseconds < 1000
        ? `0${milliseconds} ms`
        : `${milliseconds} ms`;

    if (timer >= duration) {
      clearInterval(interval);
      callback();
    }

    timer += 10;
  }, 10);
}
