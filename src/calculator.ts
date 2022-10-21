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

interface Handler {
  handle(expression: string): string;
  next?: Handler;
}

class Processor {

  private static handlers: Handler[] = [];

  static {
    const regexOperand: RegExp     = /\-?\d+\.?\d*/g;
    const regexNumber: RegExp      = /^\-?\d+\.?\d*$/;
    const regexAddition: RegExp    = /^\-?\d+\.?\d*\s*\+\s*\d+\.?\d*/;
    const regexSubsruction: RegExp = /^\-?\d+\.?\d*\s*\-\s*\d+\.?\d*/;
    const regexMultiply: RegExp    = /^\-?\d+\.?\d*\s*\×\s*\d+\.?\d*/;
    const regexDivision: RegExp    = /^\-?\d+\.?\d*\s*\÷\s*\d+\.?\d*/;
    const regexSquareRoot: RegExp  = /^√\d+\.?\d*/;

    const unaryOperation: (expression: string, regex: RegExp) => number | void =
    (expression: string, regex: RegExp) => {
      let match: RegExpMatchArray | null = expression.match(regex);        
      if (match) {
        let operands: RegExpMatchArray | null = match[0]?.match(regexOperand);
        if (operands && operands.length >= 1) {
          return parseFloat(operands[0]);
        }
      }
    };

    const binaryOperation: (expression: string, regex: RegExp) => { 1: number, 2: number } | void =
    (expression: string, regex: RegExp) => {
      let match: RegExpMatchArray | null = expression.match(regex);        
      if (match) {
        let operands: RegExpMatchArray | null = match[0]?.match(regexOperand);
        if (operands && operands.length >= 2) {
          let operand1: number = parseFloat(operands[0]);
          let operand2: number = parseFloat(operands[1]);
          return { 1: operand1, 2: operand2 };
        }
      }
    };

    // last handler
    this.handlers.unshift({
      handle() {
        throw new Error("Invalid expression");
      }
    });

    // square root handler
    this.handlers.unshift({
      handle(expression: string): string {
        const regex: RegExp = regexSquareRoot;        
        const operand: number | void = unaryOperation(expression, regex);
        if (operand) {
          console.log("√", operand);
          return expression.replace(regex, Math.sqrt(operand).toString());
        } else {
          return this.next?.handle(expression) || "";
        }
      },
      next: this.handlers[0]
    });

    // division handler
    this.handlers.unshift({
      handle(expression: string): string {
        const regex: RegExp = regexDivision;        
        const operands: { 1: number, 2: number } | void = binaryOperation(expression, regex);
        if (operands) {
          console.log("÷", operands);
          return expression.replace(regex, (operands[1] / operands[2]).toString());
        } else {
          return this.next?.handle(expression) || "";
        }
      },
      next: this.handlers[0]
    });

    // multiply handler
    this.handlers.unshift({
      handle(expression: string): string {
        const regex: RegExp = regexMultiply;        
        const operands: { 1: number, 2: number } | void = binaryOperation(expression, regex);
        if (operands) {
          console.log("×", operands);
          return expression.replace(regex, (operands[1] * operands[2]).toString());
        } else {
          return this.next?.handle(expression) || "";
        }
      },
      next: this.handlers[0]
    });

    // subtraction handler
    this.handlers.unshift({
      handle(expression: string): string {
        const regex: RegExp = regexSubsruction;        
        const operands: { 1: number, 2: number } | void = binaryOperation(expression, regex);
        if (operands) {
          console.log("+", operands);
          return expression.replace(regex, (operands[1] + operands[2]).toString());
        } else {
          return this.next?.handle(expression) || "";
        }
      },
      next: this.handlers[0]
    });

    // addition handler
    this.handlers.unshift({
      handle(expression: string): string {
        const regex: RegExp = regexAddition;        
        const operands: { 1: number, 2: number } | void = binaryOperation(expression, regex);
        if (operands) {
          console.log("+", operands);
          return expression.replace(regex, (operands[1] + operands[2]).toString());
        } else {
          return this.next?.handle(expression) || "";
        }
      },
      next: this.handlers[0]
    });

    // simple handler
    this.handlers.unshift({
      handle(expression: string): string {
        const regex: RegExp = regexNumber;        
        if (expression.match(regex)) {
          return expression;
        } else {
          return this.next?.handle(expression) || "";
        }
      },
      next: this.handlers[0]
    });

    // translate handler
    this.handlers.unshift({
      handle(expression: string): string {
        expression = expression.trim();
        expression = expression.replace(/,/g, ".");
        expression = expression.replace(/\//g, "÷");
        expression = expression.replace(/\*/g, "×");
        const regex: RegExp = regexNumber;        
        if (expression.match(regex)) {
          return expression;
        } else {
          return this.next?.handle(expression) || "";
        }
      },
      next: this.handlers[0]
    });
  }

  static process(expression: string): string {
    let current: string = expression, previous: string;
    do {
      previous = current;
      current = this.handlers[0].handle(current); 
      console.log(current);           
    } while (current !== previous);
    return current;
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
        Memory.value -= parseFloat(inputEl.value);
        return true;
      case "M+":
        Memory.value += parseFloat(inputEl.value);
        return true;
    }
  },
  (value) => {
    if (value === "=") {
      if (inputEl.value) {
        inputEl.value = Processor.process(inputEl.value);
        showSuccess();
      }
      return true;
    }
  },
  (value) => {
    let pos: number = inputEl.selectionStart || 0;
    inputEl.value = [inputEl.value.slice(0, pos), value, inputEl.value.slice(pos)].join("");
    inputEl.selectionStart = pos + 1;
    inputEl.selectionEnd = pos + 1;
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

document.addEventListener("keypress", function(event) {
  if (event.key === "Enter") {
    for (let btn of buttons) {
      if (btn.textContent === "=") {
        btn.click();
        break;
      };
    }
    event.preventDefault();
  }
});