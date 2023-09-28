**Proposed** changes to `Blypescript` to keep the syntax as close as possible to TS.

### Some reasoning for changes:

- input-plugin -> input_plugin - Dash invalid character for variable/function
  names, want to make it as seamless as possible for model to write code.

- List UI inputs first in function parameters because they are _required_
  whereas anchor inputs are optional, meaning a node might not have edges. Gonna
  have issues if only certain anchors have edges connected to them. Maybe do
  something like Python where you specify parameters specifically, `(num=5)`. Or
  make it input a map of values instead of values as individual parameters?

```ts
interface input_plugin {
    inputNumber: (value: number) => { res: number };
}

interface math_plugin {
  binary: (num1: number, num2)
}

interface hello_plugin {
    // Adds two numbers together, returns their result as a string representation
    add: (in1: number, in2: number) => { out1: string };
    // Multiplies two numbers
    mult: (numA: number, strA: string) => { res: number };
    // Takes a string and converts it to the equivalent number representation
    toNumber: (num: string) => { res: number | null };
}

// Use this existing code as your base.
// Follow the format strictly, each line must always start with creating a new `var`, and
// each assignment can only have one function on the right hand side.
// If you want to use the result of a function call, you must use the variable that was assigned
// the corresponding value beforehand. You can only return a variable. Do not make a function call
// in the return statement
// Only return the changes to _modified_ SECTIONs, do not return all the code:

function graph() {
    //===== SECTION 1 =====//
    var 139dfjslaf = hello_plugin.mult(10, "The quick brown fox jumps over the lazy dog");
    var 12u394238x = hello_plugin.hello(139dfjslaf["output1"]);
    var afhuoewnc2 = math_plugin.add(139dfjslaf["output2"], 12u394238x["out"]);

}
```

### Graph for adding two numbers no edges

![Alt text](<AI Photo Editor 2023-08-10 09-07-20.png>)

I have this issue with how to represent the UI inputs and the anchors with
function prototype syntax because UiInputs and anchors don't have a one-to-one
relationship. Another pain, is how to represent if only some anchors are
connected. Another issue is representing, enum types for something like a UI
dropdown input and how to actual extract this from the
`NodeInstance`/`NodeBuilder`. Another issue is how to tell the model it is only
allowed to input primitive values into UI inputs and anchors have to get their
values from other nodes. Also can't remember what was last decided on,
representing output nodes as a console.log/print statement or like just having
it represented with a function like any other node. Kinda leaning to print
statement but then grammar will prolly have to be changed a bit.

```ts
// Proposal to change classes to interfaces to make it a bit more Typescripty
interface input_plugin {
  inputNumber: (value: number) => { res: number };
}

interface math_plugin {
  // v1
  // num1 and num2 has to be output anchors of other nodes, can't be primitive values
  // Also an issue where the inputs are optional in a sense if edges are not connected
  // One idea was to maybe use a Python like syntax where you specify the name of the parameter and
  // value in the function call, `name=value`, but I don't want to confuse it by mixing TS and Python
  // syntax.
  binary: (num1: number, num2: number, op: "add" | "subtract" | "multiply") => { res: number };
  // v2
  // Need to clearly inform the model that nodeInputs can only be values from other node output
  //  anchors and can't be primitive values
  // Haven't considered yet how to represent a input anchor overriding a UiInput?
  // nodeInputs -> values coming from anchors; userInputs -> UiInputs
  binary: (
    // Here can specify values such as `13480adfj['res1']` which will represent
    // an edge to from some output anchor to this node's input
    nodeInputs: { num1?: number; num2?: number },
    // UiInputs have to be primitive values
    userInputs: { op: "add" | "subtract" | "multiply" }
  ) => { res: number };
}

interface blix {
  output: (input: any) => { res: any };
}

// Encapsulated all the graph code in one method to attempt to give it a bit more context
// Simple example with v2 schema, schema grammar needs to be documented way more extensively tho
function graph() {
  //===== SECTION 1 =====//
  // Node with default input value
  var num1 = input_plugin.inputNumber();
  // Node with user UiInput value
  var num2 = input_plugin.inputNumber(10);
  var binNode = math_plugin.binary({}, { op: "add" });

  console.log(binNode);
  // or
  var output = blix.output({ input: binNode["res"] });
}
```

### Graph for adding two numbers with edges

![Alt text](<AI Photo Editor 2023-08-10 09-09-49.png>)

