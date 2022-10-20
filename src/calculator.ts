const showWaitTimeout: number = 3000;

class Memory {

  private static _value: number = 0;

  // @ts-expect-error null
  private static _memoryEl: HTMLElement = document.querySelector(".container__memory span");

  static get value(): number {
    return Memory._value; 
  }

  static set value(newValue: number) {
    if (newValue === 0 || newValue) {
      Memory._value = newValue;
      Memory._memoryEl.textContent = Memory._value.toString();
      showMemoryChange();
    }
  }
}

// @ts-expect-error null
let containerInputEl: HTMLElement = document.querySelector(".container__input");
// @ts-expect-error null
let inputEl: HTMLInputElement = containerInputEl.querySelector("input");
// @ts-expect-error null
let messageEl: HTMLElement = document.querySelector(".container__message");

/**
 * If something but waiting happens, we need to prevent any timeouted
 * showWait() from doing something.
 */
let showWaitQueue: NodeJS.Timeout[] = [];

function showWait(timeout?: NodeJS.Timeout) {
  let canShowWait: boolean = true;

  if (timeout) {
    let index: number = showWaitQueue.indexOf(timeout);
    if (index !== -1) {
      showWaitQueue.splice(index, 1);
      if (showWaitQueue[index]) canShowWait = false;
    }
  }

  if (canShowWait) {
    let img: HTMLImageElement = new Image();
    img.onload = () => {
      containerInputEl.style.backgroundImage = `url(${img.src})`;
    };
    img.src = "assets/pinky-waiting.png";
  }
}

function setTimeoutShowWait(ms: number = showWaitTimeout) {
  let timeout: NodeJS.Timeout = setTimeout(() => showWait(timeout), ms);
  showWaitQueue.push(timeout);
}

function showError(message: string) {
  const images: string[] = ["assets/pinky-error-01.png", "assets/pinky-error-02.png", "assets/pinky-error-03.png"];
  
  if (!images.find(image => containerInputEl.style.backgroundImage.includes(image))) {
    let img: HTMLImageElement = new Image();
    img.onload = () => containerInputEl.style.backgroundImage = `url(${img.src})`; 
    img.src = images[Math.floor(Math.random() * images.length)];
  }
  
  messageEl.innerText = message;
  messageEl.style.opacity = "1";
  inputEl.classList.remove("error-animation");
  inputEl.offsetWidth;
  inputEl.classList.add("error-animation");
  setTimeoutShowWait();
}

function showSuccess() {
  let img: HTMLImageElement = new Image();
  img.onload = () => {
    containerInputEl.style.backgroundImage = `url(${img.src})`;
    messageEl.innerText = "no error";
    messageEl.style.opacity = "0";
  };
  img.src = "assets/pinky-success.png";
  setTimeoutShowWait();
}

function showMemoryChange() {
  let img: HTMLImageElement = new Image();
  img.onload = () => {
    containerInputEl.style.backgroundImage = `url(${img.src})`;
  };
  img.src = "assets/pinky-memory-change.png";
  setTimeoutShowWait();
}

function showTyping() {
  let img: HTMLImageElement = new Image();
  img.onload = () => {
    containerInputEl.style.backgroundImage = `url(${img.src})`;
  };
  img.src = "assets/pinky-typing.png";
  setTimeoutShowWait(1000);
}

let buttonClickHandlers: ((value: string) => boolean | void)[] = [
  (value) => !value,
  () => { new Audio("assets/sound/click.wav")?.play(); },
  (value) => {
    switch (value) {
      case "MR":
        Memory.value = 0;
        return true;
        case "M-":
        if (inputEl.value.match(/^\d+$/)) Memory.value -= parseFloat(inputEl.value);
        return true;
      case "M+":
        if (inputEl.value.match(/^\d+$/)) Memory.value += parseFloat(inputEl.value);
        return true;
    }
  },
  (value) => {
    if (value === "=") {
      if (!inputEl.value) {
        return true;
      }
      if (inputEl.value.match(/^\d+$/)) {
        showSuccess();
        return true;
      }

      // calculate
      throw new Error("???");
    }
  },
  (value) => {
    inputEl.value += value;
    return true;
  },
];

let buttons: NodeListOf<HTMLInputElement> = document.querySelectorAll(".container__btns button");
buttons.forEach(btn => btn.addEventListener("click", (event) => {
  let text = (event.target as HTMLInputElement)?.innerText;
  try {
    for (let handler of buttonClickHandlers) {
      if (handler(text)) return;
    }
  } catch (error: any) {
    showError(error.message);
  }
}));

inputEl.addEventListener("input", showTyping);