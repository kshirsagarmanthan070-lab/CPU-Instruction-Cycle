let steps = [];
let index = 0;
let acc = 0;
let memory = 4;
let pc = 0;
let ir = "---";
let started = false;
let timerId = null;

const $ = (id) => document.getElementById(id);

function makeProgram() {
  return $("program").value === "add"
    ? [
        { op: "LOAD A, 5", type: "LOAD", n: 5 },
        { op: "ADD A, 3", type: "ADD", n: 3 },
        { op: "STORE A", type: "STORE" }
      ]
    : [
        { op: "LOAD A, 9", type: "LOAD", n: 9 },
        { op: "SUB A, 4", type: "SUB", n: 4 },
        { op: "STORE A", type: "STORE" }
      ];
}

function reset() {
  clearTimeout(timerId);
  steps = makeProgram();
  index = 0;
  acc = 0;
  memory = 4;
  pc = 0;
  ir = "---";
  started = false;

  $("next").disabled = true;
  $("run").disabled = true;
  $("start").disabled = false;

  $("log").textContent = "Ready. Press Start to begin.";
  $("phase").textContent = "Ready to start";
  $("explanation").textContent =
    "The CPU is waiting for an instruction.";

  highlight(null);
  render();
}

function render() {
  $("pc").textContent = pc;
  $("pc2").textContent = pc;
  $("ir").textContent = ir;
  $("ir2").textContent = ir;
  $("acc").textContent = acc;
  $("acc2").textContent = acc;
  $("mem").textContent = memory;
  $("mem2").textContent = memory;

  $("progress").textContent =
    "Instruction: " + index + " / " + steps.length;
}

function highlight(id) {
  ["pcbox", "irbox", "cubox", "alubox", "abox"]
    .forEach((x) => $(x).classList.remove("active"));

  if (id) $(id).classList.add("active");
}

function start() {
  reset();
  started = true;

  $("next").disabled = false;
  $("run").disabled = false;
  $("start").disabled = true;

  $("log").textContent = "Program loaded into memory.\n";
  step();
}

function step() {
  if (!started || index >= steps.length) return;

  clearTimeout(timerId);

  const s = steps[index];
  ir = s.op;

  // FETCH stage
  $("phase").textContent = "FETCH";
  $("explanation").textContent =
    "Fetch: CPU reads instruction " + s.op +
    " from memory address " + pc + ".";

  highlight("pcbox");
  render();

  $("log").textContent +=
    "\nFETCH: Read " + s.op + " at address " + pc + ".";

  timerId = setTimeout(() => {
    if (!started) return;

    // DECODE stage
    $("phase").textContent = "DECODE";
    $("explanation").textContent =
      "Decode: Control Unit identifies the operation " +
      s.type + ".";

    highlight("cubox");
    $("log").textContent +=
      "\nDECODE: Control Unit interprets " + s.op + ".";

    timerId = setTimeout(() => {
      if (!started) return;

      // EXECUTE stage
      $("phase").textContent = "EXECUTE";
      highlight("alubox");

      if (s.type === "LOAD") {
        acc = s.n;
        $("explanation").textContent =
          "Execute: Load " + s.n + " into the accumulator.";
      }

      if (s.type === "ADD") {
        acc += s.n;
        $("explanation").textContent =
          "Execute: ALU adds " + s.n + " to the accumulator.";
      }

      if (s.type === "SUB") {
        acc -= s.n;
        $("explanation").textContent =
          "Execute: ALU subtracts " + s.n +
          " from the accumulator.";
      }

      if (s.type === "STORE") {
        memory = acc;
        $("explanation").textContent =
          "Execute: Store accumulator value " + acc +
          " in memory.";
      }

      $("log").textContent +=
        "\nEXECUTE: " + $("explanation").textContent;

      pc++;
      index++;
      render();
      highlight("abox");

      if (index === steps.length) {
        $("phase").textContent = "Program Completed!";
        $("explanation").textContent =
          "All instructions executed successfully. Final result: " +
          memory + ".";

        $("log").textContent +=
          "\n\nProgram completed! Final memory value = " + memory;

        $("next").disabled = true;
        $("run").disabled = true;
        $("start").disabled = false;
        started = false;
      } else {
        $("phase").textContent = "Step completed";
      }
    }, 500);
  }, 500);
}

$("start").onclick = start;
$("next").onclick = step;

$("run").onclick = () => {
  if (!started) return;

  $("next").disabled = true;
  $("run").disabled = true;

  function loop() {
    if (index < steps.length && started) {
      step();
      timerId = setTimeout(loop, 1700);
    }
  }

  loop();
};

$("reset").onclick = reset;
$("program").onchange = reset;

function answer(n) {
  $("quizresult").textContent = n === 0
    ? "Correct! Fetch brings the instruction from memory."
    : "Try again. Fetch is the stage that retrieves the instruction.";
}

reset();