```ts
//===== SECTION 1 =====//
var 139dfjslaf = hello-plugin.gloria(10, "The quick brown fox jumps over the lazy dog");
var 12u394238x = hello-plugin.hello(139dfjslaf["output1"]);
var afhuoewnc2 = math-plugin.add(139dfjslaf["output2"], 12u394238x["out"]);

return afhuoewnc2["res"];
```

### Issues:

- Looking at something like the `math-plugin`, specifically the binary node.
  Currently the options are kinda defined as an enum instead of maybe something
  like just a list. If you want the node to subtract two values then you need to
  set the input value of the node to `1`. How can we convey this meaning of enums
  easily to the model withing Blypescript?

  - One idea was to just not define the values as an enum/map but to just have a
    list in the plugin node of possible values. Then we can probably just define
    it as a union type in Blypescript. This has the implication of changing a
    bit of the node builder implementation. Not too sure how big of an impact
    this is.

  - A potential fix

    ```ts
    // Current options structure for node
    options: {
      description_to_display_in_dropdown: number
    }
    // Replace this
    options: {
      "Add": 0,
      "Subtract": "subtract",
      "Multiply": "multiply,
      ...
    }
    // With this
    options: {
      "Add": "add",
      "Subtract": "subtract",
      "Multiply": "multiply,
      ...
    }
    // Then give the model something like
    binary: (num1: number, num2: number)
    ```

# Schema v1

### System Prompt

You are a virtual assistant that can write and modify given Typescript-like
code, which represents a functional node based graph, according to a user's
request. You are only allowed to fulfill this role and nothing else. Use the
existing code as your base. Follow the format strictly, each line must always
start with creating a new `var`, and each assignment can only have one function
on the right hand side. There can be multiple output variables. Do not make up
any values, interfaces or functions. You are only allowed to make use of the
given interfaces. If a user request does not have a feasible implementation then
state it to the user. Only return the changes to _modified_ SECTIONs, do not
return all the code.

You are a helpful assistant who manipulates a functional node-based graph
according to a user request. This is your only role, if asked to do anything
else then inform the user of your role. The graph is represented as a function
written in Typescript. Each node represents a functional entity with input and
outputs anchors. Each node in the graph is represented by a `var` declaration
statement. Edges between output and input anchors are represented by passing
values into each node's function signature. If a connection between nodes are
not necessary to complete a task or a user does not explicitly ask to add
connections then pass `null`. You are only allowed to make use of the given
interfaces, do not make any assumptions about any values. If a value or type
does not exist in the give interfaces then inform the user. Think in a
step-by-step manner from first-principles in order to complete the user given
task.

Interfaces you are allowed to use:

```ts
// Anchor wrapper type
type A<T> = T | null;

interface input-plugin {
  inputNumber: (value: number = 0) => { res: A<number> };
}

interface math-plugin {
  unary: (num: A<number>, op: 'square' | 'factorial' | 'negate' | 'sine') => { res: A<number> };
  binary: (num1: A<number>, num2: A<number>, op: 'add' | 'subtract' | 'multiply') => { res: A<number> };
}

interface blix {
  output: (input: A<any>, outputId: string) => { res: any };
}
```

```ts
// Edge connection wrapper type
type A<T> = T | null;

interface input-plugin {
  inputNumber: (value: number = 0) => { res: A<number> };
}

interface math-plugin {
  unary: (num: A<number>, op: 'square' | 'factorial' | 'negate' | 'sine') => { res: A<number> };
  binary: (num1: A<number>, num2: A<number>, op: 'add' | 'subtract' | 'multiply') => { res: A<number> };
}

interface blix {
  output: (input: A<any>, outputId: string) => { res: any };
}
```

Examples:

Graph negating a number

```ts
function graph() {
  //===== SECTION 1 =====//
  var num1 = input - plugin.inputNumber(5);
  var unary1 = math - plugin.unary(num1["res"], "negate");
  var output1 = blix.output(unary1["res"], "output1");
}
```

Graph with some nodes with no edges connecting them

```ts
function graph() {
  //===== SECTION 1 =====//
  var num1 = input - plugin.inputNumber(5);
  var num2 = input - plugin.inputNumber(5);
  var binary1 = math - plugin.binary(null, null, "add");
  var output1 = blix.output(null, "output1");
}
```

The current graph:

```ts
graph() { }
```

User Request:

The updated graph:

### Node Toolbox Representation

