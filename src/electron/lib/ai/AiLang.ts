abstract class AiLangProgram {
  public abstract diff(other: AiLangProgram): AiLangDiff;
  public abstract get toString(): string;
}

abstract class AiLangStatement {
  public abstract get toString(): string;

  constructor(
    public readonly nodeId: string,
    public readonly nodeSignature: `${string}.${string}`,
    public readonly nodeInputs: string[]
  ) {}

  checkEquals(other: BlypescriptStatement): boolean {
    return (
      this.nodeId === other.nodeId &&
      this.nodeSignature === other.nodeSignature &&
      this.nodeInputs.length === other.nodeInputs.length &&
      this.nodeInputs.every((input, i) => input === other.nodeInputs[i])
    );
  }
}

type AiLangDiff = {
  added: AiLangStatement[];
  removed: AiLangStatement[];
};

class BlypescriptProgram implements AiLangProgram {
  constructor(public readonly statements: BlypescriptStatement[]) {}

  public static fromString(program: string): BlypescriptProgram | null {
    const statements = program.split("\n");
    const resStatements = [];
    const usedNodeIds = new Set<string>();

    for (let s = 0; s < statements.length; s++) {
      if (statements[s].trim().length === 0) continue;

      const statement = BlypescriptStatement.fromString(statements[s]);

      // TODO: Fail + return error message to the AI when a statement is invalid
      if (statement === null) return null; // Invalid statement
      if (usedNodeIds.has(statement.nodeId)) return null; // Duplicate nodeId

      statement.lineNumber = s;
      resStatements.push(statement);
      usedNodeIds.add(statement.nodeId);
    }

    return new BlypescriptProgram(resStatements);
  }

  public get toString(): string {
    let res = "";
    for (let s = 0; s < this.statements.length; s++) {
      if (s % 5 === 0) res += `//===== SECTION ${s / 5} =====//\n`;

      res += this.statements[s].toString + "\n";
    }
    return res;
  }

  // Computes a diff between two BlypescriptPrograms
  // Assumes that all statement lines are unique within a program by the nodeId
  // (this is enforced by the constructor)
  public diff(other: BlypescriptProgram): AiLangDiff {
    // Compute list difference (this) \ (other)
    const removed = this.statements.filter(
      (ts) => !other.statements.some((os) => ts.checkEquals(os))
    );

    // Compute list difference (other) \ (this)
    const added = other.statements.filter(
      (os) => !this.statements.some((ts) => os.checkEquals(ts))
    );

    return { added, removed };
  }
}

// var 139dfjslaf = hello-plugin.gloria(10, "The quick brown fox jumps over the lazy dog");
// var 12u394238x = hello-plugin.hello(139dfjslaf["output1"]);
// var afhuoewnc2 = math-plugin.add(139dfjslaf["output2"], 12u394238x["out"]);
const BlypescriptStatementRegex =
  /\s*var\s*([a-zA-Z_]\w+)\s*=\s*([\w-]+)\s*\.\s*([\w-]+)\s*\((.*)\)\s*;/;

// A single line in a BlypescriptProgram
class BlypescriptStatement extends AiLangStatement {
  public lineNumber?: number;

  public static fromString(statement: string): BlypescriptStatement | null {
    const match = statement.match(BlypescriptStatementRegex);
    if (match) {
      return new BlypescriptStatement(
        match[1],
        `${match[2]}.${match[3]}`,

        // TODO: Look into being a bit smarter about checking/storing input 'arguments'
        match[4].split(",").map((s) => s.trim())
      );
    }
    return null;
  }

  public get toString(): string {
    return `var ${this.nodeId} = ${this.nodeSignature}(${this.nodeInputs.join(", ")});`;
  }
}
