interface TurboWarpExtension {
  getInfo(): Record<string, unknown>;
}

interface ScratchTranslate {
  (text: string): string;
  (
    message: { default: string; description?: string },
    placeholders?: Record<string, string | number>,
  ): string;
}

interface ScratchApi {
  extensions: {
    unsandboxed: boolean;
    register(extension: TurboWarpExtension): void;
  };
  BlockType: Record<"COMMAND" | "REPORTER", string>;
  ArgumentType: Record<"COLOR" | "NUMBER" | "STRING", string>;
  Cast: {
    toString(value: unknown): string;
    toNumber(value: unknown): number;
  };
  translate: ScratchTranslate;
  vm?: {
    runtime?: unknown;
  };
}

declare const Scratch: ScratchApi;