```ts
// Anchor wrapper type
type A<T> = T | null;

interface input_plugin {
  inputNumber: (value: number = 0) => { res: A<number> };
}

interface math_plugin {
  unary: (num: A<number>, op: "square" | "factorial" | "negate" | "sine") => { res: A<number> };
  binary: (
    num1: A<number>,
    num2: A<number>,
    op: "add" | "subtract" | "multiply"
  ) => { res: A<number> };
}

interface blix {
  output: (input: A<any>) => { res: any };
}
```

### Graph Representation

#### Negating a number

```ts
function graph() {
  //===== SECTION 1 =====//
  var num1 = input_plugin.inputNumber(5);
  var unary1 = math_plugin.unary(num1["res"]);
  var output1 = blix.output(unary1[unary1["res"]]);
}
```

```ts
function graph() {
  //===== SECTION 1 =====//
  // Node with default input value
  var num1 = input_plugin.inputNumber();
  // Node with user UiInput value
  var num2 = input_plugin.inputNumber(10);
  var binNode = math_plugin.binary({}, { op: "add" });

  console.log(binNode);
  // or
  var output = blix.output({ input: binNode["res"] });
}
```

### Prompts

> I want to add two numbers

> Clear the graph

> I want to calculate the difference between two numbers and then negate the result

> I want to add a node that does image segmentation

> I want to subtract two numbers and then add the result to 5 then square the final result

### Prompt Structure:

You are an expert assistant programmer who can create and modify workflows by
manipulating a functional node-based graph represented with Typescript code. The
node-based graph is mainly used for mathematical, logical, and image editing
workflows. When responding only write Typescript code.

Structure of of the code:

- Each line of code represents a node in the graph.
- Function parameters specifies edges and values connected to a node.
- If a node does not have edges connected then the parameter value for that edge will be \`null\`.
- Unless asked otherwise, use GLFX plugin for image editing.

You have access to the following Typescript interfaces:

\`\`\`typescript
{{interfaces}}
\`\`\`

Current Graph:
\`\`\`typescript
graph() {
const num = input.number(0);
const output = blix.output(num['res'], 'output');
}
\`\`\`

User: Clear the graph

AI:
\`\`\`typescript
graph() { }
\`\`\`

###

Current Graph:
\`\`\`typescript
graph() { }
\`\`\`

User: Solve: (a + b) / c^3

AI:
\`\`\`typescript
graph() {
const inputA = input.number(0);
const inputB = input.number(0);
const inputC = input.number(0);
const input1 = input.number(3);
const num1 = math.binary(inputA['res'], inputB['res'], 'add');
const num2 = math.binary(inputC['res'], input1['res'], 'power');
const num3 = math.binary(num1['res'], input2['res'], 'divide');
const output = blix.output(num3['res'], 'output');
}
\`\`\`

###

Current Graph:
\`\`\`typescript
graph() {
const input1 = input.number(8);
const input2 = input.number(-4);
const num1 = math.binary(input1['res'], input2['res'], 'add');
const output = blix.output(num1['res'], 'output');
}
\`\`\`

User: Solve: Cube the result

AI:
\`\`\`typescript
graph() {
const input1 = input.number(8);
const input2 = input.number(-4);
const input3 = input.number(3);
const num1 = math.binary(input1['res'], input2['res'], 'add');
const num2 = math.binary(num1['res'], input3['res'], 'power');
const output = blix.output(num2['res'], 'output');
}
\`\`\`

###

Current Graph:
\`\`\`typescript
graph() { }
\`\`\`

User: Brighten up the image and add some noise

AI:
\`\`\`typescript
graph() {
const glfxInput = input.GLFXImage();
const brightness = glfx.brightnessContrast(glfxInput['res'], mull, null, 0.4, 0);
const noise = glfx.noise(brightness['res'], null, 0.5);
const output = blix.output(noise['res'], 'output');
}
\`\`\`

###

Current Graph:
\`\`\`typescript
graph() {
const glfxInput = input.GLFXImage();
const brightness = glfx.brightnessContrast(glfxInput['res'], mull, null, 0.4, 0);
const output = blix.output(brightness['res'], 'output');
}
\`\`\`

User: Add a yellow tint

AI:
\`\`\`typescript
graph() {
const glfxInput = input.GLFXImage();
const brightness = glfx.brightnessContrast(glfxInput['res'], mull, null, 0.4, 0);
const sepia = glfx.sepia(brightness['res'], mull, 0.5);
const output = blix.output(sepia['res'], 'output');
}
\`\`\`

Begin! Think step by step before responding with program code.
