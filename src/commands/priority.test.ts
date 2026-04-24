import { Command } from "commander";
import { registerPriorityCommands } from "./priority";
import * as prioritizer from "../priority/prioritizer";

jest.mock("../priority/prioritizer");

const mockedPrioritizer = prioritizer as jest.Mocked<typeof prioritizer>;

function makeProgram(): Command {
  const program = new Command();
  program.exitOverride();
  registerPriorityCommands(program);
  return program;
}

describe("priority commands", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("priority list", () => {
    it("should list all priorities", async () => {
      mockedPrioritizer.getPriorities.mockResolvedValue({
        frontend: 10,
        backend: 5,
        database: 1,
      });

      const consoleSpy = jest.spyOn(console, "log").mockImplementation();
      const program = makeProgram();

      await program.parseAsync(["node", "test", "priority", "list"]);

      expect(mockedPrioritizer.getPriorities).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("frontend")
      );
      consoleSpy.mockRestore();
    });

    it("should display message when no priorities set", async () => {
      mockedPrioritizer.getPriorities.mockResolvedValue({});

      const consoleSpy = jest.spyOn(console, "log").mockImplementation();
      const program = makeProgram();

      await program.parseAsync(["node", "test", "priority", "list"]);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("No priorities")
      );
      consoleSpy.mockRestore();
    });
  });

  describe("priority set", () => {
    it("should set priority for a profile", async () => {
      mockedPrioritizer.setProfilePriority.mockResolvedValue(undefined);

      const consoleSpy = jest.spyOn(console, "log").mockImplementation();
      const program = makeProgram();

      await program.parseAsync([
        "node",
        "test",
        "priority",
        "set",
        "frontend",
        "10",
      ]);

      expect(mockedPrioritizer.setProfilePriority).toHaveBeenCalledWith(
        "frontend",
        10
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("frontend")
      );
      consoleSpy.mockRestore();
    });

    it("should reject non-numeric priority values", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      const program = makeProgram();

      await program.parseAsync([
        "node",
        "test",
        "priority",
        "set",
        "frontend",
        "abc",
      ]);

      expect(mockedPrioritizer.setProfilePriority).not.toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("valid number")
      );
      consoleSpy.mockRestore();
    });
  });

  describe("priority remove", () => {
    it("should remove priority for a profile", async () => {
      mockedPrioritizer.removeProfilePriority.mockResolvedValue(undefined);

      const consoleSpy = jest.spyOn(console, "log").mockImplementation();
      const program = makeProgram();

      await program.parseAsync([
        "node",
        "test",
        "priority",
        "remove",
        "frontend",
      ]);

      expect(mockedPrioritizer.removeProfilePriority).toHaveBeenCalledWith(
        "frontend"
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("frontend")
      );
      consoleSpy.mockRestore();
    });
  });

  describe("priority top", () => {
    it("should display the highest priority profile", async () => {
      mockedPrioritizer.getHighestPriorityProfile.mockResolvedValue("frontend");

      const consoleSpy = jest.spyOn(console, "log").mockImplementation();
      const program = makeProgram();

      await program.parseAsync(["node", "test", "priority", "top"]);

      expect(mockedPrioritizer.getHighestPriorityProfile).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("frontend")
      );
      consoleSpy.mockRestore();
    });

    it("should display message when no profiles have priority", async () => {
      mockedPrioritizer.getHighestPriorityProfile.mockResolvedValue(null);

      const consoleSpy = jest.spyOn(console, "log").mockImplementation();
      const program = makeProgram();

      await program.parseAsync(["node", "test", "priority", "top"]);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("No profiles")
      );
      consoleSpy.mockRestore();
    });
  });
});
