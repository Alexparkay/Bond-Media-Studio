export class ClaudeCodeDiagnostic {
  private static taskCount = 0;
  private static completedTasks = 0;
  private static messages: string[] = [];

  static reset() {
    this.taskCount = 0;
    this.completedTasks = 0;
    this.messages = [];
  }

  static logMessage(type: string, content: string, metadata?: any) {
    const timestamp = new Date().toISOString();
    const message = `[${timestamp}] ${type}: ${content}`;
    this.messages.push(message);
    
    console.log(`[Claude Code] ${message}`);
    
    if (metadata) {
      console.log(`[Claude Code Metadata]`, metadata);
    }

    // Track todo list items
    if (type === "plan" && metadata?.plan) {
      this.taskCount = metadata.plan.length;
      console.log(`[Claude Code] Created todo list with ${this.taskCount} tasks`);
    }

    // Track completed tasks
    if (type === "create" || type === "edit") {
      this.completedTasks++;
      console.log(`[Claude Code] Progress: ${this.completedTasks}/${this.taskCount} tasks completed`);
    }
  }

  static getSummary() {
    return {
      totalTasks: this.taskCount,
      completedTasks: this.completedTasks,
      completionRate: this.taskCount > 0 ? (this.completedTasks / this.taskCount) * 100 : 0,
      messages: this.messages,
    };
  }

  static checkCompletion(): boolean {
    if (this.taskCount === 0) {
      console.log(`[Claude Code] Warning: No todo list was created`);
      return false;
    }

    const isComplete = this.completedTasks >= this.taskCount;
    if (!isComplete) {
      console.log(`[Claude Code] WARNING: Only completed ${this.completedTasks}/${this.taskCount} tasks!`);
      console.log(`[Claude Code] Missing ${this.taskCount - this.completedTasks} tasks`);
    } else {
      console.log(`[Claude Code] SUCCESS: All ${this.taskCount} tasks completed!`);
    }

    return isComplete;
  }
} 